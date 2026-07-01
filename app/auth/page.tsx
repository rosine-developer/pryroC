'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, register } = useAuth();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'AUDITOR',
    department: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.email || !registerForm.password || !registerForm.firstName || !registerForm.lastName) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (registerForm.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: registerForm.email,
        password: registerForm.password,
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        role: registerForm.role,
        department: registerForm.department,
      });
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-8">
      <div
        className="w-full max-w-4xl flex overflow-hidden shadow-xl"
        style={{ borderRadius: '30px', minHeight: '580px' }}
      >
        {/* Left — Black branding panel */}
        <div className="hidden md:flex md:w-5/12 bg-black flex-col justify-between p-10 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-white" strokeWidth={2} />
            <span className="text-sm font-semibold tracking-tight">PryroGRC</span>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold leading-snug">
              AI-Powered Audit &amp; Compliance Management
            </h2>
            <p className="text-sm text-white/50 leading-relaxed">
              Built for internal auditors, compliance officers, and risk teams.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              {[
                { title: 'Unified', sub: 'Regulatory Matrix' },
                { title: 'Automated', sub: 'Evidence Locker' },
                { title: 'AI-Powered', sub: 'Audit Assistant' },
                { title: 'Complete', sub: 'Audit Trail' },
              ].map((f) => (
                <div key={f.title}>
                  <div className="text-sm font-semibold">{f.title}</div>
                  <div className="text-xs text-white/35 mt-0.5">{f.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/25">Enterprise-grade security &amp; compliance</p>
        </div>

        {/* Right — White form panel */}
        <div className="flex-1 bg-white flex items-center justify-center p-10">
          <div className="w-full max-w-sm">
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'login' | 'register')}>
              <TabsList className="grid w-full grid-cols-2 mb-8" style={{ borderRadius: '12px' }}>
                <TabsTrigger value="login" style={{ borderRadius: '10px' }}>Sign In</TabsTrigger>
                <TabsTrigger value="register" style={{ borderRadius: '10px' }}>Create Account</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <div className="mb-6">
                  <h1 className="text-xl font-bold tracking-tight">Welcome back</h1>
                  <p className="text-sm text-black/40 mt-1">Enter your credentials to continue</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium text-black/50">Email</Label>
                    <Input id="email" type="email" placeholder="name@company.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} disabled={loading} className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-medium text-black/50">Password</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} disabled={loading} className="rounded-xl" />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4 text-black/30" /> : <Eye className="h-4 w-4 text-black/30" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-black text-white hover:bg-black/80 rounded-xl mt-2" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <div className="mb-6">
                  <h1 className="text-xl font-bold tracking-tight">Create account</h1>
                  <p className="text-sm text-black/40 mt-1">Get started with PryroGRC today</p>
                </div>
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-xs font-medium text-black/50">First Name</Label>
                      <Input id="firstName" placeholder="John" value={registerForm.firstName} onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })} disabled={loading} className="rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-xs font-medium text-black/50">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" value={registerForm.lastName} onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })} disabled={loading} className="rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email" className="text-xs font-medium text-black/50">Email</Label>
                    <Input id="reg-email" type="email" placeholder="name@company.com" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} disabled={loading} className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-black/50">Role</Label>
                    <Select value={registerForm.role} onValueChange={(value) => setRegisterForm({ ...registerForm, role: value })}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select role" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMINISTRATOR">Administrator</SelectItem>
                        <SelectItem value="LEAD_AUDITOR">Lead Auditor</SelectItem>
                        <SelectItem value="AUDITOR">Auditor</SelectItem>
                        <SelectItem value="COMPLIANCE_OFFICER">Compliance Officer</SelectItem>
                        <SelectItem value="DEPARTMENT_OWNER">Department Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="department" className="text-xs font-medium text-black/50">Department</Label>
                    <Input id="department" placeholder="e.g. Security, Finance" value={registerForm.department} onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })} disabled={loading} className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-password" className="text-xs font-medium text-black/50">Password</Label>
                    <div className="relative">
                      <Input id="reg-password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} disabled={loading} className="rounded-xl" />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4 text-black/30" /> : <Eye className="h-4 w-4 text-black/30" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-medium text-black/50">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" placeholder="Confirm your password" value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} disabled={loading} className="rounded-xl" />
                  </div>
                  <Button type="submit" className="w-full bg-black text-white hover:bg-black/80 rounded-xl mt-1" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="text-center text-xs text-black/25 mt-6">
              By continuing, you agree to our Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
