'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  FileText,
  FileSearch,
  AlertTriangle,
  BarChart,
  HelpCircle,
  Trash2,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SuggestedPrompt {
  icon: typeof FileText;
  label: string;
  prompt: string;
}

const suggestedPrompts: SuggestedPrompt[] = [
  { icon: FileSearch, label: 'Missing Evidence', prompt: 'What evidence is still missing for the current audits?' },
  { icon: FileText, label: 'Summarize Policy', prompt: 'Can you summarize the security policy for me?' },
  { icon: AlertTriangle, label: 'Unresolved Findings', prompt: 'What findings are still unresolved and need attention?' },
  { icon: BarChart, label: 'Compliance Status', prompt: 'What is the overall compliance status by department?' },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(input),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setLoading(false);
    }, 1000 + Math.random() * 1000);
  };

  const generateAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('missing evidence') || lowerQuery.includes('evidence')) {
      return `Based on the current audit data, here are the evidence gaps I've identified:

**Missing Evidence Items (7 total):**

1. **Network Security Policy** - Required for ISO 27001, A.13.1.1
   - Status: Not uploaded
   - Priority: HIGH

2. **Access Control Records** - Required for SOC 2
   - Status: Partially uploaded
   - Priority: MEDIUM

3. **Vendor Assessment Reports** - Required for internal policy compliance
   - Status: 3 of 5 missing
   - Priority: LOW

**Recommendation:** Focus on the Network Security Policy first as it's blocking compliance for audit AUD-2024-15. Would you like me to generate a reminder for the responsible parties?`;
    }

    if (lowerQuery.includes('summarize') || lowerQuery.includes('policy')) {
      return `Here's a summary of the **Information Security Policy v2.1**:

**Overview:**
This policy establishes the framework for protecting organizational information assets. It applies to all employees, contractors, and third parties with access to company systems.

**Key Sections:**

1. **Access Control (Section 4)**
   - Principle of least privilege
   - Multi-factor authentication required for remote access
   - Quarterly access reviews mandated

2. **Data Classification (Section 5)**
   - Four levels: Public, Internal, Confidential, Restricted
   - Each level has specific handling requirements

3. **Incident Response (Section 8)**
   - 24-hour reporting requirement for security incidents
   - Escalation matrix defined by severity

4. **Compliance Requirements (Section 10)**
   - Annual security awareness training
   - Background checks for privileged access

**Last Updated:** March 15, 2024
**Next Review:** March 15, 2025

Would you like more details on any specific section?`;
    }

    if (lowerQuery.includes('finding') || lowerQuery.includes('unresolved')) {
      return `Here's the current status of unresolved findings:

**Open Findings Summary:**

| Severity | Count | Overdue |
|----------|-------|---------|
| Critical | 3     | 1       |
| High     | 5     | 2       |
| Medium   | 8     | 3       |
| Low      | 12    | 1       |

**Critical Findings Requiring Immediate Attention:**

1. **FIN-2024-03-F01** - Inadequate access controls detected in production database
   - Due: June 25, 2024 (Overdue)
   - Owner: John Smith
   - Recommendation: Implement RBAC by July 15

2. **FIN-2024-05-F02** - Encrypted data transmission not enforced for external APIs
   - Due: July 5, 2024
   - Owner: Sarah Johnson
   - Status: Corrective action in progress (60%)

3. **FIN-2024-02-F03** - Security patch management process missing documentation
   - Due: July 10, 2024
   - Owner: Michael Davis
   - Status: Awaiting evidence upload

**Suggested Actions:**
- Schedule meeting with John Smith regarding overdue critical finding
- Review evidence for Sarah Johnson's corrective action before Friday

Would you like me to draft a notification email for the overdue items?`;
    }

    if (lowerQuery.includes('compliance') || lowerQuery.includes('department')) {
      return `Here's the compliance status breakdown by department:

**Compliance by Department:**

| Department | Compliant | Non-Compliant | Score |
|------------|-----------|---------------|-------|
| Security   | 17        | 3             | 85%   |
| Finance    | 23        | 2             | 92%   |
| Operations | 14        | 4             | 78%   |
| HR         | 22        | 3             | 88%   |
| IT         | 18        | 7             | 72%   |

**Areas of Concern:**

1. **IT Department (72% compliance)**
   - Missing: Patch management documentation
   - Missing: Incident response logs
   - Missing: Change approval records (5 pending)

2. **Operations (78% compliance)**
   - Outdated business continuity plan
   - Missing DR test results for Q2

3. **Security (85% compliance)**
   - Penetration test report pending upload
   - Access review evidence incomplete

**Recommendation:** Prioritize IT department evidence collection. Schedule a call with IT leadership to address the 7 non-compliant items.

Would you like a detailed breakdown for any specific department?`;
    }

    if (lowerQuery.includes('suggest') || lowerQuery.includes('finding')) {
      return `Based on the evidence reviewed for audit **AUD-2024-15**, I've identified potential findings:

**Suggested Findings:**

1. **Medium - Incomplete Access Reviews**
   - Observation: Quarterly access review for Q1 2024 is incomplete. 3 privileged accounts lack manager sign-off.
   - Control: ISO 27001 A.9.2.5
   - Evidence: Access review spreadsheet (EV-00234)

2. **Low - Documentation Inconsistency**
   - Observation: Incident response procedure has version mismatches between departments.
   - Control: Internal Policy IR-001
   - Evidence: Procedure documents from IT and Security

3. **High - Vendor Risk Assessment Gap**
   - Observation: Two critical vendors lack current security assessments.
   - Control: SOC 2 CC9.2
   - Evidence: Vendor management log

**Confidence Scores:**
- Finding 1: 87% confidence
- Finding 2: 65% confidence
- Finding 3: 92% confidence

Would you like me to formally create any of these findings?`;
    }

    return `I understand you're asking about audit-related matters. Here are some things I can help with:

**Available Capabilities:**
- Summarize uploaded documents and policies
- Compare evidence against requirements
- Identify missing evidence
- Suggest possible findings based on audit data
- Generate executive summaries
- Answer compliance questions

**Quick Actions:**
- "What evidence is missing?"
- "Summarize the security policy"
- "What findings need attention?"
- "Suggest findings for this audit"
- "Generate an audit summary"

Please let me know how I can assist you with your audit work.`;
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bot className="h-8 w-8" />
            AI Audit Assistant
          </h1>
          <p className="text-muted-foreground">
            Your intelligent assistant for audit management and compliance
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" onClick={handleClearChat}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Chat
          </Button>
        )}
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">How can I help you today?</h3>
                    <p className="text-muted-foreground max-w-md">
                      I can help you with audit tasks, summarize documents, identify missing evidence,
                      suggest findings, and answer compliance questions.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex gap-3',
                        message.role === 'user' && 'justify-end'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'rounded-lg px-4 py-3 max-w-[80%]',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                          <span className="text-xs opacity-60">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.role === 'assistant' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1 opacity-60 hover:opacity-100"
                              onClick={() => handleCopyMessage(message.content)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="bg-muted rounded-lg px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about audits, evidence, findings, or compliance..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={loading}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={loading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Prompts Sidebar */}
        <Card className="w-72 hidden lg:block">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Prompts</CardTitle>
            <CardDescription>Common audit questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestedPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start gap-2 h-auto py-2 px-3"
                onClick={() => handlePromptClick(prompt.prompt)}
              >
                <prompt.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-left text-sm">{prompt.label}</span>
              </Button>
            ))}

            <div className="pt-4 mt-4 border-t border-border space-y-3">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Tip:</span> Ask me to analyze specific audits,
                  compare evidence against requirements, or suggest corrective actions.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
