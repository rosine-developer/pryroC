'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import {
  Shield,
  BarChart3,
  FileText,
  AlertTriangle,
  CheckSquare,
  FolderOpen,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  Star,
  Zap,
  Lock,
  Globe,
  TrendingUp,
  ClipboardCheck,
  Users,
  Award,
} from 'lucide-react';

const features = [
  {
    icon: ClipboardCheck,
    title: 'Audit Management',
    description: 'Plan, execute, and close audits with full lifecycle tracking from scheduling to final report.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: AlertTriangle,
    title: 'Findings & Risks',
    description: 'Track findings by severity, assign owners, set due dates, and monitor resolution progress.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: FolderOpen,
    title: 'Document Center',
    description: 'Classify and store all your audit documents, evidence, and policies in one secure repository.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: FileText,
    title: 'Regulatory Matrix',
    description: 'Map requirements across GDPR, ISO 27001, SOC 2, and more with unified compliance tracking.',
    color: 'from-purple-500 to-violet-500',
  },
  {
    icon: CheckSquare,
    title: 'Corrective Actions',
    description: 'Create, assign, and track corrective actions to closure with automated reminders.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: MessageSquare,
    title: 'AI Assistant',
    description: 'Ask your AI audit expert questions, get policy summaries, and accelerate compliance decisions.',
    color: 'from-yellow-500 to-orange-500',
  },
];

const stats = [
  { value: '60%', label: 'Faster Audits', icon: TrendingUp },
  { value: '100%', label: 'Audit Trail', icon: Shield },
  { value: '10+', label: 'Regulations Supported', icon: Globe },
  { value: '5★', label: 'Audit Quality', icon: Star },
];

const testimonials = [
  {
    quote: 'PryroGRC transformed how our team handles audits. We cut our audit cycle in half.',
    author: 'Sarah K.',
    role: 'Chief Compliance Officer',
    company: 'FinSecure Corp',
    initials: 'SK',
  },
  {
    quote: 'The AI assistant alone is worth it. Instant answers to complex regulatory questions.',
    author: 'James O.',
    role: 'Lead Auditor',
    company: 'GlobalTech Ltd',
    initials: 'JO',
  },
  {
    quote: 'Finally, a GRC platform that actually makes sense. Clean, fast, and powerful.',
    author: 'Amara N.',
    role: 'IT Compliance Manager',
    company: 'DataBridge Inc',
    initials: 'AN',
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return null;
  if (user) return null;

  return (
    <div className="min-h-screen bg-[#020817] text-white overflow-x-hidden">
      {/* Noise / gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#020817]/90 backdrop-blur-xl border-b border-white/5 shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">PryroGRC</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#stats" className="hover:text-white transition-colors">Why Us</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/auth"
              className="text-sm font-medium bg-white text-[#020817] hover:bg-white/90 transition-colors px-4 py-2 rounded-lg"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-28 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white/70 mb-8">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            Now with AI-powered audit assistant
            <ChevronRight className="w-3.5 h-3.5" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
            Audit smarter.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Comply faster.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
            PryroGRC is the all-in-one AI-powered platform for internal auditors, compliance officers,
            and risk teams — from planning to reporting.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105"
            >
              Start Free Today
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth"
              className="flex items-center gap-2 border border-white/15 hover:border-white/30 text-white/70 hover:text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-200"
            >
              Sign in to your account
            </Link>
          </div>

          {/* Hero visual */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              {/* Fake dashboard preview */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Active Audits', value: '12', color: 'text-blue-400' },
                  { label: 'Open Findings', value: '47', color: 'text-orange-400' },
                  { label: 'Corrective Actions', value: '23', color: 'text-yellow-400' },
                  { label: 'Compliance Score', value: '94%', color: 'text-emerald-400' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/5 rounded-xl p-4 text-left border border-white/5">
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-white/40 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-white/40 mb-3">Recent Audits</div>
                  {['IT Security Audit Q2', 'GDPR Compliance Review', 'Financial Controls Check'].map((name, i) => (
                    <div key={name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-sm text-white/70">{name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        i === 0 ? 'bg-blue-500/20 text-blue-400' :
                        i === 1 ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {i === 0 ? 'In Progress' : i === 1 ? 'Completed' : 'Planning'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-white/40 mb-3">Risk Distribution</div>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Critical', pct: 15, color: 'bg-red-500' },
                      { label: 'High', pct: 35, color: 'bg-orange-500' },
                      { label: 'Medium', pct: 35, color: 'bg-yellow-500' },
                      { label: 'Low', pct: 15, color: 'bg-emerald-500' },
                    ].map((r) => (
                      <div key={r.label} className="flex items-center gap-2 text-xs">
                        <span className="text-white/50 w-12">{r.label}</span>
                        <div className="flex-1 bg-white/10 rounded-full h-1.5">
                          <div className={`${r.color} h-1.5 rounded-full`} style={{ width: `${r.pct}%` }} />
                        </div>
                        <span className="text-white/50 w-7">{r.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label} className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {s.value}
              </div>
              <div className="text-sm text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white/60 mb-5">
              <Award className="w-3.5 h-3.5 text-blue-400" />
              Everything you need
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for serious{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                compliance teams
              </span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Every feature is purpose-built for GRC workflows, from small teams to enterprise audit departments.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 hover:border-white/15 rounded-2xl p-6 transition-all duration-300 cursor-default"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by audit teams</h2>
            <p className="text-white/40">See what compliance professionals say about PryroGRC.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.author}
                className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 flex flex-col gap-4"
              >
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.author}</div>
                    <div className="text-xs text-white/40">{t.role} · {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-16">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-3xl" />
            <div className="relative z-10">
              <Users className="w-10 h-10 text-blue-400 mx-auto mb-5" />
              <h2 className="text-4xl md:text-5xl font-bold mb-5">
                Ready to modernize<br />your audit process?
              </h2>
              <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
                Join compliance teams using PryroGRC to reduce audit time, improve accuracy, and stay ahead of regulations.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth"
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-xl shadow-blue-500/25 hover:scale-105"
                >
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/auth"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  Already have an account? Sign in →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold">PryroGRC</span>
          </div>
          <p className="text-xs text-white/30">© 2025 PryroGRC. Enterprise-grade security & compliance.</p>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
