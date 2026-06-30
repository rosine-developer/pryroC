'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Building,
  Globe,
  Calendar,
  FileText,
  Plus,
  ExternalLink,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
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
  externalUrl?: string;
  createdAt: string;
}

interface Requirement {
  id: string;
  requirementId: string;
  title: string;
  description?: string;
  requirementType: string;
  responsibleDepartment?: string;
  priority: string;
  status: string;
  reviewFrequency?: string;
  _count?: { evidence: number; findings: number };
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
};

const requirementStatusLabels: Record<string, { label: string; icon: typeof CheckCircle }> = {
  COMPLIANT: { label: 'Compliant', icon: CheckCircle },
  NON_COMPLIANT: { label: 'Non-Compliant', icon: AlertTriangle },
  PARTIALLY_COMPLIANT: { label: 'Partially Compliant', icon: Clock },
  NOT_APPLICABLE: { label: 'N/A', icon: FileText },
  PENDING_REVIEW: { label: 'Pending Review', icon: Clock },
};

export default function RegulationDetailPage() {
  const params = useParams();
  const [regulation, setRegulation] = useState<Regulation | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchRegulation();
  }, [params.id]);

  const fetchRegulation = async () => {
    setLoading(true);
    try {
      const [regResponse, reqResponse] = await Promise.all([
        fetch(`/api/regulations/${params.id}`),
        fetch(`/api/regulations/${params.id}/requirements`),
      ]);

      if (regResponse.ok) {
        const data = await regResponse.json();
        setRegulation(data);
      }

      if (reqResponse.ok) {
        const data = await reqResponse.json();
        setRequirements(data);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
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

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!regulation) {
    return (
      <div className="p-8">
        <div className="text-center text-muted-foreground">Regulation not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Back Button */}
      <Link href="/regulations">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Regulations
        </Button>
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{regulation.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <span className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                {regulation.authority}
              </span>
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {regulation.country || regulation.region || 'Global'}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(regulation.effectiveDate)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{categoryLabels[regulation.category]}</Badge>
            <span className={`badge ${statusLabels[regulation.status]?.variant}`}>
              {statusLabels[regulation.status]?.label}
            </span>
            {regulation.externalUrl && (
              <a href={regulation.externalUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Original
                </Button>
              </a>
            )}
          </div>
        </div>
        {regulation.description && (
          <p className="text-muted-foreground max-w-3xl">{regulation.description}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{requirements.length}</div>
            <div className="text-sm text-muted-foreground">Total Requirements</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {requirements.filter(r => r.status === 'COMPLIANT').length}
            </div>
            <div className="text-sm text-muted-foreground">Compliant</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">
              {requirements.filter(r => r.status === 'NON_COMPLIANT').length}
            </div>
            <div className="text-sm text-muted-foreground">Non-Compliant</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">
              {requirements.filter(r => r.status === 'PENDING_REVIEW').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="requirements" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Requirement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Requirement</DialogTitle>
                <DialogDescription>
                  Add a new compliance requirement to this regulation
                </DialogDescription>
              </DialogHeader>
              <RequirementForm
                regulationId={params.id as string}
                onSuccess={() => {
                  setCreateDialogOpen(false);
                  fetchRegulation();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="requirements">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">ID</TableHead>
                      <TableHead className="w-[300px]">Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Evidence</TableHead>
                      <TableHead>Findings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requirements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No requirements found. Add your first requirement.
                        </TableCell>
                      </TableRow>
                    ) : (
                      requirements.map((req) => {
                        const StatusIcon = requirementStatusLabels[req.status]?.icon || Clock;
                        return (
                          <TableRow key={req.id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-mono text-sm">{req.requirementId}</TableCell>
                            <TableCell>
                              <div className="font-medium">{req.title}</div>
                              {req.description && (
                                <div className="text-sm text-muted-foreground truncate max-w-[280px]">
                                  {req.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{req.requirementType}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className={`badge ${req.priority === 'CRITICAL' ? 'badge-destructive' : req.priority === 'HIGH' ? 'badge-warning' : 'badge-muted'}`}>
                                {req.priority}
                              </span>
                            </TableCell>
                            <TableCell>{req.responsibleDepartment || '-'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <StatusIcon className={`h-4 w-4 ${
                                  req.status === 'COMPLIANT' ? 'text-success' :
                                  req.status === 'NON_COMPLIANT' ? 'text-destructive' :
                                  'text-warning'
                                }`} />
                                {requirementStatusLabels[req.status]?.label}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                {req._count?.evidence || 0}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                {req._count?.findings || 0}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Regulation History</CardTitle>
              <CardDescription>Complete audit trail for this regulation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-center py-8">
                Audit trail will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RequirementForm({ regulationId, onSuccess }: { regulationId: string; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirementType: 'MANDATORY',
    responsibleDepartment: '',
    priority: 'MEDIUM',
    reviewFrequency: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/regulations/${regulationId}/requirements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create requirement:', error);
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
          placeholder="Requirement title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Detailed requirement description..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={formData.requirementType}
            onValueChange={(value) => setFormData({ ...formData, requirementType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MANDATORY">Mandatory</SelectItem>
              <SelectItem value="RECOMMENDED">Recommended</SelectItem>
              <SelectItem value="OPTIONAL">Optional</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Responsible Department</Label>
          <Input
            id="department"
            placeholder="e.g., Security, HR, Finance"
            value={formData.responsibleDepartment}
            onChange={(e) => setFormData({ ...formData, responsibleDepartment: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="frequency">Review Frequency</Label>
          <Input
            id="frequency"
            placeholder="e.g., Annual, Quarterly"
            value={formData.reviewFrequency}
            onChange={(e) => setFormData({ ...formData, reviewFrequency: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Requirement'}
        </Button>
      </div>
    </form>
  );
}
