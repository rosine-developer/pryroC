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

    const audit = await prisma.audit.findUnique({
      where: { id: params.id },
      include: {
        leadAuditor: { select: { id: true, firstName: true, lastName: true } },
        auditors: { include: { auditor: { select: { id: true, firstName: true, lastName: true } } } },
        regulations: { include: { regulation: { select: { id: true, name: true } } } },
        _count: { select: { findings: true, evidence: true } },
      },
    });

    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    const findings = await prisma.finding.findMany({
      where: { auditId: params.id },
      orderBy: { createdAt: 'desc' },
    });

    const requirements = await prisma.auditRequirement.findMany({
      where: { auditId: params.id },
      include: { requirement: { select: { requirementId: true, title: true, priority: true } } },
    });

    return NextResponse.json({ audit, findings, requirements });
  } catch (error) {
    console.error('Fetch audit error:', error);
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
    const existing = await prisma.audit.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    const audit = await prisma.audit.update({
      where: { id: params.id },
      data: body,
    });

    await prisma.auditTrail.create({
      data: {
        action: 'UPDATE',
        entityType: 'AUDIT',
        entityId: audit.id,
        userId: user.id,
        description: `Updated audit: ${audit.auditNumber}`,
        oldValue: JSON.stringify(existing),
        newValue: JSON.stringify(audit),
      },
    });

    return NextResponse.json(audit);
  } catch (error) {
    console.error('Update audit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
