'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
  ArrowLeft, CheckCircle, Clock, Play, Pause, ChevronRight,
  FileCheck, Calendar, Users, AlertTriangle, FolderOpen,
  Plus, Check, ClipboardList, Upload, Flag, FileText, Download, Target, Building, Search
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
  description: string;
}

interface AuditRequirement {
  id: string;
  status: string;
  notes?: string;
  requirement: { requirementId: string; title: string; priority: string; description?: string };
}

interface Regulation {
  id: string;
  name: string;
  _count?: { requirements: number };
}

interface Evidence {
  id: string;
  title: string;
  type: string;
  filePath?: string;
  fileSize?: number;
  uploadedAt: string;
  uploadedBy: { firstName: string; lastName: string };
}

const reqStatusOptions = [
  { value: 'NOT_STARTED',          label: 'Not Started',          color: 'bg-muted text-muted-foreground' },
  { value: 'IN_REVIEW',            label: 'In Review',            color: 'bg-blue-100 text-blue-700' },
  { value: 'COMPLIANT',            label: 'Compliant',            color: 'bg-green-100 text-green-700' },
  { value: 'NON_COMPLIANT',        label: 'Non-Compliant',        color: 'bg-red-100 text-red-700' },
  { value: 'PARTIALLY_COMPLIANT',  label: 'Partially Compliant',  color: 'bg-yellow-100 text-yellow-700' },
  { value: 'NOT_APPLICABLE',       label: 'Not Applicable',       color: 'bg-gray-100 text-gray-500' },
];

const severityOptions = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'OBSERVATION'];

