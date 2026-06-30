import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET(
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

    const regulation = await prisma.regulation.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { requirements: true },
        },
      },
    });

    if (!regulation) {
      return NextResponse.json({ error: 'Regulation not found' }, { status: 404 });
    }

    return NextResponse.json(regulation);
  } catch (error) {
    console.error('Fetch regulation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
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

    const body = await request.json();
    const existing = await prisma.regulation.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Regulation not found' }, { status: 404 });
    }

    const regulation = await prisma.regulation.update({
      where: { id: params.id },
      data: body,
    });

    await prisma.auditTrail.create({
      data: {
        action: 'UPDATE',
        entityType: 'REGULATION',
        entityId: regulation.id,
        userId: user.id,
        description: `Updated regulation: ${regulation.name}`,
        oldValue: JSON.stringify(existing),
        newValue: JSON.stringify(regulation),
      },
    });

    return NextResponse.json(regulation);
  } catch (error) {
    console.error('Update regulation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const existing = await prisma.regulation.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Regulation not found' }, { status: 404 });
    }

    await prisma.regulation.delete({
      where: { id: params.id },
    });

    await prisma.auditTrail.create({
      data: {
        action: 'DELETE',
        entityType: 'REGULATION',
        entityId: params.id,
        userId: user.id,
        description: `Deleted regulation: ${existing.name}`,
        oldValue: JSON.stringify(existing),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete regulation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
