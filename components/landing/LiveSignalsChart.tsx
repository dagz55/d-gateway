"use client"

import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'

interface LiveSignalsChartProps {
  percentChange?: string;
}

export function LiveSignalsChart({ percentChange = "+24.7%" }: LiveSignalsChartProps) {
  return (
    <div className="flex items-center gap-6">
      {/* Chart Icon */}
      <div className="relative">
        <div className="flex items-end gap-1">
          <div className="w-3 h-8 rounded-sm animate-pulse" style={{ backgroundColor: 'var(--zignal-accent)' }} />
          <div className="w-3 h-12 rounded-sm animate-pulse" style={{ backgroundColor: 'var(--zignal-accent)', animationDelay: '0.2s' }} />
          <div className="w-3 h-6 rounded-sm animate-pulse" style={{ backgroundColor: 'var(--zignal-accent)', animationDelay: '0.4s' }} />
          <div className="w-3 h-16 rounded-sm animate-pulse" style={{ backgroundColor: 'var(--zignal-accent)', animationDelay: '0.6s' }} />
          <div className="w-3 h-10 rounded-sm animate-pulse" style={{ backgroundColor: 'var(--zignal-accent)', animationDelay: '0.8s' }} />
        </div>
      </div>

      {/* Signal Info */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-[#33E1DA]" />
          <span className="text-2xl font-bold text-[#33E1DA]">{percentChange}</span>
        </div>
        <p className="text-white/70 text-sm font-medium">Live Signals</p>
      </div>
    </div>
  )
}