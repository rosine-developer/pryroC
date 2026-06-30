import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getUserFromToken } from '@/lib/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert AI Compliance & Audit Assistant built into a professional audit management platform called PryroC. You help compliance officers, internal auditors, and risk managers work more efficiently.

You have deep knowledge of:
- Audit management (planning, execution, reporting, closure)
- Compliance frameworks: ISO 27001, SOC 2, GDPR, HIPAA, PCI-DSS, NIST
- Risk assessment and corrective action management
- Evidence collection and gap analysis
- Regulatory requirements and controls
- Finding severity classification (Critical, High, Medium, Low, Observation)

Your tone is professional, concise, and helpful. You:
- Give structured, actionable answers using markdown formatting (bold, bullet points, tables)
- Proactively suggest next steps
- Ask clarifying questions when the request is vague
- Flag risks when you spot them
- Can help draft findings, corrective action plans, and audit summaries

Keep responses focused and useful. Do not make up specific data about the user's system unless they provide it — instead guide them on what to look for.`;

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
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add your OPENAI_API_KEY to the .env file.' },
        { status: 503 }
      );
    }

    const openaiMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...openaiMessages,
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content;
    if (!reply) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('AI chat error:', error);

    if (error?.status === 401) {
      return NextResponse.json({ error: 'Invalid OpenAI API key.' }, { status: 503 });
    }
    if (error?.status === 429) {
      return NextResponse.json({ error: 'OpenAI rate limit reached. Please try again shortly.' }, { status: 429 });
    }

    return NextResponse.json({ error: 'Failed to get AI response.' }, { status: 500 });
  }
}
