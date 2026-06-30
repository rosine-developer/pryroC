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
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { auditNumber: { contains: search } },
        { department: { contains: search } },
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    const audits = await prisma.audit.findMany({
      where,
      include: {
        leadAuditor: { select: { firstName: true, lastName: true } },
        _count: {
          select: { auditors: true, findings: true, evidence: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(audits);
  } catch (error) {
    console.error('Fetch audits error:', error);
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
    const { type, title, objective, scope, department, startDate, endDate, notes } = body;

    if (!type || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate audit number
    const year = new Date().getFullYear();
    const count = await prisma.audit.count({
      where: {
        createdAt: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
    });
    const auditNumber = `AUD-${year}-${String(count + 1).padStart(3, '0')}`;

    const audit = await prisma.audit.create({
      data: {
        auditNumber,
        type,
        title,
        objective,
        scope,
        department,
        startDate,
        endDate,
        notes,
        status: 'PLANNING',
        leadAuditorId: user.id,
      },
    });

    // Create audit trail
    await prisma.auditTrail.create({
      data: {
        action: 'CREATE',
        entityType: 'AUDIT',
        entityId: audit.id,
        userId: user.id,
        description: `Created audit: ${audit.auditNumber}`,
        newValue: JSON.stringify(audit),
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'AUDIT_CREATED',
        title: `Audit "${audit.auditNumber}" created`,
        description: audit.title,
        entityType: 'AUDIT',
        entityId: audit.id,
      },
    });

    return NextResponse.json(audit);
  } catch (error) {
    console.error('Create audit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
