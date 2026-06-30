'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Search, Plus, Filter, AlertTriangle, User, Calendar,
  MoreHorizontal, Eye, CheckSquare, ShieldAlert,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface Finding {
  id: string;
  findingNumber: string;
  title: string;
  description: string;
  severity: string;
  riskLevel?: string;
  status: string;
  dueDate?: string;
  createdAt: string;
  reporter: { firstName: string; lastName: string };
  owner?: { firstName: string; lastName: string };
  audit: { id: string; auditNumber: string; title: string };
  _count?: { correctiveActions: number };
}

const severityLabels: Record<string, { label: string; variant: string }> = {
  CRITICAL:    { label: 'Critical',    variant: 'bg-destructive text-destructive-foreground' },
  HIGH:        { label: 'High',        variant: 'bg-warning text-warning-foreground' },
  MEDIUM:      { label: 'Medium',      variant: 'bg-primary/10 text-primary' },
  LOW:         { label: 'Low',         variant: 'bg-muted text-muted-foreground' },
  OBSERVATION: { label: 'Observation', variant: 'bg-secondary text-secondary-foreground' },
};

const statusLabels: Record<string, string> = {
  OPEN: 'Open', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed', OVERDUE: 'Overdue',
};

// Priority suggestion based on severity
const severityToPriority: Record<string, string> = {
  CRITICAL: 'CRITICAL', HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW', OBSERVATION: 'LOW',
};

