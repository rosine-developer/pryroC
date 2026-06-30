'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Calendar,
  Users,
  Building,
  FileText,
  AlertTriangle,
  FolderOpen,
  CheckCircle,
  Clock,
  Play,
  Pause,
  Plus,
  FileCheck,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Audit {
  id: string;
  auditNumber: string;
  type: string;
  title: string;
  objective?: string;
  scope?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  progress: number;
  notes?: string;
  createdAt: string;
  leadAuditor: { id: string; firstName: string; lastName: string };
  auditors: Array<{ auditor: { id: string; firstName: string; lastName: string } }>;
  regulations: Array<{ regulation: { id: string; name: string } }>;
  _count?: { findings: number; evidence: number };
}

interface Finding {
  id: string;
  findingNumber: string;
  title: string;
  severity: string;
  status: string;
  dueDate?: string;
}

interface AuditRequirement {
  id: string;
  status: string;
  requirement: {
    requirementId: string;
    title: string;
    priority: string;
  };
}

const workflowSteps = [
  { id: 'PLANNING', label: 'Planning', icon: Clock },
  { id: 'SCHEDULED', label: 'Scheduled', icon: Calendar },
  { id: 'IN_PROGRESS', label: 'In Progress', icon: Play },
  { id: 'COMPLETED', label: 'Completed', icon: FileCheck },
  { id: 'CLOSED', label: 'Closed', icon: CheckCircle },
];

export default function AuditDetailPage() {
  const params = useParams();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [requirements, setRequirements] = useState<AuditRequirement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAudit();
  }, [params.id]);

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/audits/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setAudit(data.audit);
        setFindings(data.findings);
        setRequirements(data.requirements);
      }
    } catch (error) {
      console.error('Failed to fetch audit:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const currentStepIndex = workflowSteps.findIndex(s => s.id === audit?.status);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="p-8">
        <div className="text-center text-muted-foreground">Audit not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Back Button */}
      <Link href="/audits">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Audits
        </Button>
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{audit.auditNumber}</h1>
              <Badge variant="outline">{audit.type}</Badge>
            </div>
            <h2 className="text-xl text-muted-foreground">{audit.title}</h2>
          </div>
          <div className="flex gap-2">
            {audit.status === 'PLANNING' && (
              <Button>
                <Play className="mr-2 h-4 w-4" />
                Start Audit
              </Button>
            )}
            {audit.status === 'IN_PROGRESS' && (
              <Button variant="outline">
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            )}
          </div>
        </div>

        {/* Workflow Visualization */}
        <Card className="bg-muted/30">
          <CardContent className="p-4 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === audit.status;
                const isCompleted = index < currentStepIndex;
                return (
                  <React.Fragment key={step.id}>
                    <div
                      className={cn(
                        'workflow-step flex-shrink-0',
                        isActive && 'bg-primary text-primary-foreground',
                        isCompleted && 'bg-success/10 text-success',
                        !isActive && !isCompleted && 'text-muted-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{step.label}</span>
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <div className="flex items-center gap-4">
          <Progress value={audit.progress} className="flex-1 h-2" />
          <span className="text-sm font-medium">{audit.progress}% Complete</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Start Date</div>
                <div className="font-medium">{formatDate(audit.startDate)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">End Date</div>
                <div className="font-medium">{formatDate(audit.endDate)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Auditors</div>
                <div className="font-medium">{audit.auditors.length + 1}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Findings</div>
                <div className="font-medium">{audit._count?.findings || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Evidence</div>
                <div className="font-medium">{audit._count?.evidence || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Objective</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{audit.objective || 'No objective defined.'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Scope</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{audit.scope || 'No scope defined.'}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Audit Team</CardTitle>
              <CardDescription>
                Lead Auditor: {audit.leadAuditor.firstName} {audit.leadAuditor.lastName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {audit.auditors.map(({ auditor }) => (
                  <div key={auditor.id} className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{auditor.firstName} {auditor.lastName}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Applicable Regulations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {audit.regulations.map(({ regulation }) => (
                  <Link key={regulation.id} href={`/regulations/${regulation.id}`}>
                    <Badge variant="secondary" className="cursor-pointer">{regulation.name}</Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Requirements Checklist</CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Requirements
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Requirement</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requirements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No requirements added to this audit
                      </TableCell>
                    </TableRow>
                  ) : (
                    requirements.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-mono">{req.requirement.requirementId}</TableCell>
                        <TableCell>{req.requirement.title}</TableCell>
                        <TableCell>
                          <Badge variant={req.requirement.priority === 'CRITICAL' ? 'destructive' : 'secondary'}>
                            {req.requirement.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={req.status === 'COMPLIANT' ? 'default' : 'outline'}>
                            {req.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="findings">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Findings</CardTitle>
              <Link href={`/findings/new?auditId=${audit.id}`}>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Record Finding
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {findings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No findings recorded
                      </TableCell>
                    </TableRow>
                  ) : (
                    findings.map((finding) => (
                      <TableRow key={finding.id}>
                        <TableCell className="font-mono">{finding.findingNumber}</TableCell>
                        <TableCell>{finding.title}</TableCell>
                        <TableCell>
                          <Badge variant={finding.severity === 'CRITICAL' ? 'destructive' : 'secondary'}>
                            {finding.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{finding.status}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(finding.dueDate)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Evidence</CardTitle>
              <Link href={`/evidence?auditId=${audit.id}`}>
                <Button variant="outline" size="sm">
                  <FolderOpen className="mr-2 h-4 w-4" />
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Evidence linked to this audit will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Complete history will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
