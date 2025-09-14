'use client';

import { cn } from "@/lib/utils";

interface SparkProps {
  data: number[];
  className?: string;
  height?: number;
  width?: number;
  color?: string;
}

export default function Spark({ 
  data, 
  className, 
  height = 40, 
  width = 100, 
  color = "#33E1DA" 
}: SparkProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className={cn("flex items-center justify-center", className)}
        style={{ height, width }}
      >
        <div className="text-xs text-white/50">No data</div>
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const pathData = `M ${points}`;

  return (
    <div className={cn("relative", className)} style={{ height, width }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <path
          d={`${pathData} L ${width} ${height} L 0 ${height} Z`}
          fill="url(#sparkGradient)"
        />
        
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
