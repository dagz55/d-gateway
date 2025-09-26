'use client';

import { Users, Signal, Database, Server } from 'lucide-react';

const stats = [
  { name: 'Total Users', value: '0', icon: Users, color: 'text-blue-400' },
  { name: 'Active Signals', value: '0', icon: Signal, color: 'text-green-400' },
  { name: 'Database Status', value: 'Connected', icon: Database, color: 'text-green-400' },
  { name: 'System Status', value: 'Online', icon: Server, color: 'text-purple-400' },
];

export default function PlatformStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={stat.name}
          className="glass-stat-card p-6 group animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <div className={`w-1 h-1 ${stat.color.replace('text-', 'bg-')} rounded-full animate-pulse`} />
                <p className={`text-xs font-bold uppercase tracking-wider ${stat.color} opacity-80`}>
                  {stat.name}
                </p>
              </div>
              <p className="text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform duration-300">
                {stat.value}
              </p>
              <div className={`h-0.5 w-8 ${stat.color.replace('text-', 'bg-')} rounded-full opacity-60`} />
            </div>

            <div className="relative">
              <div className={`w-14 h-14 glass-subtle rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300`}>
                <stat.icon className={`w-7 h-7 ${stat.color} group-hover:animate-pulse`} />
              </div>

              {/* Status indicators */}
              {stat.name === 'Database Status' && stat.value === 'Connected' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400/80 rounded-full animate-pulse border-2 border-background" />
              )}
              {stat.name === 'System Status' && stat.value === 'Online' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400/80 rounded-full animate-pulse border-2 border-background" />
              )}
            </div>
          </div>

          {/* Decorative gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent/30 to-transparent rounded-full" />

          {/* Glow effect on hover */}
          <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r from-${stat.color.split('-')[1]}-400/20 to-${stat.color.split('-')[1]}-600/20`} />
        </div>
      ))}
    </div>
  );
}
