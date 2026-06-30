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

    // Get audit statistics
    const openAudits = await prisma.audit.count({
      where: { status: { in: ['IN_PROGRESS', 'SCHEDULED', 'PLANNING'] } },
    });

    const completedAudits = await prisma.audit.count({
      where: { status: 'COMPLETED' },
    });

    const overdueAudits = await prisma.audit.count({
      where: {
        status: { notIn: ['COMPLETED', 'CLOSED'] },
        endDate: { lt: new Date() },
      },
    });

    // Get finding statistics
    const openFindings = await prisma.finding.count({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
    });

    const criticalFindings = await prisma.finding.count({
      where: { severity: 'CRITICAL', status: { in: ['OPEN', 'IN_PROGRESS'] } },
    });

    // Get evidence statistics
    const pendingReviews = await prisma.evidence.count({
      where: { status: 'PENDING_REVIEW' },
    });

    const totalEvidence = await prisma.evidence.count({
      where: { status: 'APPROVED' },
    });

    // Get corrective actions
    const correctiveActionsDue = await prisma.correctiveAction.count({
      where: {
        status: { in: ['NOT_STARTED', 'IN_PROGRESS'] },
        dueDate: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // Due within 7 days
      },
    });

    // Calculate compliance percentage
    const totalRequirements = await prisma.auditRequirement.count();
    const compliantRequirements = await prisma.auditRequirement.count({
      where: { status: 'COMPLIANT' },
    });
    const compliancePercentage = totalRequirements > 0
      ? Math.round((compliantRequirements / totalRequirements) * 100)
      : 0;

    // Get recent activities
    const recentActivities = await prisma.activity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    // Get findings by severity
    const findingsBySeverityRaw = await prisma.finding.groupBy({
      by: ['severity'],
      _count: true,
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
    });

    const severityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'OBSERVATION'];
    const findingsBySeverity = severityOrder.map(severity => ({
      name: severity.charAt(0) + severity.slice(1).toLowerCase().replace('_', ' '),
      value: findingsBySeverityRaw.find(f => f.severity === severity)?._count || 0,
    }));

    // Evidence missing - requirements without linked evidence
    const requirementsWithoutEvidence = await prisma.requirement.count({
      where: {
        evidence: { none: {} },
        status: 'PENDING_REVIEW',
      },
    });

    // Upcoming audits (scheduled in next 7 days)
    const upcomingAudits = await prisma.audit.count({
      where: {
        status: 'SCHEDULED',
        startDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Audit progress for active audits
    const activeAudits = await prisma.audit.findMany({
      where: { status: 'IN_PROGRESS' },
      select: { auditNumber: true, progress: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    const auditProgress = activeAudits.map(audit => ({
      name: audit.auditNumber,
      progress: audit.progress,
    }));

    // Evidence completion trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentEvidence = await prisma.evidence.findMany({
      where: {
        uploadedAt: { gte: sixMonthsAgo },
      },
      select: { uploadedAt: true, status: true },
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats: Record<string, { total: number; approved: number }> = {};

    const evidenceCompletion = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = monthNames[d.getMonth()];
      monthlyStats[monthStr] = { total: 0, approved: 0 };
    }

    recentEvidence.forEach(evidence => {
      const monthStr = monthNames[evidence.uploadedAt.getMonth()];
      if (monthlyStats[monthStr]) {
        monthlyStats[monthStr].total++;
        if (evidence.status === 'APPROVED') {
          monthlyStats[monthStr].approved++;
        }
      }
    });

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = monthNames[d.getMonth()];
      const stats = monthlyStats[monthStr];
      let value = 0;
      if (stats && stats.total > 0) {
        value = Math.round((stats.approved / stats.total) * 100);
      }
      evidenceCompletion.push({ name: monthStr, value });
    }

    // Compliance by department
    const auditRequirements = await prisma.auditRequirement.findMany({
      include: {
        audit: { select: { department: true } },
        requirement: { select: { responsibleDepartment: true } },
      }
    });

    const deptStats: Record<string, { compliant: number; nonCompliant: number }> = {};

    auditRequirements.forEach(ar => {
      const dept = ar.audit?.department || ar.requirement?.responsibleDepartment || 'Unassigned';
      if (!deptStats[dept]) {
        deptStats[dept] = { compliant: 0, nonCompliant: 0 };
      }
      if (ar.status === 'COMPLIANT') {
        deptStats[dept].compliant++;
      } else if (['NON_COMPLIANT', 'PARTIALLY_COMPLIANT'].includes(ar.status)) {
        deptStats[dept].nonCompliant++;
      }
    });

    let complianceByDepartment = Object.entries(deptStats)
      .map(([name, stats]) => {
        const total = stats.compliant + stats.nonCompliant;
        return {
          name,
          compliant: total > 0 ? Math.round((stats.compliant / total) * 100) : 0,
          nonCompliant: total > 0 ? Math.round((stats.nonCompliant / total) * 100) : 0,
          _total: total
        };
      })
      .sort((a, b) => b._total - a._total) // Sort by total requirements
      .slice(0, 5) // Take top 5
      .map(({ name, compliant, nonCompliant }) => ({ name, compliant, nonCompliant }));
      
    if (complianceByDepartment.length === 0) {
      // Fallback empty data if no DB data
      complianceByDepartment.push({ name: 'No Data', compliant: 0, nonCompliant: 0 });
    }

    return NextResponse.json({
      openAudits,
      completedAudits,
      upcomingAudits,
      overdueAudits,
      pendingReviews,
      openFindings,
      criticalFindings,
      evidenceMissing: requirementsWithoutEvidence,
      correctiveActionsDue,
      compliancePercentage,
      recentActivities: recentActivities.map(a => ({
        id: a.id,
        type: a.type,
        title: a.title,
        description: a.description,
        createdAt: a.createdAt.toISOString(),
        user: a.user,
      })),
      findingsBySeverity,
      complianceByDepartment,
      evidenceCompletion,
      auditProgress,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
