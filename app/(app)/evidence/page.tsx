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
import {
  Search,
  Upload,
  Filter,
  FileText,
  FileImage,
  FileVideo,
  FileSpreadsheet,
  File,
  Clock,
  User,
  Eye,
  Download,
  MoreHorizontal,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface Evidence {
  id: string;
  evidenceId: string;
  title: string;
  description?: string;
  type: string;
  classification: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  version: string;
  tags: string;
  status: string;
  uploadedAt: string;
  lastModified: string;
  uploadedBy: { firstName: string; lastName: string };
  approvedBy?: { firstName: string; lastName: string };
  requirement?: { title: string; requirementId: string };
  audit?: { title: string; auditNumber: string };
}

const typeIcons: Record<string, typeof File> = {
  PDF: FileText,
  WORD: FileText,
  EXCEL: FileSpreadsheet,
  IMAGE: FileImage,
  SCREENSHOT: FileImage,
  CERTIFICATE: FileText,
  POLICY: FileText,
  VIDEO: FileVideo,
  OTHER: File,
};

const statusLabels: Record<string, { label: string; icon: typeof CheckCircle; variant: string }> = {
  DRAFT: { label: 'Draft', icon: Clock, variant: 'bg-muted text-muted-foreground' },
  PENDING_REVIEW: { label: 'Pending', icon: Clock, variant: 'bg-warning/10 text-warning' },
  APPROVED: { label: 'Approved', icon: CheckCircle, variant: 'bg-success/10 text-success' },
  REJECTED: { label: 'Rejected', icon: XCircle, variant: 'bg-destructive/10 text-destructive' },
  ARCHIVED: { label: 'Archived', icon: File, variant: 'bg-muted text-muted-foreground' },
};

const typeLabels: Record<string, string> = {
  PDF: 'PDF',
  WORD: 'Word',
  EXCEL: 'Excel',
  IMAGE: 'Image',
  SCREENSHOT: 'Screenshot',
  CERTIFICATE: 'Certificate',
  POLICY: 'Policy',
  VIDEO: 'Video',
  OTHER: 'Other',
};

const classificationLabels: Record<string, string> = {
  EVIDENCE: 'Evidence',
  FINDING: 'Finding Report',
  POLICY: 'Policy Document',
  CERTIFICATE: 'Certificate',
  OTHER: 'Other',
};

export default function EvidencePage() {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    fetchEvidence();
  }, [search, typeFilter, statusFilter, classificationFilter]);

  const fetchEvidence = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (classificationFilter !== 'all') params.append('classification', classificationFilter);

      const response = await fetch(`/api/evidence?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setEvidence(data);
      }
    } catch (error) {
      console.error('Failed to fetch evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this evidence?')) return;
    try {
      const response = await fetch(`/api/evidence/${id}`, { method: 'DELETE' });
      if (response.ok) fetchEvidence();
    } catch (error) {
      console.error('Failed to delete evidence:', error);
    }
  };

  const formatDate = (dateStr: string) => {
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
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Secure repository for all documents, findings, and evidence.
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Evidence
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload Evidence</DialogTitle>
              <DialogDescription>
                Upload new audit evidence to the secure repository
              </DialogDescription>
            </DialogHeader>
            <EvidenceUploadForm onSuccess={() => {
              setUploadDialogOpen(false);
              fetchEvidence();
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{evidence.length}</div>
            <div className="text-sm text-muted-foreground">Total Evidence</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {evidence.filter(e => e.status === 'APPROVED').length}
            </div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">
              {evidence.filter(e => e.status === 'PENDING_REVIEW').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">
              {evidence.filter(e => e.status === 'REJECTED').length}
            </div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {formatFileSize(evidence.reduce((sum, e) => sum + (e.fileSize || 0), 0))}
            </div>
            <div className="text-sm text-muted-foreground">Total Size</div>
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
                placeholder="Search evidence..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                {Object.entries(typeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={classificationFilter} onValueChange={setClassificationFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                {Object.entries(classificationLabels).map(([key, label]) => (
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

      {/* Evidence Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document ID</TableHead>
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Related Requirement</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Loading evidence...
                    </TableCell>
                  </TableRow>
                ) : evidence.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No evidence found. Upload your first evidence to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  evidence.map((item) => {
                    const TypeIcon = typeIcons[item.type] || File;
                    const StatusIcon = statusLabels[item.status]?.icon || Clock;
                    return (
                      <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-mono text-sm">{item.evidenceId}</TableCell>
                        <TableCell>
                          <Link href={`/evidence/${item.id}`}>
                            <div className="font-medium">{item.title}</div>
                            {item.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-[280px]">
                                {item.description}
                              </div>
                            )}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{classificationLabels[item.classification] || item.classification}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4 text-muted-foreground" />
                            {typeLabels[item.type] || item.type}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.requirement ? (
                            <Badge variant="outline">{item.requirement.requirementId}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">v{item.version}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {item.uploadedBy.firstName} {item.uploadedBy.lastName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {formatDate(item.uploadedAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`badge ${statusLabels[item.status]?.variant}`}>
                            {statusLabels[item.status]?.label}
                          </span>
                        </TableCell>
                        <TableCell>{formatFileSize(item.fileSize)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/evidence/${item.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              {item.filePath && (
                                <DropdownMenuItem onClick={() => window.open(item.filePath, '_blank')}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
    </div>
  );
}

function EvidenceUploadForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classification: 'EVIDENCE',
    type: 'PDF',
    tags: '',
    requirementId: '',
    auditId: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState<{ id: string; requirementId: string; title: string }[]>([]);

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      const response = await fetch('/api/requirements');
      if (response.ok) {
        setRequirements(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch requirements:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title && !file) return;
    setLoading(true);

    try {
      const data = new FormData();
      if (file) data.append('file', file);
      
      const titleToUse = formData.title || file?.name || '';
      data.append('title', titleToUse);
      data.append('description', formData.description);
      
      const ext = file?.name.split('.').pop()?.toUpperCase();
      const typeMap: Record<string, string> = { PDF: 'PDF', DOC: 'WORD', DOCX: 'WORD', XLS: 'EXCEL', XLSX: 'EXCEL', PNG: 'IMAGE', JPG: 'IMAGE', JPEG: 'IMAGE', GIF: 'IMAGE', MP4: 'VIDEO', MOV: 'VIDEO' };
      const detectedType = (ext && typeMap[ext]) || formData.type;
      data.append('type', detectedType);
      
      data.append('classification', formData.classification);
      data.append('tags', formData.tags);
      if (formData.requirementId) data.append('requirementId', formData.requirementId);
      if (formData.auditId) data.append('auditId', formData.auditId);

      const response = await fetch('/api/evidence', {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        onSuccess();
      } else {
        const resData = await response.json();
        alert(resData.error || 'Failed to upload');
      }
    } catch (error) {
      console.error('Failed to upload evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* File upload area */}
      <div
        className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors"
        onClick={() => document.getElementById('evidence-file-input')?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault();
          const droppedFile = e.dataTransfer.files[0];
          if (droppedFile) {
            setFile(droppedFile);
            if (!formData.title) setFormData(f => ({ ...f, title: droppedFile.name }));
          }
        }}
      >
        <input
          id="evidence-file-input"
          type="file"
          className="hidden"
          onChange={e => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) {
              setFile(selectedFile);
              if (!formData.title) setFormData(f => ({ ...f, title: selectedFile.name }));
            }
          }}
        />
        {file ? (
          <div className="space-y-1">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            <button type="button" className="text-xs text-destructive hover:underline" onClick={e => { e.stopPropagation(); setFile(null); }}>Remove</button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Click to upload or drag & drop</p>
            <p className="text-xs text-muted-foreground">Any file type supported</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="Evidence title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe this evidence..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Classification *</Label>
          <Select
            value={formData.classification}
            onValueChange={(value) => setFormData({ ...formData, classification: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(classificationLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Format (Optional override)</Label>
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
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          placeholder="Comma-separated tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Related Requirement</Label>
        <Select
          value={formData.requirementId}
          onValueChange={(value) => setFormData({ ...formData, requirementId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select requirement (optional)" />
          </SelectTrigger>
          <SelectContent>
            {requirements.map((req) => (
              <SelectItem key={req.id} value={req.id}>
                {req.requirementId} - {req.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Evidence'}
        </Button>
      </div>
    </form>
  );
}

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
