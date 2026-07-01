'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { ArrowRight, Shield } from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) return null;

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }} className="min-h-screen bg-white text-black">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/8">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" strokeWidth={2} />
            <span className="text-sm font-semibold tracking-tight">PryroGRC</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-black/60">
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-black transition-colors">Testimonials</a>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/auth" className="text-sm text-black/40 hover:text-black transition-colors">
              Sign in
            </Link>
            <Link
              href="/auth"
              className="text-sm font-medium bg-black text-white px-4 py-1.5 rounded-md hover:bg-black/80 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-40 pb-28 flex flex-col items-center text-center">
        <p className="text-xs font-medium tracking-widest text-black/30 uppercase mb-6">
          Audit & Compliance Platform
        </p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-6 max-w-2xl mx-auto">
          Audit smarter.<br />Ship compliance.
        </h1>
        <p className="text-lg text-black/40 leading-relaxed max-w-lg mx-auto mb-10">
          The complete GRC platform for audit teams. Plan, execute, and report — all in one place.
        </p>
        <Link
          href="/auth"
          className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-black/80 transition-colors"
        >
          Start for free
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>



      {/* Stats row */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-3 gap-0 divide-x divide-black/8">
        {[
          { value: '60%', label: 'Faster audit cycles' },
          { value: '10+', label: 'Regulations mapped' },
          { value: '100%', label: 'Complete audit trail' },
        ].map((s) => (
          <div key={s.label} className="px-10 first:pl-0 last:pr-0">
            <div className="text-3xl font-bold tabular-nums">{s.value}</div>
            <div className="text-sm text-black/35 mt-1">{s.label}</div>
          </div>
        ))}
      </section>



      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-24 scroll-mt-14">
        <p className="text-xs font-medium tracking-widest text-black/30 uppercase mb-12">What's inside</p>
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
          {[
            { title: 'Audit Management', desc: 'Full lifecycle from planning to closure. Assign auditors, track progress, generate reports.' },
            { title: 'Findings & Risk Tracking', desc: 'Log findings by severity. Set owners, due dates, and close the loop on every issue.' },
            { title: 'Document Center', desc: 'One repository for all evidence, policies, and certificates — classified and searchable.' },
            { title: 'Regulatory Matrix', desc: 'Map requirements across GDPR, ISO 27001, SOC 2, and your own internal policies.' },
            { title: 'Corrective Actions', desc: 'Create remediation tasks, track progress to completion, never lose a follow-up.' },
            { title: 'AI Audit Assistant', desc: 'Ask questions, get policy summaries, and make faster compliance decisions with AI.' },
          ].map((f, i) => (
            <div key={f.title} className="flex gap-5">
              <div className="text-sm text-black/20 tabular-nums pt-0.5 w-5 shrink-0">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-black/40 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* Testimonials */}
      <section id="testimonials" className="max-w-5xl mx-auto px-6 py-24 scroll-mt-14">
        <p className="text-xs font-medium tracking-widest text-black/30 uppercase mb-12">From our users</p>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { quote: 'We cut our audit cycle in half. PryroGRC made the whole process invisible.', name: 'Sarah K.', role: 'CCO, FinSecure Corp' },
            { quote: 'The AI assistant gives instant answers to complex regulatory questions.', name: 'James O.', role: 'Lead Auditor, GlobalTech' },
            { quote: 'Finally a GRC tool that gets out of your way and just works.', name: 'Amara N.', role: 'IT Compliance, DataBridge' },
          ].map((t) => (
            <div key={t.name}>
              <p className="text-sm text-black/60 leading-relaxed mb-5">"{t.quote}"</p>
              <div className="text-xs font-medium">{t.name}</div>
              <div className="text-xs text-black/35 mt-0.5">{t.role}</div>
            </div>
          ))}
        </div>
      </section>



      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Ready to get started?</h2>
          <p className="text-black/40 text-sm mb-8 max-w-sm">
            Create your account and run your first audit today. No credit card required.
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-black/80 transition-colors"
          >
            Create free account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Dashboard Mockup */}
        <div className="w-full md:w-[450px] bg-white border border-black/8 shadow-2xl rounded-2xl overflow-hidden flex flex-col shrink-0 relative" style={{ height: '320px' }}>
          {/* Header */}
          <div className="h-12 border-b border-black/5 flex items-center px-4 justify-between bg-white z-10">
             <div className="flex gap-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-black/10" />
               <div className="w-2.5 h-2.5 rounded-full bg-black/10" />
               <div className="w-2.5 h-2.5 rounded-full bg-black/10" />
             </div>
             <div className="text-[10px] font-semibold text-black/40 uppercase tracking-widest">PryroGRC</div>
             <div className="w-6 h-6 rounded-full bg-black/5" />
          </div>
          
          {/* Body */}
          <div className="flex flex-1 p-4 gap-4 bg-[#fafafa]">
             {/* Sidebar */}
             <div className="w-24 space-y-2 pt-1">
                <div className="text-[9px] font-semibold text-black bg-black/5 px-2 py-1 rounded">Dashboard</div>
                <div className="text-[9px] font-medium text-black/40 px-2">Frameworks</div>
                <div className="text-[9px] font-medium text-black/40 px-2">Controls</div>
                <div className="text-[9px] font-medium text-black/40 px-2 mt-4 pt-2 border-t border-black/5">Evidence</div>
                <div className="text-[9px] font-medium text-black/40 px-2">Policies</div>
             </div>
             
             {/* Content */}
             <div className="flex-1 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-white p-3 rounded-xl border border-black/5 shadow-sm">
                     <div className="text-[8px] font-medium text-black/40 uppercase mb-1">Compliance Score</div>
                     <div className="text-xl font-bold tracking-tight text-green-600">92%</div>
                   </div>
                   <div className="bg-white p-3 rounded-xl border border-black/5 shadow-sm">
                     <div className="text-[8px] font-medium text-black/40 uppercase mb-1">Failing Controls</div>
                     <div className="text-xl font-bold tracking-tight text-red-500">3</div>
                   </div>
                </div>
                
                {/* Chart/Table */}
                <div className="bg-white p-4 rounded-xl border border-black/5 shadow-sm flex flex-col h-32">
                   <div className="text-[9px] font-semibold text-black mb-3 border-b border-black/5 pb-2">Framework Status</div>
                   <div className="space-y-3">
                     <div className="space-y-1">
                       <div className="flex justify-between items-center">
                         <span className="text-[8px] font-medium">SOC 2 Type II</span>
                         <span className="text-[8px] text-black/60">95%</span>
                       </div>
                       <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                         <div className="h-full bg-green-500 rounded-full w-[95%]" />
                       </div>
                     </div>
                     <div className="space-y-1">
                       <div className="flex justify-between items-center">
                         <span className="text-[8px] font-medium">ISO 27001</span>
                         <span className="text-[8px] text-black/60">88%</span>
                       </div>
                       <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                         <div className="h-full bg-amber-500 rounded-full w-[88%]" />
                       </div>
                     </div>
                     <div className="space-y-1">
                       <div className="flex justify-between items-center">
                         <span className="text-[8px] font-medium">GDPR</span>
                         <span className="text-[8px] text-black/60">100%</span>
                       </div>
                       <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                         <div className="h-full bg-black rounded-full w-full" />
                       </div>
                     </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Fade out bottom overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </div>
      </section>


      <footer className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5" strokeWidth={2} />
          <span className="text-xs font-semibold">PryroGRC</span>
        </div>
        <p className="text-xs text-black/25">© 2025 PryroGRC</p>
        <div className="flex items-center gap-5 text-xs text-black/25">
          <a href="#" className="hover:text-black/60 transition-colors">Privacy</a>
          <a href="#" className="hover:text-black/60 transition-colors">Terms</a>
        </div>
      </footer>
    </div>
  );
}