export default function AuditDetailPage() {
  const params = useParams();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [requirements, setRequirements] = useState<AuditRequirement[]>([]);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  // Add requirements dialog
  const [addReqOpen, setAddReqOpen] = useState(false);
  const [regulations, setRegulations] = useState<Regulation[]>([]);

  // Add finding dialog
  const [addFindingOpen, setAddFindingOpen] = useState(false);
  const [findingForm, setFindingForm] = useState({ title: '', description: '', severity: 'MEDIUM', dueDate: '' });
  const [savingFinding, setSavingFinding] = useState(false);

  // Add evidence dialog
  const [addEvidenceOpen, setAddEvidenceOpen] = useState(false);
  const [evidenceForm, setEvidenceForm] = useState({ title: '', description: '', type: 'PDF', tags: '' });
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [savingEvidence, setSavingEvidence] = useState(false);

  useEffect(() => { fetchAudit(); }, [params.id]);

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/audits/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setAudit(data.audit);
        setFindings(data.findings || []);
        setRequirements(data.requirements || []);
      }
      
      // Fetch evidence specifically for this audit to get full details
      const evRes = await fetch(`/api/evidence?auditId=${params.id}`);
      if (evRes.ok) {
        setEvidenceList(await evRes.json());
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (newStatus: string) => {
    if (!audit) return;
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/audits/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === 'IN_PROGRESS' && !audit.startDate ? { startDate: new Date().toISOString() } : {}),
          ...(newStatus === 'COMPLETED' ? { endDate: new Date().toISOString(), progress: 100 } : {}),
        }),
      });
      if (res.ok) { await fetchAudit(); }
    } catch (e) { console.error(e); }
    finally { setStatusLoading(false); }
  };

  const updateReqStatus = async (auditReqId: string, newStatus: string) => {
    await fetch(`/api/audits/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirementStatus: { id: auditReqId, status: newStatus } }),
    });
    setRequirements(prev => prev.map(r => r.id === auditReqId ? { ...r, status: newStatus } : r));
    
    // Auto update progress based on completed requirements
    const newReqs = requirements.map(r => r.id === auditReqId ? { ...r, status: newStatus } : r);
    const completed = newReqs.filter(r => r.status !== 'NOT_STARTED' && r.status !== 'IN_REVIEW').length;
    const progress = Math.round((completed / newReqs.length) * 100);
    
    await fetch(`/api/audits/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress }),
    });
    setAudit(prev => prev ? { ...prev, progress } : null);
  };

  const fetchRegulations = async () => {
    try {
      const res = await fetch('/api/regulations');
      if (res.ok) setRegulations(await res.json());
    } catch (e) { console.error(e); }
  };

  const addRegulationRequirements = async (regulationId: string) => {
    try {
      const res = await fetch(`/api/regulations/${regulationId}/requirements`);
      if (!res.ok) return;
      const reqs = await res.json();
      for (const req of reqs) {
        const existing = requirements.find(r => r.requirement.requirementId === req.requirementId);
        if (!existing) {
          await fetch(`/api/audits/${params.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ addRequirement: req.id }),
          });
        }
      }
      await fetchAudit();
      setAddReqOpen(false);
    } catch (e) { console.error(e); }
  };

  const saveFinding = async () => {
    if (!findingForm.title || !findingForm.description) return;
    setSavingFinding(true);
    try {
      const res = await fetch('/api/findings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...findingForm, auditId: audit?.id, dueDate: findingForm.dueDate || null }),
      });
      if (res.ok) {
        await fetchAudit();
        setFindingForm({ title: '', description: '', severity: 'MEDIUM', dueDate: '' });
        setAddFindingOpen(false);
      }
    } catch (e) { console.error(e); }
    finally { setSavingFinding(false); }
  };

  const saveEvidence = async () => {
    if (!evidenceForm.title && !evidenceFile) return;
    setSavingEvidence(true);
    
    try {
      const data = new FormData();
      if (evidenceFile) data.append('file', evidenceFile);
      
      const titleToUse = evidenceForm.title || evidenceFile?.name || '';
      data.append('title', titleToUse);
      data.append('description', evidenceForm.description);
      
      const ext = evidenceFile?.name.split('.').pop()?.toUpperCase();
      const typeMap: Record<string, string> = { PDF: 'PDF', DOC: 'WORD', DOCX: 'WORD', XLS: 'EXCEL', XLSX: 'EXCEL', PNG: 'IMAGE', JPG: 'IMAGE', JPEG: 'IMAGE', GIF: 'IMAGE', MP4: 'VIDEO', MOV: 'VIDEO' };
      const detectedType = (ext && typeMap[ext]) || evidenceForm.type;
      
      data.append('type', detectedType);
      data.append('tags', evidenceForm.tags);
      if (audit?.id) data.append('auditId', audit.id);

      const res = await fetch('/api/evidence', {
        method: 'POST',
        body: data,
      });

      if (res.ok) {
        await fetchAudit();
        setEvidenceForm({ title: '', description: '', type: 'PDF', tags: '' });
        setEvidenceFile(null);
        setAddEvidenceOpen(false);
      } else {
        const resData = await res.json();
        alert(resData.error || 'Failed to upload');
      }
    } catch (e) { 
      console.error(e); 
      alert('Failed to upload evidence');
    } finally { 
      setSavingEvidence(false); 
    }
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

  const statusOrder = ['PLANNING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'];
  const currentStatusIndex = statusOrder.indexOf(audit?.status || '');
  const workflowSteps = [
    { id: 'PLANNING', label: 'Planning', icon: Clock },
    { id: 'SCHEDULED', label: 'Scheduled', icon: Calendar },
    { id: 'IN_PROGRESS', label: 'In Progress', icon: Play },
    { id: 'COMPLETED', label: 'Completed', icon: FileCheck },
    { id: 'CLOSED', label: 'Closed', icon: CheckCircle },
  ];

  if (loading) return <div className="p-8 flex items-center justify-center min-h-[50vh]"><div className="animate-pulse text-muted-foreground">Loading audit...</div></div>;
  if (!audit) return <div className="p-8 text-center text-muted-foreground">Audit not found</div>;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Back */}
      <Link href="/audits"><Button variant="ghost" size="sm" className="mb-2"><ArrowLeft className="mr-2 h-4 w-4" />Back to Audits</Button></Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">{audit.auditNumber}</h1>
            <Badge variant="outline" className="text-sm">{audit.type}</Badge>
            <Badge variant="secondary" className="text-sm">{audit.status}</Badge>
          </div>
          <p className="text-muted-foreground text-lg">{audit.title}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {audit.status === 'PLANNING' && <Button onClick={() => updateStatus('IN_PROGRESS')} disabled={statusLoading}><Play className="mr-2 h-4 w-4" />{statusLoading ? 'Starting...' : 'Start Audit'}</Button>}
          {audit.status === 'IN_PROGRESS' && <Button variant="outline" onClick={() => updateStatus('PAUSED')} disabled={statusLoading}><Pause className="mr-2 h-4 w-4" />Pause</Button>}
          {audit.status === 'PAUSED' && <Button onClick={() => updateStatus('IN_PROGRESS')} disabled={statusLoading}><Play className="mr-2 h-4 w-4" />Resume</Button>}
          {(audit.status === 'IN_PROGRESS' || audit.status === 'PAUSED') && <Button variant="default" className="bg-success text-success-foreground hover:bg-success/90" onClick={() => updateStatus('COMPLETED')} disabled={statusLoading}><CheckCircle className="mr-2 h-4 w-4" />Complete Audit</Button>}
        </div>
      </div>

      {/* Workflow bar */}
      <Card>
        <CardContent className="p-3 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              const isCurrentStatus = step.id === audit.status;
              const stepIdx = statusOrder.indexOf(step.id);
              const isDone = !isCurrentStatus && stepIdx < currentStatusIndex;
              return (
                <React.Fragment key={step.id}>
                  <div className={cn('workflow-step flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2', isCurrentStatus && 'bg-primary text-primary-foreground', isDone && 'bg-success/15 text-success', !isCurrentStatus && !isDone && 'text-muted-foreground')}>
                    <Icon className="h-4 w-4" /><span>{step.label}</span>
                  </div>
                  {index < workflowSteps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Start Date', value: formatDate(audit.startDate), icon: Calendar },
          { label: 'End Date', value: formatDate(audit.endDate), icon: Calendar },
          { label: 'Requirements', value: requirements.length, icon: ClipboardList },
          { label: 'Findings', value: audit._count?.findings || 0, icon: Flag },
          { label: 'Evidence', value: audit._count?.evidence || 0, icon: FolderOpen },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}><CardContent className="p-4 flex items-center gap-3">
            <div className="bg-muted p-2 rounded-md"><Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" /></div>
            <div><div className="text-sm text-muted-foreground">{label}</div><div className="font-bold text-lg">{value}</div></div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="rounded-sm px-4">Overview</TabsTrigger>
          <TabsTrigger value="checklist" className="rounded-sm px-4">Checklist</TabsTrigger>
          <TabsTrigger value="findings" className="rounded-sm px-4">Findings</TabsTrigger>
          <TabsTrigger value="evidence" className="rounded-sm px-4">Evidence</TabsTrigger>
          <TabsTrigger value="report" className="rounded-sm px-4">Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Audit Scope & Objectives</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-2"><Target className="h-4 w-4 text-muted-foreground" /> Objective</h3>
                  <div className="bg-muted/30 p-4 rounded-md text-sm border">
                    {audit.objective || <span className="text-muted-foreground italic">No objective specified.</span>}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-2"><Search className="h-4 w-4 text-muted-foreground" /> Scope</h3>
                  <div className="bg-muted/30 p-4 rounded-md text-sm border">
                    {audit.scope || <span className="text-muted-foreground italic">No scope specified.</span>}
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Overall Progress</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion</span>
                      <span className="font-medium">{audit.progress || 0}%</span>
                    </div>
                    <Progress value={audit.progress || 0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team & Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Building className="h-4 w-4" /> Department</div>
                  <div className="font-medium">{audit.department || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Users className="h-4 w-4" /> Lead Auditor</div>
                  <div className="font-medium">{audit.leadAuditor.firstName} {audit.leadAuditor.lastName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Users className="h-4 w-4" /> Audit Team</div>
                  <div className="space-y-1 mt-2">
                    {audit.auditors.length > 0 ? (
                      audit.auditors.map((a, i) => (
                        <div key={i} className="text-sm px-3 py-1.5 bg-muted rounded-md border">{a.auditor.firstName} {a.auditor.lastName}</div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground italic">No additional team members.</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4 outline-none">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Compliance Checklist</CardTitle>
                <CardDescription>Review and mark compliance for each requirement.</CardDescription>
              </div>
              <Button size="sm" onClick={() => { fetchRegulations(); setAddReqOpen(true); }} disabled={audit.status === 'COMPLETED' || audit.status === 'CLOSED'}>
                <Plus className="mr-2 h-4 w-4" /> Add from Regulation
              </Button>
            </CardHeader>
            <CardContent>
              {requirements.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 border border-dashed rounded-lg">
                  <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                  <h3 className="text-lg font-medium">No requirements added</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">Import requirements from a regulatory framework to start your checklist.</p>
                  <Button variant="outline" onClick={() => { fetchRegulations(); setAddReqOpen(true); }}>Add Requirements</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {requirements.map(req => (
                    <div key={req.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg bg-card hover:bg-muted/20 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-semibold bg-muted px-2 py-0.5 rounded text-muted-foreground">{req.requirement.requirementId}</span>
                          <Badge variant={req.requirement.priority === 'CRITICAL' ? 'destructive' : req.requirement.priority === 'HIGH' ? 'warning' : 'secondary'} className="text-[10px] uppercase tracking-wider">{req.requirement.priority}</Badge>
                        </div>
                        <div className="text-sm font-medium">{req.requirement.title}</div>
                        {req.requirement.description && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{req.requirement.description}</div>}
                      </div>
                      <div className="flex items-center gap-4 sm:w-64 flex-shrink-0">
                        <Select value={req.status} onValueChange={(v) => updateReqStatus(req.id, v)} disabled={audit.status === 'COMPLETED' || audit.status === 'CLOSED'}>
                          <SelectTrigger className="w-full h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {reqStatusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="findings" className="space-y-4 outline-none">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Audit Findings</CardTitle>
                <CardDescription>Track issues, risks, and non-conformances.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setAddFindingOpen(true)} disabled={audit.status === 'COMPLETED' || audit.status === 'CLOSED'}>
                <Plus className="mr-2 h-4 w-4" /> Record Finding
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {findings.length === 0 ? (
                <div className="text-center py-12 m-6 bg-muted/20 border border-dashed rounded-lg">
                  <Flag className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                  <h3 className="text-lg font-medium">No findings recorded</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">Document any issues or non-conformances found during the audit.</p>
                  <Button variant="outline" onClick={() => setAddFindingOpen(true)}>Record Finding</Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Finding ID</TableHead>
                      <TableHead className="w-[40%]">Title</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {findings.map(f => (
                      <TableRow key={f.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{f.findingNumber}</TableCell>
                        <TableCell className="font-medium">
                          {f.title}
                          <div className="text-xs text-muted-foreground truncate max-w-xs mt-1">{f.description}</div>
                        </TableCell>
                        <TableCell><Badge variant={f.severity === 'CRITICAL' ? 'destructive' : f.severity === 'HIGH' ? 'warning' : 'secondary'} className="text-xs">{f.severity}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{f.status}</Badge></TableCell>
                        <TableCell className="text-sm">{formatDate(f.dueDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4 outline-none">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Evidence Collection</CardTitle>
                <CardDescription>Upload supporting documents and proof.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setAddEvidenceOpen(true)} disabled={audit.status === 'COMPLETED' || audit.status === 'CLOSED'}>
                <Upload className="mr-2 h-4 w-4" /> Add Evidence
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {evidenceList.length === 0 ? (
                <div className="text-center py-12 m-6 bg-muted/20 border border-dashed rounded-lg">
                  <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                  <h3 className="text-lg font-medium">No evidence uploaded</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">Upload policies, logs, screenshots, or other supporting documents.</p>
                  <Button variant="outline" onClick={() => setAddEvidenceOpen(true)}>Upload Evidence</Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evidenceList.map(ev => (
                      <TableRow key={ev.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" /> {ev.title}
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{ev.type}</Badge></TableCell>
                        <TableCell className="text-sm">{ev.uploadedBy.firstName} {ev.uploadedBy.lastName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(ev.uploadedAt)}</TableCell>
                        <TableCell className="text-right">
                          {ev.filePath && (
                            <Button variant="ghost" size="sm" onClick={() => window.open(ev.filePath, '_blank')}>
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="space-y-4 outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Audit Report</CardTitle>
              <CardDescription>Generate and export the final audit summary report.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {audit.status !== 'COMPLETED' && audit.status !== 'CLOSED' ? (
                <div className="p-6 text-center border rounded-lg bg-muted/30">
                  <FileCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <h3 className="font-medium text-lg mb-1">Report Not Ready</h3>
                  <p className="text-sm text-muted-foreground">The audit must be marked as <strong>Completed</strong> before you can generate the final report.</p>
                </div>
              ) : (
                <div className="p-6 border rounded-lg bg-green-50/50 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-lg flex items-center gap-2 text-green-900"><CheckCircle className="h-5 w-5 text-green-600" /> Audit Finalized</h3>
                      <p className="text-sm text-green-800/80 mt-1">This audit is completed. You can now generate the executive summary report.</p>
                    </div>
                    <Button className="bg-primary text-primary-foreground"><FileText className="mr-2 h-4 w-4" /> Generate PDF Report</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── DIALOGS ── */}

      {/* Add Requirements Dialog */}
      <Dialog open={addReqOpen} onOpenChange={setAddReqOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Requirements from Regulation</DialogTitle>
            <DialogDescription>Select a regulation to import all its requirements into this audit checklist.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {regulations.length === 0 && <p className="text-sm text-muted-foreground">Loading regulations...</p>}
            {regulations.map(reg => (
              <button key={reg.id} onClick={() => addRegulationRequirements(reg.id)}
                className="w-full text-left p-4 border rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-between bg-card">
                <div>
                  <div className="font-semibold text-sm">{reg.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{reg._count?.requirements || 0} requirements included</div>
                </div>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Finding Dialog */}
      <Dialog open={addFindingOpen} onOpenChange={setAddFindingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Finding</DialogTitle>
            <DialogDescription>Document an issue or non-conformance found during the audit.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="Brief description of the finding" value={findingForm.title} onChange={e => setFindingForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea placeholder="Detailed description..." rows={3} value={findingForm.description} onChange={e => setFindingForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={findingForm.severity} onValueChange={v => setFindingForm(f => ({ ...f, severity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{severityOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={findingForm.dueDate} onChange={e => setFindingForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
            </div>
            <Button className="w-full" onClick={saveFinding} disabled={savingFinding || !findingForm.title || !findingForm.description}>
              {savingFinding ? 'Saving...' : 'Record Finding'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Evidence Dialog */}
      <Dialog open={addEvidenceOpen} onOpenChange={setAddEvidenceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Evidence</DialogTitle>
            <DialogDescription>Upload supporting evidence for this audit.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* File upload area */}
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors"
              onClick={() => document.getElementById('evidence-file-input')?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  setEvidenceFile(file);
                  if (!evidenceForm.title) setEvidenceForm(f => ({ ...f, title: file.name }));
                }
              }}
            >
              <input
                id="evidence-file-input"
                type="file"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setEvidenceFile(file);
                    if (!evidenceForm.title) setEvidenceForm(f => ({ ...f, title: file.name }));
                  }
                }}
              />
              {evidenceFile ? (
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-sm font-medium">{evidenceFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(evidenceFile.size / 1024).toFixed(1)} KB</p>
                  <button className="text-xs text-destructive hover:underline" onClick={e => { e.stopPropagation(); setEvidenceFile(null); }}>Remove file</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Click to upload or drag & drop</p>
                  <p className="text-xs text-muted-foreground">PDF, Word, Excel, Images, Screenshots, etc.</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="e.g. Security Policy v2.pdf" value={evidenceForm.title} onChange={e => setEvidenceForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="What does this evidence prove?" rows={2} value={evidenceForm.description} onChange={e => setEvidenceForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={evidenceForm.type} onValueChange={v => setEvidenceForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['PDF','WORD','EXCEL','IMAGE','SCREENSHOT','CERTIFICATE','POLICY','OTHER'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input placeholder="e.g. security, gdpr" value={evidenceForm.tags} onChange={e => setEvidenceForm(f => ({ ...f, tags: e.target.value }))} />
              </div>
            </div>
            <Button className="w-full" onClick={saveEvidence} disabled={savingEvidence || (!evidenceForm.title && !evidenceFile)}>
              {savingEvidence ? 'Saving...' : 'Save Evidence'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
