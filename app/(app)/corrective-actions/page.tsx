'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Plus,
  Filter,
  CheckSquare,
  Clock,
  User,
  Calendar,
  MoreHorizontal,
  Eye,
  Play,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface CorrectiveAction {
  id: string;
  actionNumber: string;
  description: string;
  department?: string;
  priority: string;
  status: string;
  progress: number;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  assignedTo: { firstName: string; lastName: string };
  finding: { findingNumber: string; title: string; severity: string };
}

const priorityLabels: Record<string, { label: string; variant: string }> = {
  CRITICAL: { label: 'Critical', variant: 'bg-destructive text-destructive-foreground' },
  HIGH: { label: 'High', variant: 'bg-warning text-warning-foreground' },
  MEDIUM: { label: 'Medium', variant: 'bg-primary/10 text-primary' },
  LOW: { label: 'Low', variant: 'bg-muted text-muted-foreground' },
};

const statusLabels: Record<string, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  PENDING_VERIFICATION: 'Pending Verification',
  COMPLETED: 'Completed',
  CLOSED: 'Closed',
  OVERDUE: 'Overdue',
};

export default function CorrectiveActionsPage() {
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [caForm, setCaForm] = useState({ description: '', department: '', priority: 'MEDIUM', dueDate: '', assignedToId: '', findingId: '' });
  const [findings, setFindings] = useState<{ id: string; findingNumber: string; title: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [saving, setSaving] = useState(false);

  // Update Progress dialog
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<CorrectiveAction | null>(null);
  const [newProgress, setNewProgress] = useState(0);
  const [updatingProgress, setUpdatingProgress] = useState(false);

  useEffect(() => {
    fetchActions();
  }, [search, priorityFilter, statusFilter]);

  const fetchActions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/corrective-actions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setActions(data);
      }
    } catch (error) {
      console.error('Failed to fetch corrective actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFindings = async () => {
    try {
      const res = await fetch('/api/findings');
      if (res.ok) setFindings(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) { const d = await res.json(); setUsers([d.user]); }
    } catch (e) { console.error(e); }
  };

  const openCreateDialog = () => {
    fetchFindings();
    fetchUsers();
    setCaForm({ description: '', department: '', priority: 'MEDIUM', dueDate: '', assignedToId: '', findingId: '' });
    setCreateDialogOpen(true);
  };

  const saveAction = async () => {
    if (!caForm.description || !caForm.findingId || !caForm.assignedToId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/corrective-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...caForm, dueDate: caForm.dueDate || null }),
      });
      if (res.ok) { setCreateDialogOpen(false); fetchActions(); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const openProgressDialog = (action: CorrectiveAction) => {
    setSelectedAction(action);
    setNewProgress(action.progress);
    setProgressDialogOpen(true);
  };

  const updateProgress = async () => {
    if (!selectedAction) return;
    setUpdatingProgress(true);
    try {
      const res = await fetch('/api/corrective-actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedAction.id, progress: newProgress }),
      });
      if (res.ok) { setProgressDialogOpen(false); fetchActions(); }
    } catch (e) { console.error(e); }
    finally { setUpdatingProgress(false); }
  };

  const markComplete = async (action: CorrectiveAction) => {
    try {
      const res = await fetch('/api/corrective-actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: action.id, status: 'COMPLETED', progress: 100 }),
      });
      if (res.ok) fetchActions();
    } catch (e) { console.error(e); }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (dueDate?: string, status?: string) => {
    if (!dueDate || status === 'CLOSED' || status === 'COMPLETED') return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Corrective Actions</h1>
          <p className="text-muted-foreground">
            Track and manage remediation activities for audit findings
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Action
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{actions.length}</div>
            <div className="text-sm text-muted-foreground">Total Actions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">
              {actions.filter(a => a.status === 'NOT_STARTED').length}
            </div>
            <div className="text-sm text-muted-foreground">Not Started</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {actions.filter(a => a.status === 'IN_PROGRESS').length}
            </div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {actions.filter(a => a.status === 'COMPLETED' || a.status === 'CLOSED').length}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">
              {actions.filter(a => isOverdue(a.dueDate, a.status)).length}
            </div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search actions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {Object.entries(priorityLabels).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions Table */}
      <Card>        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action ID</TableHead>
                  <TableHead className="w-[300px]">Description</TableHead>
                  <TableHead>Related Finding</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : actions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No corrective actions found
                    </TableCell>
                  </TableRow>
                ) : (
                  actions.map((action) => (
                    <TableRow key={action.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono">{action.actionNumber}</TableCell>
                      <TableCell>
                        <div className="font-medium">{action.description}</div>
                        {action.department && (
                          <Badge variant="outline" className="mt-1">{action.department}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={`/findings/${action.finding.findingNumber}`} className="text-primary hover:underline">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`h-4 w-4 ${
                              action.finding.severity === 'CRITICAL' ? 'text-destructive' : 'text-muted-foreground'
                            }`} />
                            {action.finding.findingNumber}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className={`badge ${priorityLabels[action.priority]?.variant}`}>
                          {priorityLabels[action.priority]?.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {action.assignedTo.firstName} {action.assignedTo.lastName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 w-32">
                          <Progress value={action.progress} className="flex-1" />
                          <span className="text-xs text-muted-foreground">{action.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={isOverdue(action.dueDate, action.status) ? 'destructive' : 'outline'}
                        >
                          {isOverdue(action.dueDate, action.status) ? 'OVERDUE' : statusLabels[action.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className={isOverdue(action.dueDate, action.status) ? 'text-destructive' : ''}>
                            {formatDate(action.dueDate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openProgressDialog(action)}>
                              <Play className="mr-2 h-4 w-4" />
                              Update Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => markComplete(action)} disabled={action.status === 'COMPLETED' || action.status === 'CLOSED'}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Complete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Update Progress Dialog */}
      <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Progress</DialogTitle>
            <DialogDescription>
              {selectedAction && <span className="font-medium">{selectedAction.actionNumber}</span>}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {selectedAction && (
              <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground line-clamp-2">
                {selectedAction.description}
              </div>
            )}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Progress</Label>
                <span className="text-2xl font-bold">{newProgress}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={newProgress}
                onChange={e => setNewProgress(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[0, 25, 50, 75, 100].map(v => (
                  <Button key={v} variant={newProgress === v ? 'default' : 'outline'} size="sm" onClick={() => setNewProgress(v)}>
                    {v}%
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setProgressDialogOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={updateProgress} disabled={updatingProgress}>
                {updatingProgress ? 'Saving...' : 'Save Progress'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Corrective Action Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Corrective Action</DialogTitle>
            <DialogDescription>Create a corrective action to remediate a finding.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Related Finding *</Label>
              <Select value={caForm.findingId} onValueChange={v => setCaForm(f => ({ ...f, findingId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select finding..." /></SelectTrigger>
                <SelectContent>
                  {findings.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.findingNumber} — {f.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <Button variant="outline" className="flex-1" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button
                className="flex-1"
                onClick={saveAction}
                disabled={saving || !caForm.description || !caForm.findingId || !caForm.assignedToId}
              >
                {saving ? 'Saving...' : 'Create Action'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
