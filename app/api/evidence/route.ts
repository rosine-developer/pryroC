import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

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

    const body = await request.json();
    const { title, description, type, fileName, filePath, fileSize, mimeType, tags, requirementId, auditId } = body;

    if (!title || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate evidence ID
    const count = await prisma.evidence.count();
    const evidenceId = `EV-${String(count + 1).padStart(5, '0')}`;

    const evidence = await prisma.evidence.create({
      data: {
        evidenceId,
        title,
        description,
        type,
        fileName,
        filePath,
        fileSize: fileSize || 0,
        mimeType,
        tags: tags || '',
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
