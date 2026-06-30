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
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const auditId = searchParams.get('auditId');

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { findingNumber: { contains: search } },
      ];
    }

    if (severity && severity !== 'all') {
      where.severity = severity;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (auditId) {
      where.auditId = auditId;
    }

    const findings = await prisma.finding.findMany({
      where,
      include: {
        reporter: { select: { firstName: true, lastName: true } },
        owner: { select: { firstName: true, lastName: true } },
        audit: { select: { auditNumber: true, title: true } },
        _count: { select: { correctiveActions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(findings);
  } catch (error) {
    console.error('Fetch findings error:', error);
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
    const { title, description, severity, riskLevel, evidence, recommendation, dueDate, auditId, requirementId } = body;

    if (!title || !description || !auditId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate finding number
    const audit = await prisma.audit.findUnique({ where: { id: auditId } });
    const count = await prisma.finding.count({ where: { auditId } });
    const findingNumber = `${audit?.auditNumber}-F${String(count + 1).padStart(2, '0')}`;

    const finding = await prisma.finding.create({
      data: {
        findingNumber,
        title,
        description,
        severity: severity || 'MEDIUM',
        riskLevel,
        evidence,
        recommendation,
        dueDate,
        status: 'OPEN',
        auditId,
        requirementId,
        reporterId: user.id,
      },
    });

    // Update audit progress
    await updateAuditProgress(auditId);

    // Create audit trail
    await prisma.auditTrail.create({
      data: {
        action: 'CREATE',
        entityType: 'FINDING',
        entityId: finding.id,
        userId: user.id,
        description: `Recorded finding: ${finding.findingNumber}`,
        newValue: JSON.stringify(finding),
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'FINDING_CREATED',
        title: `Finding "${finding.findingNumber}" recorded`,
        description: finding.title,
        entityType: 'FINDING',
        entityId: finding.id,
      },
    });

    return NextResponse.json(finding);
  } catch (error) {
    console.error('Create finding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function updateAuditProgress(auditId: string) {
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    include: {
      requirements: true,
      findings: true,
    },
  });

  if (!audit) return;

  const totalItems = audit.requirements.length + audit.findings.length;
  const completedItems = audit.requirements.filter(r => r.status === 'COMPLIANT').length +
    audit.findings.filter(f => f.status === 'CLOSED' || f.status === 'RESOLVED').length;

  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  await prisma.audit.update({
    where: { id: auditId },
    data: { progress },
  });
}
