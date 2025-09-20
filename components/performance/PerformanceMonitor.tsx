"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  updateCount: number;
  lastUpdate: number;
}

export const PerformanceMonitor: React.FC<{ 
  enabled?: boolean;
  showDetails?: boolean;
}> = ({ enabled = false, showDetails = false }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    updateCount: 0,
    lastUpdate: 0
  });
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const renderTimes = useRef<number[]>([]);
  const updateCountRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    let animationFrame: number;
    
    const measurePerformance = () => {
      const now = performance.now();
      frameCount.current++;
      
      // Calculate FPS every second
      if (now - lastTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
        frameCount.current = 0;
        lastTime.current = now;
        
        // Get memory usage if available
        const memory = (performance as any).memory;
        const memoryUsage = memory ? 
          Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100) : 0;
        
        // Calculate average render time
        const avgRenderTime = renderTimes.current.length > 0 ? 
          renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length : 0;
        
        setMetrics({
          fps,
          memoryUsage,
          renderTime: Math.round(avgRenderTime * 100) / 100,
          updateCount: updateCountRef.current,
          lastUpdate: now
        });
        
        // Reset render times array
        renderTimes.current = [];
        updateCountRef.current = 0;
      }
      
      animationFrame = requestAnimationFrame(measurePerformance);
    };
    
    animationFrame = requestAnimationFrame(measurePerformance);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [enabled]);

  // Public method to track render times
  const trackRenderTime = (renderTime: number) => {
    if (enabled) {
      renderTimes.current.push(renderTime);
    }
  };

  // Public method to track updates
  const trackUpdate = () => {
    if (enabled) {
      updateCountRef.current++;
    }
  };

  // Expose tracking methods globally for components to use
  useEffect(() => {
    if (enabled) {
      (window as any).performanceTracker = {
        trackRenderTime,
        trackUpdate
      };
    }
    
    return () => {
      if ((window as any).performanceTracker) {
        delete (window as any).performanceTracker;
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMemoryColor = (usage: number) => {
    if (usage <= 50) return 'text-green-400';
    if (usage <= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!showDetails) {
    // Compact version
    return (
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-black/80 border-[#33e1da]/30">
            <Activity className="w-3 h-3 mr-1" />
            <span className={getFPSColor(metrics.fps)}>{metrics.fps} FPS</span>
          </Badge>
          {metrics.memoryUsage > 0 && (
            <Badge variant="outline" className="bg-black/80 border-[#33e1da]/30">
              <Zap className="w-3 h-3 mr-1" />
              <span className={getMemoryColor(metrics.memoryUsage)}>{metrics.memoryUsage}%</span>
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // Detailed version
  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 bg-black/90 border-[#33e1da]/30 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-[#eaf2ff] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#33e1da]" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[#eaf2ff]/70">FPS:</span>
            <span className={`font-mono font-bold ${getFPSColor(metrics.fps)}`}>
              {metrics.fps}
            </span>
          </div>
          
          {metrics.memoryUsage > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-[#eaf2ff]/70">Memory:</span>
              <span className={`font-mono font-bold ${getMemoryColor(metrics.memoryUsage)}`}>
                {metrics.memoryUsage}%
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-[#eaf2ff]/70">Render:</span>
            <span className="font-mono text-[#33e1da] font-bold">
              {metrics.renderTime.toFixed(1)}ms
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-[#eaf2ff]/70">Updates:</span>
            <span className="font-mono text-blue-400 font-bold">
              {metrics.updateCount}/s
            </span>
          </div>
        </div>
        
        <div className="border-t border-[#33e1da]/20 pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#eaf2ff]/70">Status:</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                metrics.fps >= 55 ? 'bg-green-400' : 
                metrics.fps >= 30 ? 'bg-yellow-400' : 'bg-red-400'
              } animate-pulse`} />
              <span className={`font-semibold ${
                metrics.fps >= 55 ? 'text-green-400' : 
                metrics.fps >= 30 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {metrics.fps >= 55 ? 'Excellent' : 
                 metrics.fps >= 30 ? 'Good' : 'Poor'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-[#eaf2ff]/50 text-center">
          Last update: {new Date(metrics.lastUpdate).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to track performance in components
export const usePerformanceTracking = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  
  const startRender = () => {
    renderStartTime.current = performance.now();
  };
  
  const endRender = () => {
    const renderTime = performance.now() - renderStartTime.current;
    if ((window as any).performanceTracker) {
      (window as any).performanceTracker.trackRenderTime(renderTime);
    }
  };
  
  const trackUpdate = () => {
    if ((window as any).performanceTracker) {
      (window as any).performanceTracker.trackUpdate();
    }
  };
  
  return { startRender, endRender, trackUpdate };
};