export default function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Corrective action dialog state
  const [caDialogOpen, setCaDialogOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [caForm, setCaForm] = useState({ description: '', department: '', priority: 'MEDIUM', dueDate: '', assignedToId: '' });
  const [users, setUsers] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [savingCa, setSavingCa] = useState(false);

  useEffect(() => { fetchFindings(); }, [search, severityFilter, statusFilter]);

  const fetchFindings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      const response = await fetch(`/api/findings?${params.toString()}`);
      if (response.ok) setFindings(await response.json());
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/me');
      // Fallback: use current user only
      if (res.ok) {
        const data = await res.json();
        setUsers([data.user]);
      }
    } catch (e) { console.error(e); }
  };

  const openCaDialog = (finding: Finding) => {
    setSelectedFinding(finding);
    setCaForm({
      description: `Remediate finding: ${finding.title}`,
      department: '',
      priority: severityToPriority[finding.severity] || 'MEDIUM',
      dueDate: '',
      assignedToId: '',
    });
    fetchUsers();
    setCaDialogOpen(true);
  };

  const saveCa = async () => {
    if (!selectedFinding || !caForm.description || !caForm.assignedToId) return;
    setSavingCa(true);
    try {
      const res = await fetch('/api/corrective-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...caForm, findingId: selectedFinding.id, dueDate: caForm.dueDate || null }),
      });
      if (res.ok) {
        setCaDialogOpen(false);
        fetchFindings();
      }
    } catch (e) { console.error(e); }
    finally { setSavingCa(false); }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isOverdue = (dueDate?: string, status?: string) => {
    if (!dueDate || status === 'CLOSED' || status === 'RESOLVED') return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Findings Management</h1>
          <p className="text-muted-foreground">Track and manage audit findings from identification to resolution</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Record Finding</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record New Finding</DialogTitle>
              <DialogDescription>Document a new audit finding</DialogDescription>
            </DialogHeader>
            <FindingForm onSuccess={() => { setCreateDialogOpen(false); fetchFindings(); }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total',       value: findings.length,                                                          color: '' },
          { label: 'Critical',    value: findings.filter(f => f.severity === 'CRITICAL').length,                   color: 'text-destructive' },
          { label: 'High',        value: findings.filter(f => f.severity === 'HIGH').length,                       color: 'text-warning' },
          { label: 'Open',        value: findings.filter(f => f.status === 'OPEN').length,                         color: '' },
          { label: 'In Progress', value: findings.filter(f => f.status === 'IN_PROGRESS').length,                  color: '' },
          { label: 'Resolved',    value: findings.filter(f => f.status === 'CLOSED' || f.status === 'RESOLVED').length, color: 'text-success' },
        ].map(({ label, value, color }) => (
          <Card key={label}><CardContent className="p-4">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search findings..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[160px]"><Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                {Object.entries(severityLabels).map(([key, { label }]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusLabels).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Findings Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Finding ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Audit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading findings...</TableCell></TableRow>
                ) : findings.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No findings found. Record your first finding.</TableCell></TableRow>
                ) : findings.map((finding) => (
                  <TableRow key={finding.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{finding.findingNumber}</TableCell>
                    <TableCell>
                      <Link href={`/findings/${finding.id}`}>
                        <div className="font-medium hover:underline">{finding.title}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[240px]">{finding.description}</div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className={`badge ${severityLabels[finding.severity]?.variant}`}>{severityLabels[finding.severity]?.label}</span>
                    </TableCell>
                    <TableCell>
                      <Link href={`/audits/${finding.audit.id}`} className="text-primary hover:underline text-sm">{finding.audit.auditNumber}</Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isOverdue(finding.dueDate, finding.status) ? 'destructive' : 'outline'}>
                        {isOverdue(finding.dueDate, finding.status) ? 'OVERDUE' : statusLabels[finding.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {finding.owner
                        ? <div className="flex items-center gap-1 text-sm"><User className="h-3 w-3 text-muted-foreground" />{finding.owner.firstName} {finding.owner.lastName}</div>
                        : <span className="text-muted-foreground text-sm">Unassigned</span>}
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm ${isOverdue(finding.dueDate, finding.status) ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                        {formatDate(finding.dueDate)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem asChild>
                            <Link href={`/findings/${finding.id}`} className="flex items-center">
                              <Eye className="mr-2 h-4 w-4" />View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openCaDialog(finding)}>
                            <ShieldAlert className="mr-2 h-4 w-4 text-warning" />
                            Add Corrective Action
                            {(finding._count?.correctiveActions || 0) > 0 && (
                              <span className="ml-auto text-xs text-muted-foreground">{finding._count?.correctiveActions} existing</span>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/corrective-actions?findingId=${finding.id}`} className="flex items-center">
                              <CheckSquare className="mr-2 h-4 w-4" />
                              View Actions ({finding._count?.correctiveActions || 0})
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Corrective Action Dialog */}
      <Dialog open={caDialogOpen} onOpenChange={setCaDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Corrective Action</DialogTitle>
            <DialogDescription>
              {selectedFinding && (
                <span>For finding <strong>{selectedFinding.findingNumber}</strong> â€” <span className={`badge ${severityLabels[selectedFinding.severity]?.variant}`}>{severityLabels[selectedFinding.severity]?.label}</span></span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Finding summary */}
            {selectedFinding && (
              <div className="p-3 bg-muted rounded-md text-sm">
                <div className="font-medium">{selectedFinding.title}</div>
                <div className="text-muted-foreground text-xs mt-1 line-clamp-2">{selectedFinding.description}</div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Action Description *</Label>
              <Textarea
                placeholder="Describe what needs to be done to fix this issue..."
                rows={3}
                value={caForm.description}
                onChange={e => setCaForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={caForm.priority} onValueChange={v => setCaForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['CRITICAL','HIGH','MEDIUM','LOW'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={caForm.dueDate} onChange={e => setCaForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Department</Label>
                <Input placeholder="e.g., IT, Finance" value={caForm.department} onChange={e => setCaForm(f => ({ ...f, department: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Assign To *</Label>
                <Select value={caForm.assignedToId} onValueChange={v => setCaForm(f => ({ ...f, assignedToId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select person..." /></SelectTrigger>
                  <SelectContent>
                    {users.map(u => <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setCaDialogOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={saveCa} disabled={savingCa || !caForm.description || !caForm.assignedToId}>
                {savingCa ? 'Saving...' : 'Create Action'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FindingForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '', description: '', severity: 'MEDIUM', riskLevel: '',
    evidence: '', recommendation: '', dueDate: '', auditId: '',
  });
  const [loading, setLoading] = useState(false);
  const [audits, setAudits] = useState<{ id: string; auditNumber: string; title: string }[]>([]);

  useEffect(() => {
    fetch('/api/audits').then(r => r.ok ? r.json() : []).then(setAudits).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/findings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, dueDate: formData.dueDate ? new Date(formData.dueDate) : null }),
      });
      if (response.ok) onSuccess();
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" placeholder="Finding title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" placeholder="Detailed description of the finding..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Related Audit *</Label>
          <Select value={formData.auditId} onValueChange={v => setFormData({ ...formData, auditId: v })}>
            <SelectTrigger><SelectValue placeholder="Select audit" /></SelectTrigger>
            <SelectContent>{audits.map(a => <SelectItem key={a.id} value={a.id}>{a.auditNumber} - {a.title}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Severity</Label>
          <Select value={formData.severity} onValueChange={v => setFormData({ ...formData, severity: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(severityLabels).map(([k, { label }]) => <SelectItem key={k} value={k}>{label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="riskLevel">Risk Level</Label>
          <Input id="riskLevel" placeholder="e.g., High, Medium, Low" value={formData.riskLevel} onChange={e => setFormData({ ...formData, riskLevel: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input id="dueDate" type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="recommendation">Recommendation</Label>
        <Textarea id="recommendation" placeholder="Recommended corrective actions..." value={formData.recommendation} onChange={e => setFormData({ ...formData, recommendation: e.target.value })} rows={2} />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Recording...' : 'Record Finding'}</Button>
      </div>
    </form>
  );
}
