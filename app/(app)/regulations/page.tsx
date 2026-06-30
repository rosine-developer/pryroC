'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Search,
  Plus,
  Filter,
  FileText,
  Globe,
  Building,
  Calendar,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface Regulation {
  id: string;
  name: string;
  description?: string;
  authority: string;
  country?: string;
  region?: string;
  category: string;
  version?: string;
  effectiveDate?: string;
  status: string;
  createdAt: string;
  _count?: { requirements: number };
}

const categoryLabels: Record<string, string> = {
  DATA_PRIVACY: 'Data Privacy',
  INFORMATION_SECURITY: 'Information Security',
  FINANCIAL: 'Financial',
  OPERATIONAL: 'Operational',
  LEGAL: 'Legal',
  INDUSTRY_SPECIFIC: 'Industry Specific',
  INTERNAL_POLICY: 'Internal Policy',
  LABOR: 'Labor',
  ENVIRONMENTAL: 'Environmental',
  QUALITY: 'Quality',
};

const statusLabels: Record<string, { label: string; variant: string }> = {
  ACTIVE: { label: 'Active', variant: 'bg-success/10 text-success' },
  DRAFT: { label: 'Draft', variant: 'bg-muted text-muted-foreground' },
  UNDER_REVIEW: { label: 'Under Review', variant: 'bg-warning/10 text-warning' },
  SUPERSEDED: { label: 'Superseded', variant: 'bg-secondary text-secondary-foreground' },
  WITHDRAWN: { label: 'Withdrawn', variant: 'bg-destructive/10 text-destructive' },
};

export default function RegulationsPage() {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchRegulations();
  }, [search, categoryFilter, statusFilter]);

  const fetchRegulations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/regulations?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setRegulations(data);
      }
    } catch (error) {
      console.error('Failed to fetch regulations:', error);
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

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Regulatory Matrix</h1>
          <p className="text-muted-foreground">
            Unified library of all regulations, standards, and compliance requirements
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Regulation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Regulation</DialogTitle>
              <DialogDescription>
                Add a new regulation to the unified regulatory matrix
              </DialogDescription>
            </DialogHeader>
            <RegulationForm onSuccess={() => {
              setCreateDialogOpen(false);
              fetchRegulations();
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search regulations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
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

      {/* Regulations Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Regulation</TableHead>
                  <TableHead>Authority</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Requirements</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Loading regulations...
                    </TableCell>
                  </TableRow>
                ) : regulations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No regulations found. Add your first regulation to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  regulations.map((reg) => (
                    <TableRow key={reg.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Link href={`/regulations/${reg.id}`}>
                          <div className="font-medium">{reg.name}</div>
                          {reg.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-[280px]">
                              {reg.description}
                            </div>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {reg.authority}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{categoryLabels[reg.category] || reg.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          {reg.country || reg.region || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {reg._count?.requirements || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`badge ${statusLabels[reg.status]?.variant || 'badge-muted'}`}>
                          {statusLabels[reg.status]?.label || reg.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(reg.effectiveDate)}
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
                              <Link href={`/regulations/${reg.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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

function RegulationForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    authority: '',
    country: '',
    region: '',
    category: 'INFORMATION_SECURITY',
    version: '',
    effectiveDate: '',
    externalUrl: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/regulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'ACTIVE',
        }),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create regulation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            placeholder="e.g., GDPR, ISO 27001"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="authority">Authority *</Label>
          <Input
            id="authority"
            placeholder="e.g., European Union, ISO"
            value={formData.authority}
            onChange={(e) => setFormData({ ...formData, authority: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Brief description of the regulation..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            placeholder="e.g., United States"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Input
            id="region"
            placeholder="e.g., EU, APAC"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            placeholder="e.g., 2024, v2.0"
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="effectiveDate">Effective Date</Label>
          <Input
            id="effectiveDate"
            type="date"
            value={formData.effectiveDate}
            onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="externalUrl">External URL</Label>
        <Input
          id="externalUrl"
          type="url"
          placeholder="https://..."
          value={formData.externalUrl}
          onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Regulation'}
        </Button>
      </div>
    </form>
  );
}
