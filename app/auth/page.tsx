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
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 text-primary-foreground">
        <div>
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10" />
            <span className="text-2xl font-bold">PryroGRC</span>
          </div>
        </div>

        <div className="space-y-8">
          <h1 className="text-4xl font-bold leading-tight">
            AI-Powered Audit & Compliance Management
          </h1>
          <p className="text-lg text-primary-foreground/80 leading-relaxed">
            Streamline your complete audit process from planning to reporting.
            Built for internal auditors, external auditors, compliance officers,
            and regulatory inspectors.
          </p>

          <div className="grid grid-cols-2 gap-6 pt-8">
            <div className="space-y-2">
              <div className="text-3xl font-bold">Unified</div>
              <div className="text-sm text-primary-foreground/70">Regulatory Matrix</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">Automated</div>
              <div className="text-sm text-primary-foreground/70">Evidence Locker</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">AI-Powered</div>
              <div className="text-sm text-primary-foreground/70">Audit Assistant</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">Complete</div>
              <div className="text-sm text-primary-foreground/70">Audit Trail</div>
            </div>
          </div>
        </div>

        <div className="text-sm text-primary-foreground/60">
          Enterprise-grade security & compliance
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <Shield className="w-8 h-8" />
            <span className="text-xl font-bold">PryroGRC</span>
          </div>

          <Tabs value={mode} onValueChange={(v) => setMode(v as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-0 shadow-none">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          disabled={loading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-0 shadow-none">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl font-bold">Create account</CardTitle>
                  <CardDescription>
                    Get started with your audit management platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={registerForm.firstName}
                          onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={registerForm.lastName}
                          onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="name@company.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={registerForm.role}
                        onValueChange={(value) => setRegisterForm({ ...registerForm, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMINISTRATOR">Administrator</SelectItem>
                          <SelectItem value="LEAD_AUDITOR">Lead Auditor</SelectItem>
                          <SelectItem value="AUDITOR">Auditor</SelectItem>
                          <SelectItem value="COMPLIANCE_OFFICER">Compliance Officer</SelectItem>
                          <SelectItem value="DEPARTMENT_OWNER">Department Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        placeholder="e.g., Security, Finance, Operations"
                        value={registerForm.department}
                        onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min. 8 characters"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          disabled={loading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-muted-foreground mt-8">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
