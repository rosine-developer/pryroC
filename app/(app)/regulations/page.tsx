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
  externalUrl?: string;
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | null>(null);

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this regulation?')) return;
    try {
      const response = await fetch(`/api/regulations/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) fetchRegulations();
    } catch (error) {
      console.error('Failed to delete regulation:', error);
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
        
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Regulation</DialogTitle>
              <DialogDescription>
                Update the details of the regulation
              </DialogDescription>
            </DialogHeader>
            {selectedRegulation && (
              <RegulationForm 
                initialData={selectedRegulation}
                onSuccess={() => {
                  setEditDialogOpen(false);
                  fetchRegulations();
                }} 
              />
            )}
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
                            <DropdownMenuItem onClick={() => {
                              setSelectedRegulation(reg);
                              setEditDialogOpen(true);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(reg.id)}>
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

function RegulationForm({ onSuccess, initialData }: { onSuccess: () => void, initialData?: Regulation }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    authority: initialData?.authority || '',
    country: initialData?.country || '',
    region: initialData?.region || '',
    category: initialData?.category || 'INFORMATION_SECURITY',
    version: initialData?.version || '',
    effectiveDate: initialData?.effectiveDate ? new Date(initialData.effectiveDate).toISOString().split('T')[0] : '',
    externalUrl: initialData?.externalUrl || '',
    status: initialData?.status || 'ACTIVE',
  });
  const [loading, setLoading] = useState(false);

  const authorities = [
    'ISO/IEC', 'ISO', 'IEC', 'NIST', 'AICPA',
    'European Parliament', 'European Commission',
    'U.S. Congress / SEC', 'U.S. Department of Health and Human Services',
    'PCI Security Standards Council', 'Basel Committee on Banking Supervision (BIS)',
    'International Labour Organization (ILO)', 'California State Legislature',
    'UK Parliament', 'Australian Government', 'Canadian Government',
    'Financial Conduct Authority (FCA)', 'ENISA', 'GDPR Authority',
    'Other',
  ];

  const countries = [
    'International', 'European Union', 'United States', 'United Kingdom',
    'Canada', 'Australia', 'Germany', 'France', 'Netherlands', 'Sweden',
    'Singapore', 'Japan', 'China', 'India', 'Brazil', 'South Africa',
    'Rwanda', 'Kenya', 'Nigeria', 'Other',
  ];

  const regions = [
    'Global', 'Europe', 'North America', 'South America', 'Asia Pacific',
    'Middle East & Africa', 'East Africa', 'West Africa', 'Southern Africa',
    'North Africa', 'Southeast Asia', 'South Asia', 'Oceania', 'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = initialData ? `/api/regulations/${initialData.id}` : '/api/regulations';
      const method = initialData ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status: formData.status || 'ACTIVE' }),
      });
      if (response.ok) onSuccess();
    } catch (error) {
      console.error('Failed to save regulation:', error);
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
          <Label>Authority *</Label>
          <Select
            value={formData.authority}
            onValueChange={(v) => setFormData({ ...formData, authority: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select authority..." />
            </SelectTrigger>
            <SelectContent>
              {authorities.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <Label>Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(v) => setFormData({ ...formData, category: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Country</Label>
          <Select
            value={formData.country}
            onValueChange={(v) => setFormData({ ...formData, country: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country..." />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Region</Label>
          <Select
            value={formData.region}
            onValueChange={(v) => setFormData({ ...formData, region: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select region..." />
            </SelectTrigger>
            <SelectContent>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Version</Label>
          <Select
            value={formData.version}
            onValueChange={(v) => setFormData({ ...formData, version: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select version..." />
            </SelectTrigger>
            <SelectContent>
              {['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017',
                '2016', '2015', '2014', '2013', '2012', '2011', '2010',
                'v1.0', 'v2.0', 'v3.0', 'v4.0', 'v5.0',
                'v1.1', 'v2.1', 'v3.1', 'v4.1',
                'Rev 1', 'Rev 2', 'Rev 3',
                'Edition 1', 'Edition 2', 'Edition 3',
              ].map((v) => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
        <Button type="submit" disabled={loading || !formData.name || !formData.authority}>
          {loading ? 'Saving...' : initialData ? 'Update Regulation' : 'Create Regulation'}
        </Button>
      </div>
    </form>
  );
}
