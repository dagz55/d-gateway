"use client";

import { BackgroundCells } from "@/components/ui/background-ripple-effect";
import { useState } from "react";

export const BackgroundCellsDemo = () => {
  const [variant, setVariant] = useState<'default' | 'zignal' | 'minimal'>('zignal');
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');

  return (
    <div className="min-h-screen">
      {/* Controls */}
      <div className="fixed top-4 left-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-4 space-y-2">
        <div>
          <label className="text-white text-sm block mb-1">Variant:</label>
          <select 
            value={variant} 
            onChange={(e) => setVariant(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
          >
            <option value="default">Default</option>
            <option value="zignal">Zignal</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        <div>
          <label className="text-white text-sm block mb-1">Intensity:</label>
          <select 
            value={intensity} 
            onChange={(e) => setIntensity(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <BackgroundCells 
        variant={variant}
        intensity={intensity}
        enableRipple={true}
        enableMouse={true}
        cellSize={12}
        rows={25}
        cols={40}
      >
        <div className="text-center space-y-6">
          <h1 className="md:text-4xl lg:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-[#33E1DA] to-[#1A7FB3] pointer-events-none">
            Enhanced Background Cells
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto pointer-events-none">
            Interactive grid with mouse tracking, ripple effects, and customizable themes. 
            Move your mouse around and click cells to see the magic!
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60 pointer-events-none">
            <span>✨ Mouse tracking</span>
            <span>💫 Ripple effects</span>
            <span>🎨 Theme variants</span>
            <span>⚡ Performance optimized</span>
          </div>
        </div>
      </BackgroundCells>
    </div>
  );
};
