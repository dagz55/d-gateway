'use client';

import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

export function TechBackgroundAnimation() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Generate particles
    const newParticles: Particle[] = [];
    const colors = ['#33E1DA', '#1A7FB3', '#10B981', '#F59E0B', '#8B5CF6'];
    
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 1 + Math.random() * 3,
        opacity: 0.1 + Math.random() * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    
    setParticles(newParticles);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Hexagonal Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="w-full h-full">
          <defs>
            <pattern id="hexagons" x="0" y="0" width="100" height="87" patternUnits="userSpaceOnUse">
              <polygon
                points="50,1 85,25 85,62 50,86 15,62 15,25"
                fill="none"
                stroke="#33E1DA"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </div>

      {/* Moving Particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-drift-fast"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              animationDelay: `${particle.id * 0.1}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Data Flow Streams */}
      <div className="absolute inset-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={`flow-${i}`}
            className="absolute"
            style={{
              left: `${i * 8.33}%`,
              top: '0%',
              width: '2px',
              height: '100%',
            }}
          >
            <div
              className="w-full bg-gradient-to-b from-transparent via-primary/40 to-transparent animate-data-stream"
              style={{
                height: '20%',
                animationDelay: `${i * 0.5}s`,
                animationDuration: '4s',
              }}
            />
          </div>
        ))}
      </div>

      {/* Geometric Shapes */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`shape-${i}`}
            className="absolute border border-accent/20 animate-parallax-float"
            style={{
              left: `${15 + i * 10}%`,
              top: `${20 + (i % 3) * 25}%`,
              width: `${30 + i * 5}px`,
              height: `${30 + i * 5}px`,
              transform: `rotate(${i * 45}deg)`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${10 + i}s`,
            }}
          />
        ))}
      </div>

      {/* Network Connections */}
      <svg className="absolute inset-0 w-full h-full opacity-15">
        <defs>
          <linearGradient id="network-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#33E1DA" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#1A7FB3" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        
        {/* Network lines */}
        {Array.from({ length: 15 }).map((_, i) => {
          const startX = (i * 100) % 800;
          const startY = (i * 150) % 600;
          const endX = ((i + 3) * 120) % 800;
          const endY = ((i + 2) * 180) % 600;
          
          return (
            <line
              key={`network-${i}`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="url(#network-gradient)"
              strokeWidth="1"
              className="animate-chart-draw"
              style={{
                animationDelay: `${i * 0.8}s`,
                animationDuration: '12s',
              }}
            />
          );
        })}
        
        {/* Network nodes */}
        {Array.from({ length: 10 }).map((_, i) => (
          <circle
            key={`node-${i}`}
            cx={(i * 80) % 800}
            cy={(i * 120) % 600}
            r="3"
            fill="#33E1DA"
            opacity="0.6"
            className="animate-crypto-pulse"
            style={{
              animationDelay: `${i * 1.5}s`,
              animationDuration: '6s',
            }}
          />
        ))}
      </svg>

      {/* Scanning Lines */}
      <div className="absolute inset-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`scan-${i}`}
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent animate-bullet-move"
            style={{
              top: `${25 + i * 25}%`,
              animationDelay: `${i * 3}s`,
              animationDuration: '8s',
            }}
          />
        ))}
      </div>
    </div>
  );
}