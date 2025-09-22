'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'poor';
}

export function SimplePerformanceMonitor({ showUI = false }: { showUI?: boolean }) {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    const measurePerformance = () => {
      try {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        const newMetrics: PerformanceMetric[] = [];

        // Time to First Byte
        if (navigation?.responseStart && navigation?.requestStart) {
          const ttfb = Math.round(navigation.responseStart - navigation.requestStart);
          newMetrics.push({
            name: 'TTFB',
            value: ttfb,
            unit: 'ms',
            status: ttfb < 200 ? 'good' : ttfb < 500 ? 'warning' : 'poor'
          });
        }

        // First Contentful Paint
        const fcp = paint.find(p => p.name === 'first-contentful-paint');
        if (fcp) {
          const fcpValue = Math.round(fcp.startTime);
          newMetrics.push({
            name: 'FCP',
            value: fcpValue,
            unit: 'ms',
            status: fcpValue < 1800 ? 'good' : fcpValue < 3000 ? 'warning' : 'poor'
          });
        }

        // Largest Contentful Paint (estimated)
        const lcp = paint.find(p => p.name === 'largest-contentful-paint');
        if (lcp) {
          const lcpValue = Math.round(lcp.startTime);
          newMetrics.push({
            name: 'LCP',
            value: lcpValue,
            unit: 'ms',
            status: lcpValue < 2500 ? 'good' : lcpValue < 4000 ? 'warning' : 'poor'
          });
        }

        // DOM Content Loaded
        if (navigation?.domContentLoadedEventEnd && navigation?.domContentLoadedEventStart) {
          const dcl = Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
          newMetrics.push({
            name: 'DCL',
            value: dcl,
            unit: 'ms',
            status: dcl < 100 ? 'good' : dcl < 300 ? 'warning' : 'poor'
          });
        }

        // Load Complete
        if (navigation?.loadEventEnd && navigation?.loadEventStart) {
          const load = Math.round(navigation.loadEventEnd - navigation.loadEventStart);
          newMetrics.push({
            name: 'Load',
            value: load,
            unit: 'ms',
            status: load < 500 ? 'good' : load < 1000 ? 'warning' : 'poor'
          });
        }

        setMetrics(newMetrics);
        setIsLoading(false);
      } catch (error) {
        console.warn('Performance measurement failed:', error);
        setIsLoading(false);
      }
    };

    // Measure after load
    if (document.readyState === 'complete') {
      setTimeout(measurePerformance, 100);
    } else {
      window.addEventListener('load', () => {
        setTimeout(measurePerformance, 100);
      });
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400 border-green-400';
      case 'warning': return 'text-yellow-400 border-yellow-400';
      case 'poor': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'good': return '✅';
      case 'warning': return '⚠️';
      case 'poor': return '❌';
      default: return '⏳';
    }
  };

  if (!showUI || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-xs font-mono">
      <h3 className="text-white font-bold mb-2 text-center">⚡ Performance</h3>
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-white/50 text-center">Measuring...</div>
        ) : (
          metrics.map(({ name, value, unit, status }) => (
            <div
              key={name}
              className={`flex items-center justify-between gap-4 p-2 border rounded ${getStatusColor(status)}`}
            >
              <span className="flex items-center gap-2">
                <span>{getStatusEmoji(status)}</span>
                <span className="text-white">{name}</span>
              </span>
              <span className={getStatusColor(status)}>
                {value}{unit}
              </span>
            </div>
          ))
        )}
      </div>
      {metrics.length === 0 && !isLoading && (
        <div className="text-white/50 text-center">No metrics available</div>
      )}
    </div>
  );
}
