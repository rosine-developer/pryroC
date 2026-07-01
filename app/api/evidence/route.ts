import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const classification = searchParams.get('classification');

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { evidenceId: { contains: search } },
      ];
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (classification && classification !== 'all') {
      where.classification = classification;
    }

    const evidence = await prisma.evidence.findMany({
      where,
      include: {
        uploadedBy: { select: { firstName: true, lastName: true } },
        approvedBy: { select: { firstName: true, lastName: true } },
        requirement: { select: { title: true, requirementId: true } },
        audit: { select: { title: true, auditNumber: true } },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json(evidence);
  } catch (error) {
    console.error('Fetch evidence error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const tags = formData.get('tags') as string;
    const classification = formData.get('classification') as string || 'EVIDENCE';
    const requirementId = formData.get('requirementId') as string;
    const auditId = formData.get('auditId') as string;

    if (!title || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let filePath = '';
    let fileName = '';
    let fileSize = 0;
    let mimeType = '';

    if (file) {
      fileName = file.name;
      fileSize = file.size;
      mimeType = file.type;
      
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });
        
        const uniqueName = `${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
        const fullPath = path.join(uploadDir, uniqueName);
        
        await writeFile(fullPath, buffer);
        filePath = `/uploads/${uniqueName}`;
      } catch (err) {
        console.error('File upload failed:', err);
        return NextResponse.json({ error: 'Failed to write file to local disk.' }, { status: 500 });
      }
    }

    // Generate evidence ID
    const count = await prisma.evidence.count();
    const evidenceId = `EV-${String(count + 1).padStart(5, '0')}`;

    const evidence = await prisma.evidence.create({
      data: {
        evidenceId,
        title,
        description: description || '',
        type: type as any,
        fileName: fileName || '',
        filePath,
        fileSize,
        mimeType: mimeType || '',
        tags: tags || '',
        classification: classification as any,
        status: 'DRAFT',
        uploadedById: user.id,
        requirementId: requirementId || null,
        auditId: auditId || null,
      },
    });

    // Create audit trail
    await prisma.auditTrail.create({
      data: {
        action: 'UPLOAD',
        entityType: 'EVIDENCE',
        entityId: evidence.id,
        userId: user.id,
        description: `Uploaded evidence: ${evidence.title}`,
        newValue: JSON.stringify(evidence),
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'EVIDENCE_UPLOADED',
        title: `Evidence "${evidence.title}" uploaded`,
        description: `Evidence ID: ${evidence.evidenceId}`,
        entityType: 'EVIDENCE',
        entityId: evidence.id,
      },
    });

    return NextResponse.json(evidence);
  } catch (error) {
    console.error('Create evidence error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
