'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  ClipboardCheck,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  FolderOpen,
  Calendar,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface DashboardStats {
  openAudits: number;
  completedAudits: number;
  upcomingAudits: number;
  overdueAudits: number;
  pendingReviews: number;
  openFindings: number;
  criticalFindings: number;
  evidenceMissing: number;
  correctiveActionsDue: number;
  compliancePercentage: number;
  recentActivities: Activity[];
  findingsBySeverity: { name: string; value: number }[];
  complianceByDepartment: { name: string; compliant: number; nonCompliant: number }[];
  evidenceCompletion: { name: string; value: number }[];
  auditProgress: { name: string; progress: number }[];
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description?: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Set mock data for demo
        setStats(getMockData());
      }
    } catch {
      setStats(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = (): DashboardStats => ({
    openAudits: 5,
    completedAudits: 23,
    upcomingAudits: 3,
    overdueAudits: 2,
    pendingReviews: 8,
    openFindings: 14,
    criticalFindings: 3,
    evidenceMissing: 7,
    correctiveActionsDue: 12,
    compliancePercentage: 78,
    recentActivities: [
      { id: '1', type: 'audit', title: 'Audit #AUD-2024-15 completed', createdAt: new Date().toISOString(), user: { firstName: 'John', lastName: 'Smith' } },
      { id: '2', type: 'finding', title: 'New finding recorded in Audit #AUD-2024-14', createdAt: new Date(Date.now() - 3600000).toISOString(), user: { firstName: 'Sarah', lastName: 'Johnson' } },
      { id: '3', type: 'evidence', title: 'Security Policy.pdf uploaded', createdAt: new Date(Date.now() - 7200000).toISOString(), user: { firstName: 'David', lastName: 'Williams' } },
      { id: '4', type: 'corrective_action', title: 'Corrective action #CA-2024-45 completed', createdAt: new Date(Date.now() - 14400000).toISOString(), user: { firstName: 'Emily', lastName: 'Brown' } },
      { id: '5', type: 'audit', title: 'Audit #AUD-2024-16 started', createdAt: new Date(Date.now() - 21600000).toISOString(), user: { firstName: 'Michael', lastName: 'Davis' } },
    ],
    findingsBySeverity: [
      { name: 'Critical', value: 3 },
      { name: 'High', value: 5 },
      { name: 'Medium', value: 8 },
      { name: 'Low', value: 12 },
      { name: 'Observation', value: 15 },
    ],
    complianceByDepartment: [
      { name: 'Security', compliant: 85, nonCompliant: 15 },
      { name: 'Finance', compliant: 92, nonCompliant: 8 },
      { name: 'Operations', compliant: 78, nonCompliant: 22 },
      { name: 'HR', compliant: 88, nonCompliant: 12 },
      { name: 'IT', compliant: 72, nonCompliant: 28 },
    ],
    evidenceCompletion: [
      { name: 'Jan', value: 65 },
      { name: 'Feb', value: 72 },
      { name: 'Mar', value: 78 },
      { name: 'Apr', value: 82 },
      { name: 'May', value: 85 },
      { name: 'Jun', value: 88 },
    ],
    auditProgress: [
      { name: 'AUD-14', progress: 100 },
      { name: 'AUD-15', progress: 85 },
      { name: 'AUD-16', progress: 60 },
      { name: 'AUD-17', progress: 35 },
      { name: 'AUD-18', progress: 15 },
    ],
  });

  const COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#6b7280'];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user?.firstName}. Here's your audit overview.
          </p>
        </div>
        <Link href="/audits/new">
          <Button size="sm">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Start New Audit
          </Button>
        </Link>
      </div>

      {/* Quick Stats Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="card-stat">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats?.openAudits}</div>
                <div className="text-xs text-muted-foreground">Open Audits</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <ClipboardCheck className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-stat">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats?.completedAudits}</div>
                <div className="text-xs text-muted-foreground">Completed Audits</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-success/10 flex items-center justify-center">
                <FileCheck className="h-4 w-4 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-stat">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-destructive">{stats?.criticalFindings}</div>
                <div className="text-xs text-muted-foreground">Critical Findings</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-stat">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats?.openFindings}</div>
                <div className="text-xs text-muted-foreground">Open Findings</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-stat">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats?.compliancePercentage}%</div>
                <div className="text-xs text-muted-foreground">Compliance Rate</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-warning" />
              <div>
                <div className="text-base font-semibold">{stats?.upcomingAudits}</div>
                <div className="text-xs text-muted-foreground">Upcoming Audits</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-destructive" />
              <div>
                <div className="text-base font-semibold">{stats?.overdueAudits}</div>
                <div className="text-xs text-muted-foreground">Overdue Audits</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary" />
              <div>
                <div className="text-base font-semibold">{stats?.pendingReviews}</div>
                <div className="text-xs text-muted-foreground">Pending Reviews</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-warning" />
              <div>
                <div className="text-base font-semibold">{stats?.evidenceMissing}</div>
                <div className="text-xs text-muted-foreground">Evidence Missing</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-base font-semibold">{stats?.correctiveActionsDue}</div>
                <div className="text-xs text-muted-foreground">Actions Due</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Findings by Severity */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">Findings by Severity</CardTitle>
            <CardDescription className="text-xs">Distribution of audit findings across severity levels</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.findingsBySeverity} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" width={75} className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {stats?.findingsBySeverity?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Compliance by Department */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">Compliance by Department</CardTitle>
            <CardDescription className="text-xs">Compliance status across departments</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.complianceByDepartment}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="compliant" stackId="a" fill="#16a34a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="nonCompliant" stackId="a" fill="#dc2626" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Evidence Completion Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">Evidence Completion Trend</CardTitle>
            <CardDescription className="text-xs">Monthly evidence completion rate</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.evidenceCompletion}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3 max-h-48 overflow-y-auto scrollbar-thin">
            {stats?.recentActivities?.map((activity) => (
              <div key={activity.id} className="flex items-start gap-2 pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Activity className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.user.firstName} {activity.user.lastName} • {formatDate(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Audit Progress */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold">Active Audit Progress</CardTitle>
          <CardDescription className="text-xs">Current status of ongoing audits</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-3">
            {stats?.auditProgress?.map((audit) => (
              <div key={audit.name} className="flex items-center gap-3">
                <div className="w-16 text-xs font-medium">{audit.name}</div>
                <Progress value={audit.progress} className="flex-1 h-2" />
                <div className="w-10 text-xs text-muted-foreground text-right">{audit.progress}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Link href="/audits/new">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ClipboardCheck className="mr-2 h-3 w-3" />
                Create Audit
                <ArrowRight className="ml-auto h-3 w-3" />
              </Button>
            </Link>
            <Link href="/evidence/upload">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FolderOpen className="mr-2 h-3 w-3" />
                Upload Evidence
                <ArrowRight className="ml-auto h-3 w-3" />
              </Button>
            </Link>
            <Link href="/findings">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <AlertTriangle className="mr-2 h-3 w-3" />
                View Findings
                <ArrowRight className="ml-auto h-3 w-3" />
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <TrendingUp className="mr-2 h-3 w-3" />
                Generate Report
                <ArrowRight className="ml-auto h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
