'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    formats: ['PDF', 'Word', 'Excel'],
    category: 'Audit',
  },
  {
    id: 'findings',
    name: 'Finding Report',
    description: 'Detailed list of all findings with severity, status, and corrective actions',
    icon: AlertTriangle,
    formats: ['PDF', 'Excel'],
    category: 'Findings',
  },
  {
    id: 'evidence',
    name: 'Evidence Report',
    description: 'Complete evidence inventory with compliance mapping',
    icon: FolderOpen,
    formats: ['PDF', 'Excel'],
    category: 'Evidence',
  },
  {
    id: 'compliance',
    name: 'Compliance Report',
    description: 'Compliance status by regulation and department',
    icon: BarChart,
    formats: ['PDF', 'Word', 'Excel'],
    category: 'Compliance',
  },
  {
    id: 'department',
    name: 'Department Report',
    description: 'Audit and compliance status by department',
    icon: Building,
    formats: ['PDF', 'Excel'],
    category: 'Department',
  },
  {
    id: 'corrective-actions',
    name: 'Corrective Action Report',
    description: 'Status of all corrective actions and remediation progress',
    icon: CheckSquare,
    formats: ['PDF', 'Excel'],
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

    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    setGenerating(null);
    toast.success(`${reportType.name} generated successfully in ${format} format`, {
      description: 'Report is ready for download',
    });
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

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Download previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Q2 2024 Audit Report.pdf', type: 'Audit Report', date: '2024-06-28', size: '2.4 MB' },
              { name: 'Security Compliance Status.xlsx', type: 'Compliance Report', date: '2024-06-27', size: '1.1 MB' },
              { name: 'Finding Summary - June 2024.pdf', type: 'Finding Report', date: '2024-06-25', size: '856 KB' },
              { name: 'IT Department Audit.docx', type: 'Department Report', date: '2024-06-20', size: '1.8 MB' },
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-card flex items-center justify-center">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{report.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {report.type} • {report.date} • {report.size}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
