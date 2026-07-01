'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateAuditReport, generateFindingReport } from '@/lib/report-generator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Download,
  BarChart,
  AlertTriangle,
  FolderOpen,
  CheckSquare,
  Building,
  Calendar,
  FileDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: typeof FileText;
  formats: string[];
  category: string;
}

const reportTypes: ReportType[] = [
  {
    id: 'audit',
    name: 'Audit Report',
    description: 'Comprehensive audit execution report with findings and recommendations',
    icon: FileText,
    formats: ['PDF'],
    category: 'Audit',
  },
  {
    id: 'findings',
    name: 'Finding Report',
    description: 'Detailed list of all findings with severity, status, and corrective actions',
    icon: AlertTriangle,
    formats: ['PDF'],
    category: 'Findings',
  },
  {
    id: 'evidence',
    name: 'Evidence Report',
    description: 'Complete evidence inventory with compliance mapping',
    icon: FolderOpen,
    formats: ['PDF'],
    category: 'Evidence',
  },
  {
    id: 'compliance',
    name: 'Compliance Report',
    description: 'Compliance status by regulation and department',
    icon: BarChart,
    formats: ['PDF'],
    category: 'Compliance',
  },
  {
    id: 'department',
    name: 'Department Report',
    description: 'Audit and compliance status by department',
    icon: Building,
    formats: ['PDF'],
    category: 'Department',
  },
  {
    id: 'corrective-actions',
    name: 'Corrective Action Report',
    description: 'Status of all corrective actions and remediation progress',
    icon: CheckSquare,
    formats: ['PDF'],
    category: 'Corrective Actions',
  },
];

export default function ReportsPage() {
  const [selectedAudit, setSelectedAudit] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('');
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = async (reportType: ReportType, format: string) => {
    setGenerating(reportType.id);

    try {
      if (reportType.id === 'findings') {
        const res = await fetch('/api/findings');
        const data = await res.json();
        generateFindingReport(data, 'Current User'); // Ideally get user name from context
        toast.success(`${reportType.name} generated successfully`);
      } else if (reportType.id === 'audit') {
        // If an audit is selected, fetch that specific one, otherwise fetch the first one for demo purposes
        const auditsRes = await fetch('/api/audits');
        const audits = await auditsRes.json();
        const auditToReport = selectedAudit && selectedAudit !== 'all' 
          ? audits.find((a: any) => a.auditNumber === selectedAudit) 
          : audits[0];

        if (!auditToReport) {
          toast.error('No audits found to generate a report.');
          setGenerating(null);
          return;
        }

        const findingsRes = await fetch(`/api/findings?auditId=${auditToReport.id}`);
        const findings = await findingsRes.json();

        generateAuditReport(auditToReport, findings, 'Current User');
        toast.success(`${reportType.name} generated successfully`);
      } else {
        // Fallback for reports not yet implemented
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.info(`${reportType.name} generation is coming soon!`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate professional audit and compliance reports
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Report Filters</CardTitle>
          <CardDescription>Apply filters to customize your reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Audit</label>
              <Select value={selectedAudit} onValueChange={setSelectedAudit}>
                <SelectTrigger>
                  <SelectValue placeholder="All Audits" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Audits</SelectItem>
                  <SelectItem value="AUD-2024-15">AUD-2024-15</SelectItem>
                  <SelectItem value="AUD-2024-14">AUD-2024-14</SelectItem>
                  <SelectItem value="AUD-2024-13">AUD-2024-13</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last7">Last 7 Days</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="last90">Last 90 Days</SelectItem>
                  <SelectItem value="thisyear">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <report.icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">{report.category}</Badge>
                  </div>
                </div>
              </div>
              <CardDescription className="mt-3">{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {report.formats.map((format) => (
                  <Button
                    key={format}
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerate(report, format)}
                    disabled={generating === report.id}
                  >
                    {generating === report.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </div>
                    ) : (
                      <>
                        <FileDown className="mr-2 h-4 w-4" />
                        {format}
                      </>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
