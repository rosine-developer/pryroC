'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Plus,
  Filter,
  ClipboardCheck,
  Calendar,
  Clock,
  Users,
  Building,
  MoreHorizontal,
  Eye,
  Play,
  Pause,
  CheckCircle,
  FileText,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface Audit {
  id: string;
  auditNumber: string;
  type: string;
  title: string;
  objective?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  progress: number;
  createdAt: string;
  leadAuditor: { firstName: string; lastName: string };
  _count?: { auditors: number; findings: number; evidence: number };
}

const statusLabels: Record<string, { label: string; variant: string }> = {
  PLANNING: { label: 'Planning', variant: 'bg-muted text-muted-foreground' },
  SCHEDULED: { label: 'Scheduled', variant: 'bg-info/10 text-info' },
  IN_PROGRESS: { label: 'In Progress', variant: 'bg-warning/10 text-warning' },
  PAUSED: { label: 'Paused', variant: 'bg-muted text-muted-foreground' },
  COMPLETED: { label: 'Completed', variant: 'bg-success/10 text-success' },
  CLOSED: { label: 'Closed', variant: 'bg-success/10 text-success' },
};

const typeLabels: Record<string, string> = {
  INTERNAL: 'Internal Audit',
  EXTERNAL: 'External Audit',
  COMPLIANCE: 'Compliance Audit',
  OPERATIONAL: 'Operational Audit',
  FINANCIAL: 'Financial Audit',
  IT: 'IT Audit',
  SPECIAL: 'Special Audit',
};

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchAudits();
  }, [search, statusFilter, typeFilter]);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const response = await fetch(`/api/audits?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAudits(data);
      }
    } catch (error) {
      console.error('Failed to fetch audits:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (auditId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/audits/${auditId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === 'IN_PROGRESS' ? { startDate: new Date().toISOString() } : {}),
          ...(newStatus === 'COMPLETED' ? { endDate: new Date().toISOString(), progress: 100 } : {}),
        }),
      });
      if (res.ok) {
        fetchAudits();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Management</h1>
          <p className="text-muted-foreground">
            Plan, execute, and track audits from start to completion
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Audit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Audit</DialogTitle>
              <DialogDescription>
                Start a new audit engagement
              </DialogDescription>
            </DialogHeader>
            <AuditForm onSuccess={() => {
              setCreateDialogOpen(false);
              fetchAudits();
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {audits.filter(a => a.status === 'IN_PROGRESS' || a.status === 'SCHEDULED').length}
            </div>
            <div className="text-sm text-muted-foreground">Active Audits</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {audits.filter(a => a.status === 'COMPLETED' || a.status === 'CLOSED').length}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">
              {audits.filter(a => a.status === 'PLANNING').length}
            </div>
            <div className="text-sm text-muted-foreground">Planning</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {audits.filter(a => a.status === 'PAUSED').length}
            </div>
            <div className="text-sm text-muted-foreground">Paused</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {audits.reduce((sum, a) => sum + (a._count?.findings || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Findings</div>
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
                placeholder="Search audits..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Audit Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(typeLabels).map(([key, label]) => (
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
                {Object.entries(statusLabels).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audits Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Audit Number</TableHead>
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Lead Auditor</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Findings</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Loading audits...
                    </TableCell>
                  </TableRow>
                ) : audits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No audits found. Create your first audit to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  audits.map((audit) => (
                    <TableRow key={audit.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Link href={`/audits/${audit.id}`} className="font-mono font-medium">
                          {audit.auditNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/audits/${audit.id}`}>
                          <div className="font-medium">{audit.title}</div>
                          {audit.objective && (
                            <div className="text-sm text-muted-foreground truncate max-w-[280px]">
                              {audit.objective}
                            </div>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{typeLabels[audit.type] || audit.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {audit.department || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {audit.leadAuditor.firstName} {audit.leadAuditor.lastName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(audit.startDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`badge ${statusLabels[audit.status]?.variant}`}>
                          {statusLabels[audit.status]?.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 w-32">
                          <Progress value={audit.progress} className="flex-1" />
                          <span className="text-xs text-muted-foreground w-8">{audit.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {audit._count?.findings || 0}
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
                            <DropdownMenuItem asChild>
                              <Link href={`/audits/${audit.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {audit.status === 'PLANNING' && (
                              <DropdownMenuItem onClick={() => updateStatus(audit.id, 'IN_PROGRESS')}>
                                <Play className="mr-2 h-4 w-4" />
                                Start Audit
                              </DropdownMenuItem>
                            )}
                            {audit.status === 'IN_PROGRESS' && (
                              <DropdownMenuItem onClick={() => updateStatus(audit.id, 'PAUSED')}>
                                <Pause className="mr-2 h-4 w-4" />
                                Pause Audit
                              </DropdownMenuItem>
                            )}
                            {audit.status === 'PAUSED' && (
                              <DropdownMenuItem onClick={() => updateStatus(audit.id, 'IN_PROGRESS')}>
                                <Play className="mr-2 h-4 w-4" />
                                Resume Audit
                              </DropdownMenuItem>
                            )}
                            {(audit.status === 'IN_PROGRESS' || audit.status === 'PAUSED') && (
                              <DropdownMenuItem onClick={() => updateStatus(audit.id, 'COMPLETED')}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Complete
                              </DropdownMenuItem>
                            )}
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
    </div>
  );
}

function AuditForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    type: 'INTERNAL',
    title: '',
    objective: '',
    scope: '',
    department: '',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate ? new Date(formData.startDate) : null,
          endDate: formData.endDate ? new Date(formData.endDate) : null,
        }),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create audit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Audit Title *</Label>
        <Input
          id="title"
          placeholder="e.g., Q1 2024 Security Audit"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Audit Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(typeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Department *</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => setFormData({ ...formData, department: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IT">IT / Technology</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Security">Security</SelectItem>
              <SelectItem value="HR">Human Resources</SelectItem>
              <SelectItem value="Legal">Legal & Compliance</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Procurement">Procurement</SelectItem>
              <SelectItem value="R&D">Research & Development</SelectItem>
              <SelectItem value="Executive">Executive</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="objective">Objective</Label>
        <Textarea
          id="objective"
          placeholder="What is the goal of this audit?"
          value={formData.objective}
          onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scope">Scope</Label>
        <Textarea
          id="scope"
          placeholder="Define the scope of this audit..."
          value={formData.scope}
          onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Audit'}
        </Button>
      </div>
    </form>
  );
}

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
