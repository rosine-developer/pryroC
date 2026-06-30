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

    const requirements = await prisma.requirement.findMany({
      where: { regulationId: params.id },
      include: {
        _count: {
          select: { evidence: true, findings: true },
        },
      },
      orderBy: { requirementId: 'asc' },
    });

    return NextResponse.json(requirements);
  } catch (error) {
    console.error('Fetch requirements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
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

    // Get the regulation to generate proper ID
    const regulation = await prisma.regulation.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { requirements: true } },
      },
    });

    if (!regulation) {
      return NextResponse.json({ error: 'Regulation not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, requirementType, responsibleDepartment, priority, reviewFrequency } = body;

    const count = regulation._count.requirements + 1;
    const requirementId = `REQ-${regulation.name.substring(0, 3).toUpperCase()}-${String(count).padStart(3, '0')}`;

    const requirement = await prisma.requirement.create({
      data: {
        requirementId,
        title,
        description,
        regulationId: params.id,
        requirementType: requirementType || 'MANDATORY',
        responsibleDepartment,
        priority: priority || 'MEDIUM',
        reviewFrequency,
      },
    });

    await prisma.auditTrail.create({
      data: {
        action: 'CREATE',
        entityType: 'REQUIREMENT',
        entityId: requirement.id,
        userId: user.id,
        description: `Created requirement: ${requirement.requirementId}`,
        newValue: JSON.stringify(requirement),
      },
    });

    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'REQUIREMENT_CREATED',
        title: `Requirement "${requirement.requirementId}" added to ${regulation.name}`,
        entityType: 'REQUIREMENT',
        entityId: requirement.id,
      },
    });

    return NextResponse.json(requirement);
  } catch (error) {
    console.error('Create requirement error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
