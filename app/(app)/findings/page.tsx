'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Search,
  Plus,
  Filter,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  MoreHorizontal,
  Eye,
  CheckSquare,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  audit: { auditNumber: string; title: string };
  _count?: { correctiveActions: number };
}

const severityLabels: Record<string, { label: string; variant: string }> = {
  CRITICAL: { label: 'Critical', variant: 'bg-destructive text-destructive-foreground' },
  HIGH: { label: 'High', variant: 'bg-warning text-warning-foreground' },
  MEDIUM: { label: 'Medium', variant: 'bg-primary/10 text-primary' },
  LOW: { label: 'Low', variant: 'bg-muted text-muted-foreground' },
  OBSERVATION: { label: 'Observation', variant: 'bg-secondary text-secondary-foreground' },
};

const statusLabels: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  OVERDUE: 'Overdue',
};

export default function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchFindings();
  }, [search, severityFilter, statusFilter]);

  const fetchFindings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/findings?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setFindings(data);
      }
    } catch (error) {
      console.error('Failed to fetch findings:', error);
    } finally {
      setLoading(false);
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
          <p className="text-muted-foreground">
            Track and manage audit findings from identification to resolution
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Finding
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record New Finding</DialogTitle>
              <DialogDescription>
                Document a new audit finding
              </DialogDescription>
            </DialogHeader>
            <FindingForm onSuccess={() => {
              setCreateDialogOpen(false);
              fetchFindings();
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{findings.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">
              {findings.filter(f => f.severity === 'CRITICAL').length}
            </div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">
              {findings.filter(f => f.severity === 'HIGH').length}
            </div>
            <div className="text-sm text-muted-foreground">High</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {findings.filter(f => f.status === 'OPEN').length}
            </div>
            <div className="text-sm text-muted-foreground">Open</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {findings.filter(f => f.status === 'IN_PROGRESS').length}
            </div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {findings.filter(f => f.status === 'CLOSED' || f.status === 'RESOLVED').length}
            </div>
            <div className="text-sm text-muted-foreground">Resolved</div>
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
                placeholder="Search findings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                {Object.entries(severityLabels).map(([key, { label }]) => (
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

      {/* Findings Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Finding ID</TableHead>
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Audit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Loading findings...
                    </TableCell>
                  </TableRow>
                ) : findings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No findings found. Record your first finding.
                    </TableCell>
                  </TableRow>
                ) : (
                  findings.map((finding) => (
                    <TableRow key={finding.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono">{finding.findingNumber}</TableCell>
                      <TableCell>
                        <Link href={`/findings/${finding.id}`}>
                          <div className="font-medium">{finding.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[280px]">
                            {finding.description}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className={`badge ${severityLabels[finding.severity]?.variant}`}>
                          {severityLabels[finding.severity]?.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link href={`/audits/${finding.audit.auditNumber}`} className="text-primary hover:underline">
                          {finding.audit.auditNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={isOverdue(finding.dueDate, finding.status) ? 'destructive' : 'outline'}
                        >
                          {isOverdue(finding.dueDate, finding.status) ? 'OVERDUE' : statusLabels[finding.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {finding.owner ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {finding.owner.firstName} {finding.owner.lastName}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className={isOverdue(finding.dueDate, finding.status) ? 'text-destructive font-medium' : ''}>
                            {formatDate(finding.dueDate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CheckSquare className="h-4 w-4 text-muted-foreground" />
                          {finding._count?.correctiveActions || 0}
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
                              <Link href={`/findings/${finding.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckSquare className="mr-2 h-4 w-4" />
                              Add Corrective Action
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
    </div>
  );
}

function FindingForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM',
    riskLevel: '',
    evidence: '',
    recommendation: '',
    dueDate: '',
    auditId: '',
  });
  const [loading, setLoading] = useState(false);
  const [audits, setAudits] = useState<{ id: string; auditNumber: string; title: string }[]>([]);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      const response = await fetch('/api/audits');
      if (response.ok) {
        const data = await response.json();
        setAudits(data);
      }
    } catch (error) {
      console.error('Failed to fetch audits:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/findings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        }),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create finding:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="Finding title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Detailed description of the finding..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Related Audit *</Label>
          <Select
            value={formData.auditId}
            onValueChange={(value) => setFormData({ ...formData, auditId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select audit" />
            </SelectTrigger>
            <SelectContent>
              {audits.map((audit) => (
                <SelectItem key={audit.id} value={audit.id}>
                  {audit.auditNumber} - {audit.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Severity</Label>
          <Select
            value={formData.severity}
            onValueChange={(value) => setFormData({ ...formData, severity: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(severityLabels).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="riskLevel">Risk Level</Label>
          <Input
            id="riskLevel"
            placeholder="e.g., High, Medium, Low"
            value={formData.riskLevel}
            onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recommendation">Recommendation</Label>
        <Textarea
          id="recommendation"
          placeholder="Recommended corrective actions..."
          value={formData.recommendation}
          onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Recording...' : 'Record Finding'}
        </Button>
      </div>
    </form>
  );
}

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
