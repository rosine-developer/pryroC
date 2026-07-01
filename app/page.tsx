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
      <section className="max-w-5xl mx-auto px-6 pt-40 pb-28">
        <p className="text-xs font-medium tracking-widest text-black/30 uppercase mb-6">
          Audit & Compliance Platform
        </p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-6 max-w-2xl">
          Audit smarter.<br />Ship compliance.
        </h1>
        <p className="text-lg text-black/40 leading-relaxed max-w-lg mb-10">
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

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6">
        <hr className="border-black/8" />
      </div>

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

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6">
        <hr className="border-black/8" />
      </div>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-24">
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

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6">
        <hr className="border-black/8" />
      </div>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-6 py-24">
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

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6">
        <hr className="border-black/8" />
      </div>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold tracking-tight mb-3">Ready to get started?</h2>
        <p className="text-black/40 text-sm mb-8">
          Create your account and run your first audit today. No credit card required.
        </p>
        <Link
          href="/auth"
          className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-black/80 transition-colors"
        >
          Create free account
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <div className="max-w-5xl mx-auto px-6">
        <hr className="border-black/8" />
      </div>
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
