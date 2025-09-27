'use client';

import { useState } from 'react';
import { TrendingUp, Cpu, ShieldCheck, Users, ArrowRight } from 'lucide-react';
import { FeatureModal } from '@/components/FeatureModal';
import { DialogTrigger } from '@/components/ui/dialog';

const highlights = [
  {
    icon: TrendingUp,
    iconColor: '#33E1DA',
    title: 'Real-time Signals',
    description: 'Institutional-grade alerts that react to market structure in under 200ms.',
    badge: '0.2s latency',
    modalContent: {
      subtitle: 'Institutional-grade alerts with sub-200ms reaction times',
      description: 'Experience the power of professional trading signals that react to market movements faster than the competition. Our advanced infrastructure ensures you never miss an opportunity.',
      highlights: [
        'Low-latency pipeline with sub-200ms response times',
        'Complete exchange coverage across major crypto markets',
        'Advanced anomaly detection using machine learning',
        'Real-time webhooks and WebSocket connections',
        'Smart filtering to reduce noise and false positives',
      ],
      primaryAction: { label: 'Explore Signals', href: '/dashboard/signals' },
      secondaryAction: { label: 'Close' },
    },
    testId: 'rt-signals',
  },
  {
    icon: Cpu,
    iconColor: '#1A7FB3',
    title: 'Automated Workflows',
    description: 'Pre-built strategies with configurable risk templates and automated exits.',
    badge: 'Plug & play',
    modalContent: {
      subtitle: 'Pre-built strategies with configurable risk templates',
      description: 'Automate your trading strategies with our sophisticated workflow engine. Build, test, and deploy trading bots without writing a single line of code.',
      highlights: [
        'Visual drag-and-drop strategy builder',
        'Pre-configured exit strategies and stop-loss templates',
        'Version control for all your trading strategies',
        'Complete audit log of all automated actions',
        'Backtesting with historical market data',
        'Risk management controls and position sizing',
      ],
      primaryAction: { label: 'Build a Workflow', href: '/dashboard/workflows' },
      secondaryAction: { label: 'Close' },
    },
    testId: 'automated-workflows',
  },
  {
    icon: ShieldCheck,
    iconColor: '#9945FF',
    title: 'Security & Compliance',
    description: 'Multi-layer protection, encrypted data, and transparent governance out of the box.',
    badge: 'SOC2 roadmap',
    modalContent: {
      subtitle: 'Multi-layer protection and transparent governance',
      description: 'Your security is our top priority. We implement industry-leading security practices to protect your data and ensure regulatory compliance.',
      highlights: [
        'SOC 2 Type II compliance roadmap in progress',
        'End-to-end encryption for all sensitive data',
        'Role-based access control with granular permissions',
        'Multiple data residency options for compliance',
        'Regular security audits and penetration testing',
        '24/7 security monitoring and incident response',
      ],
      primaryAction: { label: 'Review Controls', href: '/security' },
      secondaryAction: { label: 'Close' },
    },
    testId: 'security-compliance',
  },
  {
    icon: Users,
    iconColor: '#F7931A',
    title: 'Human Guidance',
    description: 'Senior strategists and an active community ready to validate every play.',
    badge: 'Desk access',
    modalContent: {
      subtitle: 'Senior strategists ready to validate every play',
      description: 'Connect with experienced traders and learn from a community of professionals. Get personalized guidance to accelerate your trading journey.',
      highlights: [
        'One-on-one sessions with senior trading strategists',
        'Direct access to our professional trading desk',
        'Curated playbooks from successful traders',
        'Weekly office hours for strategy discussions',
        'Private Discord community for members',
        'Monthly market analysis webinars',
      ],
      primaryAction: { label: 'Talk to an Expert', href: '/contact' },
      secondaryAction: { label: 'Close' },
    },
    testId: 'human-guidance',
  },
];

export function FeatureHighlights() {
  const [openModals, setOpenModals] = useState<{ [key: string]: boolean }>({});

  const handleOpenChange = (featureTitle: string, open: boolean) => {
    setOpenModals(prev => ({ ...prev, [featureTitle]: open }));
  };

  return (
    <>
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
            <div 
              className="relative flex h-12 w-12 items-center justify-center rounded-2xl text-[#57c8ff]"
              style={{ 
                backgroundColor: `${feature.iconColor}15`,
              }}
            >
              <feature.icon className="h-6 w-6" style={{ color: feature.iconColor }} />
            </div>
            <div className="relative mt-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                {feature.badge}
              </span>
              <h3 className="mt-4 text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm text-white/70">{feature.description}</p>
            </div>
            <button
              onClick={() => handleOpenChange(feature.title, true)}
              className="relative mt-6 flex w-full items-center justify-between text-sm text-white/50 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-[#33E1DA] focus:ring-offset-2 focus:ring-offset-transparent rounded-lg p-1 -m-1"
              aria-label={`Learn more about ${feature.title}`}
              data-testid={`${feature.testId}-modal-trigger`}
            >
              <span>Learn more</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
          </article>
        ))}
      </div>

      {/* Render modals */}
      {highlights.map((feature) => (
        <FeatureModal
          key={feature.title}
          open={openModals[feature.title] || false}
          onOpenChange={(open) => handleOpenChange(feature.title, open)}
          icon={feature.icon}
          iconColor={feature.iconColor}
          title={feature.title}
          subtitle={feature.modalContent.subtitle}
          description={feature.modalContent.description}
          highlights={feature.modalContent.highlights}
          primaryAction={feature.modalContent.primaryAction}
          secondaryAction={feature.modalContent.secondaryAction}
          testId={`${feature.testId}-modal`}
        />
      ))}
    </>
  );
}
