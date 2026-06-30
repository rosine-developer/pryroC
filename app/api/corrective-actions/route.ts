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
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const findingId = searchParams.get('findingId');
    const assignedToId = searchParams.get('assignedToId');

    const where: any = {};

    if (search) {
      where.OR = [
        { description: { contains: search } },
        { actionNumber: { contains: search } },
      ];
    }

    if (priority && priority !== 'all') {
      where.priority = priority;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (findingId) {
      where.findingId = findingId;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    const actions = await prisma.correctiveAction.findMany({
      where,
      include: {
        assignedTo: { select: { firstName: true, lastName: true } },
        finding: { select: { findingNumber: true, title: true, severity: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(actions);
  } catch (error) {
    console.error('Fetch corrective actions error:', error);
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
    const { description, department, priority, dueDate, findingId, assignedToId } = body;

    if (!description || !findingId || !assignedToId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate action number
    const finding = await prisma.finding.findUnique({ where: { id: findingId } });
    const count = await prisma.correctiveAction.count({ where: { findingId } });
    const actionNumber = `${finding?.findingNumber}-CA${String(count + 1).padStart(2, '0')}`;

    const action = await prisma.correctiveAction.create({
      data: {
        actionNumber,
        description,
        department,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'NOT_STARTED',
        progress: 0,
        findingId,
        assignedToId,
      },
    });

    // Create audit trail
    await prisma.auditTrail.create({
      data: {
        action: 'CREATE',
        entityType: 'CORRECTIVE_ACTION',
        entityId: action.id,
        userId: user.id,
        description: `Created corrective action: ${action.actionNumber}`,
        newValue: JSON.stringify(action),
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'CORRECTIVE_ACTION_CREATED',
        title: `Corrective action "${action.actionNumber}" created`,
        description: action.description,
        entityType: 'CORRECTIVE_ACTION',
        entityId: action.id,
      },
    });

    return NextResponse.json(action);
  } catch (error) {
    console.error('Create corrective action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
