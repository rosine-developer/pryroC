import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.evidence.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
    }

    // If there is a file in local uploads, delete it
    if (existing.filePath && existing.filePath.startsWith('/uploads/')) {
      try {
        const fullPath = path.join(process.cwd(), 'public', existing.filePath);
        await unlink(fullPath);
      } catch (err) {
        console.error('Failed to delete local file:', err);
      }
    }

    await prisma.evidence.delete({
      where: { id: params.id },
    });

    await prisma.auditTrail.create({
      data: {
        action: 'DELETE',
        entityType: 'EVIDENCE',
        entityId: params.id,
        userId: user.id,
        description: `Deleted evidence: ${existing.title}`,
        oldValue: JSON.stringify(existing),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete evidence error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
