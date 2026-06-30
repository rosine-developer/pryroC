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
        <Button onClick={() => setCreateDialogOpen(true)}>
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
      <Card>
        <CardContent className="p-0">
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Play className="mr-2 h-4 w-4" />
                              Update Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem>
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
    </div>
  );
}
