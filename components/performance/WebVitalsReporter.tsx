'use client';

import { useEffect, useState } from 'react';
import { onCLS, onFID, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

interface VitalScore {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  unit: string;
}

export function WebVitalsReporter({ showUI = false }: { showUI?: boolean }) {
  const [vitals, setVitals] = useState<VitalScore[]>([]);

  useEffect(() => {
    const handleMetric = (metric: Metric) => {
      const { name, value, rating } = metric;
      
      // Convert to appropriate units and format
      let displayValue = value;
      let unit = 'ms';
      
      if (name === 'CLS') {
        displayValue = Math.round(value * 1000) / 1000; // Round to 3 decimal places
        unit = '';
      } else if (name === 'FID') {
        displayValue = Math.round(value);
        unit = 'ms';
      } else {
        displayValue = Math.round(value);
        unit = 'ms';
      }

      const vitalScore: VitalScore = {
        name,
        value: displayValue,
        rating,
        unit
      };

      setVitals(prev => {
        const existing = prev.find(v => v.name === name);
        if (existing) {
          return prev.map(v => v.name === name ? vitalScore : v);
        }
        return [...prev, vitalScore];
      });

      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        // Send to your analytics service
        console.log('Web Vital:', vitalScore);
      }
    };

    // Measure all Web Vitals
    onCLS(handleMetric);
    onFID(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);

  }, []);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-400 border-green-400';
      case 'needs-improvement': return 'text-yellow-400 border-yellow-400';
      case 'poor': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getRatingEmoji = (rating: string) => {
    switch (rating) {
      case 'good': return '✅';
      case 'needs-improvement': return '⚠️';
      case 'poor': return '❌';
      default: return '⏳';
    }
  };

  if (!showUI || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-xs font-mono">
      <h3 className="text-white font-bold mb-2 text-center">⚡ Web Vitals</h3>
      <div className="space-y-2">
        {vitals.map(({ name, value, rating, unit }) => (
          <div
            key={name}
            className={`flex items-center justify-between gap-4 p-2 border rounded ${getRatingColor(rating)}`}
          >
            <span className="flex items-center gap-2">
              <span>{getRatingEmoji(rating)}</span>
              <span className="text-white">{name}</span>
            </span>
            <span className={getRatingColor(rating)}>
              {value}{unit}
            </span>
          </div>
        ))}
      </div>
      {vitals.length === 0 && (
        <div className="text-white/50 text-center">Measuring...</div>
      )}
    </div>
  );
}
