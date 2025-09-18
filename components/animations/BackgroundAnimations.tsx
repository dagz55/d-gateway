"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface FloatingParticleProps {
  delay?: number;
  size?: number;
  color?: string;
  duration?: number;
}

export function FloatingParticle({ 
  delay = 0, 
  size = 4, 
  color = '#33E1DA', 
  duration = 20 
}: FloatingParticleProps) {
  const [position, setPosition] = useState<{x: number, y: number} | null>(null);

  useEffect(() => {
    // Set position on client side only to avoid hydration mismatch
    setPosition({
      x: Math.random() * 100,
      y: Math.random() * 100
    });
  }, []);

  // Don't render anything until position is set on client
  if (!position) {
    return null;
  }

  return (
    <motion.div
      className="absolute rounded-full opacity-20"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      animate={{
        y: [0, -50, 0],
        x: [0, 30, -30, 0],
        opacity: [0.2, 0.8, 0.2],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

interface AnimatedGridProps {
  className?: string;
}

export function AnimatedGrid({ className = "" }: AnimatedGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let animationId: number;
    const gridSize = 50;
    const pulseLines: Array<{ x: number; y: number; progress: number; horizontal: boolean }> = [];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Draw static grid
      ctx.strokeStyle = "rgba(51, 225, 218, 0.05)";
      ctx.lineWidth = 1;

      for (let x = 0; x < canvas.offsetWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.offsetHeight);
        ctx.stroke();
      }

      for (let y = 0; y < canvas.offsetHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.offsetWidth, y);
        ctx.stroke();
      }

      // Add pulse lines occasionally
      if (Math.random() < 0.01) {
        pulseLines.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          progress: 0,
          horizontal: Math.random() > 0.5,
        });
      }

      // Draw and update pulse lines
      ctx.strokeStyle = "rgba(51, 225, 218, 0.6)";
      ctx.lineWidth = 2;

      pulseLines.forEach((line, index) => {
        line.progress += 0.03;

        if (line.progress > 1) {
          pulseLines.splice(index, 1);
          return;
        }

        const alpha = Math.sin(line.progress * Math.PI);
        ctx.strokeStyle = `rgba(51, 225, 218, ${alpha * 0.6})`;

        ctx.beginPath();
        if (line.horizontal) {
          const startX = line.x - (line.progress * 100);
          const endX = line.x + (line.progress * 100);
          ctx.moveTo(Math.max(0, startX), line.y);
          ctx.lineTo(Math.min(canvas.offsetWidth, endX), line.y);
        } else {
          const startY = line.y - (line.progress * 100);
          const endY = line.y + (line.progress * 100);
          ctx.moveTo(line.x, Math.max(0, startY));
          ctx.lineTo(line.x, Math.min(canvas.offsetHeight, endY));
        }
        ctx.stroke();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

interface WaveAnimationProps {
  className?: string;
  color?: string;
  amplitude?: number;
  frequency?: number;
  speed?: number;
}

export function WaveAnimation({ 
  className = "",
  color = "#33E1DA",
  amplitude = 50,
  frequency = 0.02,
  speed = 0.05
}: WaveAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    let animationId: number;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.offsetHeight);
      gradient.addColorStop(0, `${color}20`);
      gradient.addColorStop(0.5, `${color}10`);
      gradient.addColorStop(1, `${color}05`);

      ctx.fillStyle = gradient;

      // Draw wave
      ctx.beginPath();
      ctx.moveTo(0, canvas.offsetHeight);

      for (let x = 0; x <= canvas.offsetWidth; x += 5) {
        const y = canvas.offsetHeight / 2 + 
          Math.sin(x * frequency + time) * amplitude +
          Math.sin(x * frequency * 2 + time * 1.5) * (amplitude * 0.5) +
          Math.sin(x * frequency * 0.5 + time * 0.8) * (amplitude * 0.3);
        
        ctx.lineTo(x, y);
      }

      ctx.lineTo(canvas.offsetWidth, canvas.offsetHeight);
      ctx.closePath();
      ctx.fill();

      time += speed;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [color, amplitude, frequency, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

interface GlowingOrbProps {
  size?: number;
  color?: string;
  intensity?: number;
  duration?: number;
  className?: string;
}

export function GlowingOrb({ 
  size = 200, 
  color = "#33E1DA", 
  intensity = 0.3, 
  duration = 4,
  className = ""
}: GlowingOrbProps) {
  return (
    <motion.div
      className={`absolute rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
        filter: 'blur(40px)',
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [intensity, intensity * 1.5, intensity],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export function ParticleField({ count = 50 }: { count?: number }) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    delay: number;
    size: number;
    color: string;
    duration: number;
  }>>([]);

  useEffect(() => {
    // Generate particles on client side only to avoid hydration mismatch
    setParticles(Array.from({ length: count }, (_, i) => ({
      id: i,
      delay: Math.random() * 10,
      size: Math.random() * 6 + 2,
      color: Math.random() > 0.5 ? '#33E1DA' : '#1A7FB3',
      duration: Math.random() * 15 + 10,
    })));
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <FloatingParticle
          key={particle.id}
          delay={particle.delay}
          size={particle.size}
          color={particle.color}
          duration={particle.duration}
        />
      ))}
    </div>
  );
}

interface MatrixRainProps {
  className?: string;
  color?: string;
  speed?: number;
}

export function MatrixRain({ 
  className = "",
  color = "#33E1DA",
  speed = 50
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const chars = "01";
    const fontSize = 14;
    let columns: number;
    let drops: number[];

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: columns }, () => 1);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = () => {
      ctx.fillStyle = "rgba(10, 15, 31, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      setTimeout(() => {
        animationId = requestAnimationFrame(animate);
      }, speed);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [color, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full opacity-20 ${className}`}
    />
  );
}

export function CombinedBackgroundAnimations() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated Grid */}
      <AnimatedGrid className="opacity-30" />
      
      {/* Particle Field */}
      <ParticleField count={30} />
      
      {/* Glowing Orbs */}
      <GlowingOrb 
        size={300} 
        color="#33E1DA" 
        intensity={0.1} 
        duration={6}
        className="top-10 left-10"
      />
      <GlowingOrb 
        size={250} 
        color="#1A7FB3" 
        intensity={0.15} 
        duration={8}
        className="bottom-20 right-20"
      />
      <GlowingOrb 
        size={180} 
        color="#33E1DA" 
        intensity={0.08} 
        duration={5}
        className="top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
      
      {/* Wave Animation */}
      <WaveAnimation 
        className="bottom-0 opacity-20"
        color="#33E1DA"
        amplitude={30}
        frequency={0.015}
        speed={0.03}
      />
      
      {/* Matrix Rain Effect */}
      <MatrixRain 
        className="opacity-10"
        color="#33E1DA"
        speed={100}
      />
    </div>
  );
}
