'use client';

import { TrendingUp, Cpu, ShieldCheck, Users, ArrowRight } from 'lucide-react';

const highlights = [
  {
    icon: TrendingUp,
    title: 'Real-time Signals',
    description: 'Institutional-grade alerts that react to market structure in under 200ms.',
    badge: '0.2s latency',
  },
  {
    icon: Cpu,
    title: 'Automated Workflows',
    description: 'Pre-built strategies with configurable risk templates and automated exits.',
    badge: 'Plug & play',
  },
  {
    icon: ShieldCheck,
    title: 'Security & Compliance',
    description: 'Multi-layer protection, encrypted data, and transparent governance out of the box.',
    badge: 'SOC2 roadmap',
  },
  {
    icon: Users,
    title: 'Human Guidance',
    description: 'Senior strategists and an active community ready to validate every play.',
    badge: 'Desk access',
  },
];

export function FeatureHighlights() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {highlights.map((feature) => (
        <article
          key={feature.title}
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-white/30"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#0577DA]/20 via-transparent to-transparent" />
          </div>
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0577DA]/10 text-[#57c8ff]">
            <feature.icon className="h-6 w-6" />
          </div>
          <div className="relative mt-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              {feature.badge}
            </span>
            <h3 className="mt-4 text-xl font-semibold text-white">{feature.title}</h3>
            <p className="mt-3 text-sm text-white/70">{feature.description}</p>
          </div>
          <div className="relative mt-6 flex items-center justify-between text-sm text-white/50">
            <span>Learn more</span>
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:text-white" />
          </div>
        </article>
      ))}
    </div>
  );
}
