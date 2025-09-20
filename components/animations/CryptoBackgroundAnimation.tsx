'use client';

import React, { useEffect, useState } from 'react';
import { Bitcoin, Gem, Diamond, GitBranch, Route, Orbit, Activity, ArrowUp } from 'lucide-react';

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  opacity: number;
  type: 'crypto' | 'tech';
  icon: React.ComponentType<any>;
  color: string;
  delay: number;
}

const cryptoIcons = [
  { icon: Bitcoin, color: '#F7931A' },
  { icon: Gem, color: '#627EEA' },
  { icon: Diamond, color: '#00D4AA' },
];

const techIcons = [
  { icon: GitBranch, color: '#33E1DA' },
  { icon: Route, color: '#1A7FB3' },
  { icon: Orbit, color: '#10B981' },
  { icon: Activity, color: '#8B5CF6' },
  { icon: ArrowUp, color: '#F59E0B' },
];

export function CryptoBackgroundAnimation() {
  const [elements, setElements] = useState<FloatingElement[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Generate floating elements
    const newElements: FloatingElement[] = [];
    
    // Add crypto elements
    for (let i = 0; i < 15; i++) {
      const cryptoIcon = cryptoIcons[i % cryptoIcons.length];
      newElements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 20 + Math.random() * 30,
        speed: 0.5 + Math.random() * 1.5,
        rotation: Math.random() * 360,
        opacity: 0.1 + Math.random() * 0.2,
        type: 'crypto',
        icon: cryptoIcon.icon,
        color: cryptoIcon.color,
        delay: Math.random() * 10,
      });
    }
    
    // Add tech elements
    for (let i = 15; i < 30; i++) {
      const techIcon = techIcons[(i - 15) % techIcons.length];
      newElements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 16 + Math.random() * 24,
        speed: 0.3 + Math.random() * 1.2,
        rotation: Math.random() * 360,
        opacity: 0.08 + Math.random() * 0.15,
        type: 'tech',
        icon: techIcon.icon,
        color: techIcon.color,
        delay: Math.random() * 15,
      });
    }
    
    setElements(newElements);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(51, 225, 218, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(51, 225, 218, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Floating Elements */}
      {elements.map((element) => {
        const IconComponent = element.icon;
        return (
          <div
            key={element.id}
            className={`absolute ${element.type === 'crypto' ? 'animate-crypto-float' : 'animate-drift-slow'}`}
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDelay: `${element.delay}s`,
              animationDuration: `${12 + Math.random() * 8}s`,
            }}
          >
            <IconComponent
              size={element.size}
              style={{
                color: element.color,
                opacity: element.opacity,
                transform: `rotate(${element.rotation}deg)`,
                filter: `drop-shadow(0 0 ${element.size / 4}px ${element.color}40)`,
              }}
            />
          </div>
        );
      })}

      {/* Data Stream Lines */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`stream-${i}`}
            className="absolute w-px bg-gradient-to-b from-transparent via-accent/30 to-transparent animate-data-stream"
            style={{
              left: `${10 + i * 12}%`,
              height: '100%',
              animationDelay: `${i * 0.8}s`,
              animationDuration: '6s',
            }}
          />
        ))}
      </div>

      {/* Pulse Circles */}
      <div className="absolute inset-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`pulse-${i}`}
            className="absolute rounded-full border border-accent/20 animate-crypto-pulse"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              animationDelay: `${i * 2}s`,
              animationDuration: '8s',
            }}
          />
        ))}
      </div>

      {/* Circuit Connections */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#33E1DA" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#1A7FB3" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#33E1DA" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        
        {/* Animated circuit paths */}
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={`circuit-${i}`}>
            <path
              d={`M ${i * 150} 0 Q ${i * 150 + 75} 200 ${i * 150 + 150} 400 T ${i * 150 + 300} 800`}
              stroke="url(#circuit-gradient)"
              strokeWidth="2"
              fill="none"
              className="animate-chart-draw"
              style={{
                animationDelay: `${i * 1.5}s`,
                animationDuration: '10s',
              }}
            />
            
            {/* Circuit nodes */}
            <circle
              cx={i * 150 + 75}
              cy="200"
              r="4"
              fill="#33E1DA"
              opacity="0.4"
              className="animate-crypto-glow"
              style={{
                animationDelay: `${i * 1.5 + 2}s`,
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}