import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || 'dummy-key-to-bypass-build-error',
  baseURL: 'https://api.groq.com/openai/v1',
});

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    // Fetch live context from the database
    const [audits, findings, regulations, correctiveActions, evidence] = await Promise.all([
      prisma.audit.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { leadAuditor: { select: { firstName: true, lastName: true } }, _count: { select: { findings: true, evidence: true } } },
      }),
      prisma.finding.findMany({
        take: 20,
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
        orderBy: { createdAt: 'desc' },
        include: { audit: { select: { auditNumber: true } } },
      }),
      prisma.regulation.findMany({ take: 10, where: { status: 'ACTIVE' } }),
      prisma.correctiveAction.findMany({
        take: 10,
        where: { status: { in: ['NOT_STARTED', 'IN_PROGRESS'] } },
        include: { finding: { select: { findingNumber: true, title: true } }, assignedTo: { select: { firstName: true, lastName: true } } },
      }),
      prisma.evidence.findMany({
        take: 10,
        where: { status: { in: ['DRAFT', 'PENDING_REVIEW'] } },
        orderBy: { uploadedAt: 'desc' },
      }),
    ]);

    const systemPrompt = `You are an expert AI Audit & Compliance Assistant for PryroGRC, an enterprise audit management platform. You have access to the organization's live audit data and help auditors, compliance officers, and managers with their work.

You are knowledgeable about:
- ISO 27001, GDPR, SOX, HIPAA, PCI DSS, NIST, SOC 2, and other global compliance frameworks
- Audit planning, execution, and reporting
- Finding management and corrective action tracking
- Evidence collection and review
- Risk assessment and compliance scoring

Be professional, concise, and actionable. Format responses with markdown when it helps readability.

## LIVE ORGANIZATION DATA (as of now):

### Active Audits (${audits.length} total):
${audits.map(a => `- ${a.auditNumber} | ${a.title} | Status: ${a.status} | Progress: ${a.progress}% | Findings: ${a._count.findings} | Evidence: ${a._count.evidence} | Lead: ${a.leadAuditor.firstName} ${a.leadAuditor.lastName}`).join('\n') || 'No active audits'}

### Open Findings (${findings.length} open):
${findings.map(f => `- ${f.findingNumber} | ${f.title} | Severity: ${f.severity} | Status: ${f.status} | Audit: ${f.audit.auditNumber}${f.dueDate ? ` | Due: ${new Date(f.dueDate).toLocaleDateString()}` : ''}`).join('\n') || 'No open findings'}

### Active Regulations (${regulations.length}):
${regulations.map(r => `- ${r.name} | ${r.category} | Authority: ${r.authority} | Region: ${r.region || 'Global'}`).join('\n') || 'No regulations loaded'}

### Pending Corrective Actions (${correctiveActions.length}):
${correctiveActions.map(a => `- ${a.actionNumber} | ${a.description} | Priority: ${a.priority} | Status: ${a.status} | Progress: ${a.progress}% | Assigned to: ${a.assignedTo.firstName} ${a.assignedTo.lastName} | Finding: ${a.finding.findingNumber}`).join('\n') || 'No pending actions'}

### Evidence Pending Review (${evidence.length}):
${evidence.map(e => `- ${e.evidenceId} | ${e.title} | Type: ${e.type} | Status: ${e.status}`).join('\n') || 'No pending evidence'}

### Current User: ${user.firstName} ${user.lastName} (${user.role})`;

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      max_tokens: 1000,
      temperature: 0.4,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    return NextResponse.json({ reply });

  } catch (error: unknown) {
    console.error('AI Assistant error:', error);
    const err = error as { status?: number; message?: string };
    if (err?.status === 429) {
      return NextResponse.json({ error: 'OpenAI rate limit reached. Please try again shortly.' }, { status: 429 });
    }
    if (err?.status === 401) {
      return NextResponse.json({ error: 'Invalid OpenAI API key. Please check your configuration.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'AI service unavailable. Please try again.' }, { status: 500 });
  }
}
