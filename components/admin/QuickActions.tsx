'use client';

import { Button } from '@/components/ui/button';
import { Users, Signal, Settings, Database, Shield, BarChart3, CreditCard } from 'lucide-react';
import Link from 'next/link';

const actions = [
  {
    name: 'Manage Users',
    description: 'Add, edit, or remove platform users',
    color: 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-400/30',
    iconColor: 'text-blue-400',
    icon: Users,
    href: '/admin/users',
  },
  {
    name: 'View Signals',
    description: 'Monitor trading signals and performance',
    color: 'bg-green-600/20 hover:bg-green-600/30 border-green-400/30',
    iconColor: 'text-green-400',
    icon: Signal,
    href: '/admin/signals',
  },
  {
    name: 'System Settings',
    description: 'Configure platform settings and preferences',
    color: 'bg-purple-600/20 hover:bg-purple-600/30 border-purple-400/30',
    iconColor: 'text-purple-400',
    icon: Settings,
    href: '/admin/settings',
  },
  {
    name: 'Database Manager',
    description: 'View and manage database operations',
    color: 'bg-yellow-600/20 hover:bg-yellow-600/30 border-yellow-400/30',
    iconColor: 'text-yellow-400',
    icon: Database,
    href: '/admin/database',
  },
  {
    name: 'Security Center',
    description: 'Review security logs and settings',
    color: 'bg-red-600/20 hover:bg-red-600/30 border-red-400/30',
    iconColor: 'text-red-400',
    icon: Shield,
    href: '/admin/security',
  },
  {
    name: 'Analytics',
    description: 'View detailed platform analytics',
    color: 'bg-cyan-600/20 hover:bg-cyan-600/30 border-cyan-400/30',
    iconColor: 'text-cyan-400',
    icon: BarChart3,
    href: '/admin/analytics',
  },
  {
    name: 'PayPal Payments',
    description: 'Create and manage PayPal payment links',
    color: 'bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-400/30',
    iconColor: 'text-indigo-400',
    icon: CreditCard,
    href: '/admin/paypal-payments',
  }
];

export function QuickActions() {
  return (
    <div className="space-y-4">
      {actions.map((action, index) => (
        <Link key={action.name} href={action.href}>
          <div
            className="glass-subtle rounded-xl p-4 group hover:glass-light transition-all duration-300 cursor-pointer animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center space-x-4">
              {/* Icon */}
              <div className={`w-12 h-12 glass-subtle rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 border ${action.color}`}>
                <action.icon className={`w-6 h-6 ${action.iconColor} group-hover:animate-pulse`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold group-hover:text-accent transition-colors duration-300">
                  {action.name}
                </h4>
                <p className="text-xs text-white/60 mt-1 group-hover:text-white/80 transition-colors">
                  {action.description}
                </p>
              </div>

              {/* Arrow indicator */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1">
                <div className={`w-8 h-8 glass-subtle rounded-lg flex items-center justify-center ${action.iconColor}`}>
                  <span className="text-sm font-bold">→</span>
                </div>
              </div>
            </div>

            {/* Decorative bottom border */}
            <div className={`mt-3 h-0.5 bg-gradient-to-r from-transparent via-${action.iconColor.split('-')[1]}-400/30 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          </div>
        </Link>
      ))}

      {/* Additional admin panel button */}
      <div className="pt-4 border-t border-white/5">
        <Link href="/admin/advanced-panel">
          <button className="w-full glass-premium p-4 rounded-xl text-white font-semibold hover:scale-[1.02] transition-all duration-300 group">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center animate-pulse">
                <span className="text-xs text-black font-bold">⚡</span>
              </div>
              <span className="gradient-text">Advanced Admin Panel</span>
              <div className="w-6 h-6 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-black font-bold">+</span>
              </div>
            </div>
          </button>
        </Link>
      </div>
    </div>
  );
}
