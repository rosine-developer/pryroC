'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import {
  Shield,
  LayoutDashboard,
  FileText,
  FolderOpen,
  ClipboardCheck,
  AlertTriangle,
  CheckSquare,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Regulations', href: '/regulations', icon: FileText },
  { name: 'Evidence Locker', href: '/evidence', icon: FolderOpen },
  { name: 'Audits', href: '/audits', icon: ClipboardCheck },
  { name: 'Findings', href: '/findings', icon: AlertTriangle },
  { name: 'Corrective Actions', href: '/corrective-actions', icon: CheckSquare },
  { name: 'AI Assistant', href: '/assistant', icon: MessageSquare },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

const settingsNav = [
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName[0]}${user.lastName[0]}`;
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'ADMINISTRATOR':
        return 'bg-primary text-primary-foreground';
      case 'LEAD_AUDITOR':
        return 'bg-secondary text-secondary-foreground';
      case 'AUDITOR':
        return 'bg-muted text-muted-foreground';
      case 'COMPLIANCE_OFFICER':
        return 'bg-secondary text-secondary-foreground';
      case 'DEPARTMENT_OWNER':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0 fixed inset-y-0 left-0 z-40">
        <div className="flex w-64 flex-col border-r border-border bg-card">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
            <Shield className="h-8 w-8" />
            <span className="text-xl font-bold">PryroGRC</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'sidebar-item',
                    isActive && 'active'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-border">
              {settingsNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'sidebar-item',
                      isActive && 'active'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Profile */}
          <div className="border-t border-border p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={cn('text-xs', getRoleBadgeColor())}>
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user?.role?.replace('_', ' ')}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <span className="text-lg font-bold">PryroGRC</span>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Avatar className="h-8 w-8">
                <AvatarFallback className={cn('text-xs', getRoleBadgeColor())}>
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Navigation</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {navigation.map((item) => (
              <DropdownMenuItem key={item.name} asChild>
                <Link href={item.href} className="cursor-pointer">
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
