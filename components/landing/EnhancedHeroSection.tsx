"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { TrendingUp, Zap, Shield, BarChart3, X, ArrowRight, Users, Target } from 'lucide-react';
import Link from 'next/link';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float time;
  uniform vec2 resolution;
  
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
  
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  void main() {
    vec2 uv = vUv;
    vec2 pos = uv * 8.0;
    
    float n1 = noise(pos + time * 0.1);
    float n2 = noise(pos * 2.0 + time * 0.15);
    float n3 = noise(pos * 4.0 + time * 0.2);
    
    float finalNoise = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    
    vec3 color1 = vec3(0.2, 0.88, 0.86);
    vec3 color2 = vec3(0.1, 0.5, 0.7);
    vec3 color3 = vec3(0.04, 0.06, 0.12);
    
    vec3 finalColor = mix(color3, mix(color2, color1, finalNoise), finalNoise);
    
    float alpha = 0.3 + finalNoise * 0.4;
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

const ParticleShaderMaterial = shaderMaterial(
  { time: 0, resolution: new THREE.Vector2(1, 1) },
  vertexShader,
  fragmentShader
);

extend({ ParticleShaderMaterial });

function FloatingParticles() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<any>(null!);

  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.time = state.clock.elapsedTime;
    const { width, height } = state.size;
    materialRef.current.resolution.set(width, height);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -1]}>
      <planeGeometry args={[6, 6]} />
      <particleShaderMaterial ref={materialRef} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

function ParticleBackground() {
  return (
    <div className="absolute inset-0 -z-10 w-full h-full bg-gradient-to-br from-[#0A0F1F] via-[#1E2A44] to-[#1A7FB3]">
      <Canvas
        camera={{ position: [0, 0, 2], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <FloatingParticles />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1F]/50 via-transparent to-[#0A0F1F]/30" />
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#33E1DA]/10 to-[#1A7FB3]/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
      <div className="relative bg-[#0A0F1F]/40 backdrop-blur-sm border border-[#33E1DA]/20 rounded-xl p-6 hover:border-[#33E1DA]/40 transition-all duration-300">
        <div className="text-[#33E1DA] mb-4 transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-[#EAF2FF] font-semibold text-lg mb-2">{title}</h3>
        <p className="text-[#EAF2FF]/70 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

interface PriceTickerProps {
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
  delay: number;
}

function PriceTicker({ symbol, price, change, isPositive, delay }: PriceTickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-center justify-between bg-[#0A0F1F]/30 backdrop-blur-sm border border-[#33E1DA]/20 rounded-lg p-3 hover:border-[#33E1DA]/40 transition-all duration-300"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-[#33E1DA] to-[#1A7FB3] rounded-full flex items-center justify-center text-[#0A0F1F] text-xs font-bold">
          {symbol.slice(0, 2)}
        </div>
        <div>
          <div className="text-[#EAF2FF] font-medium text-sm">{symbol}</div>
          <div className="text-[#EAF2FF]/60 text-xs">{price}</div>
        </div>
      </div>
      <div className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{change}%
      </div>
    </motion.div>
  );
}

function PromoBanner() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const banners = [
    {
      title: "Cryptocurrency trading made simple.",
      subtitle: "Want to experience risk-free trading?",
      cta: "Go ahead and purchase our trade signals packages!"
    },
    {
      title: "Flexible Pricing",
      subtitle: "Package price will depend on the duration of the availed packages.",
      cta: ""
    },
    {
      title: "Expert Guidance",
      subtitle: "Having a hard time mastering the art of cryptocurrency?",
      cta: "Reach out to your Zignals advisor to learn more."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="relative bg-gradient-to-r from-[#33E1DA] to-[#1A7FB3] text-[#0A0F1F] py-3 px-6 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#0A0F1F]/10" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: [-1000, 1000] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      
      <div className="relative container mx-auto flex items-center justify-between">
        <div className="flex-1 text-center">
          <motion.div
            key={currentBanner}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="font-semibold text-sm md:text-base">
              {banners[currentBanner].title}
            </h3>
            {banners[currentBanner].subtitle && (
              <p className="text-xs md:text-sm opacity-90 mt-1">
                {banners[currentBanner].subtitle}
              </p>
            )}
            {banners[currentBanner].cta && (
              <p className="text-xs md:text-sm font-medium mt-1 flex items-center justify-center gap-1">
                {banners[currentBanner].cta}
                <ArrowRight size={14} />
              </p>
            )}
          </motion.div>
        </div>
        
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 p-1 hover:bg-white/20 rounded transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 pb-1">
        {banners.map((_, index) => (
          <div
            key={index}
            className={`w-8 h-0.5 rounded transition-all duration-300 ${
              index === currentBanner ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}

function SecuritySection() {
  const securityFeatures = [
    "All payments are processed through secure gateways to protect your financial information.",
    "Personal details are encrypted and never shared with third parties.",
    "Multi-layer security, including strong password encryption and optional 2FA.",
    "We have a dedicated team that will regularly monitor and moderate our platform to protect Zignal members from scams or malicious activity.",
    "Honest results, no hidden tricks because we prioritize building trust within our community"
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-[#0A0F1F]/40 backdrop-blur-sm border border-[#33E1DA]/20 rounded-2xl p-8 mb-12"
      id="security"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-[#EAF2FF] mb-6 flex items-center gap-3">
        <Shield className="text-[#33E1DA]" size={32} />
        SITE SECURITY - HOW WE MAKE SURE YOUR FUNDS AND INFORMATION ARE SAFE WITH US
      </h2>
      <div className="space-y-4">
        {securityFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="flex items-start gap-3"
          >
            <div className="w-6 h-6 bg-gradient-to-r from-[#33E1DA] to-[#1A7FB3] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[#0A0F1F] text-sm font-bold">{index + 1}</span>
            </div>
            <p className="text-[#EAF2FF]/80 leading-relaxed">{feature}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

function MissionVisionSection() {
  return (
    <div className="grid md:grid-cols-2 gap-8 mb-12" id="about">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-[#0A0F1F]/40 backdrop-blur-sm border border-[#33E1DA]/20 rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-[#EAF2FF] mb-4 flex items-center gap-3">
          <Target className="text-[#33E1DA]" size={24} />
          Mission
        </h3>
        <p className="text-[#EAF2FF]/80 leading-relaxed">
          To guide every trader with clear and reliable cryptocurrency trading signals in order to make trading easier, straight to the point, and more profitable while building a supportive community that grows together
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-[#0A0F1F]/40 backdrop-blur-sm border border-[#33E1DA]/20 rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-[#EAF2FF] mb-4 flex items-center gap-3">
          <Users className="text-[#1A7FB3]" size={24} />
          Vision
        </h3>
        <p className="text-[#EAF2FF]/80 leading-relaxed">
          To be the go-to crypto signals hub for everyone. We are data-driven, trustworthy, and innovative in the cryptocurrency space. We do this by paving the way for financial freedom for Zignal members
        </p>
      </motion.div>
    </div>
  );
}

export function EnhancedHeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <TrendingUp size={24} />,
      title: "Advanced Analytics",
      description: "Real-time market analysis with AI-powered insights and predictive modeling."
    },
    {
      icon: <Zap size={24} />,
      title: "Lightning Fast",
      description: "Execute trades in milliseconds with our high-performance trading engine."
    },
    {
      icon: <Shield size={24} />,
      title: "Bank-Grade Security",
      description: "Multi-layer security with cold storage and advanced encryption protocols."
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Portfolio Management",
      description: "Comprehensive portfolio tracking with automated rebalancing strategies."
    }
  ];

  const cryptoPrices = [
    { symbol: "BTC", price: "$67,234", change: "2.45", isPositive: true },
    { symbol: "ETH", price: "$3,456", change: "1.23", isPositive: true },
    { symbol: "ADA", price: "$0.89", change: "-0.56", isPositive: false },
    { symbol: "SOL", price: "$156", change: "4.12", isPositive: true }
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0F1F] text-[#EAF2FF]">
      <PromoBanner />
      <ParticleBackground />
      
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${50 + mousePosition.x * 20}% ${50 + mousePosition.y * 20}%, rgba(51, 225, 218, 0.1) 0%, transparent 50%)`
        }}
      />

      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Column - Hero Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="inline-block bg-gradient-to-r from-[#33E1DA]/20 to-[#1A7FB3]/20 border border-[#33E1DA]/30 rounded-full px-4 py-2 text-sm text-[#33E1DA] mb-6"
              >
                ✨ Professional Trading Signals
              </motion.span>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-[#EAF2FF] via-[#33E1DA] to-[#EAF2FF] bg-clip-text text-transparent">
                  Trade Crypto
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#33E1DA] to-[#1A7FB3] bg-clip-text text-transparent">
                  Like a Pro
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-xl text-[#EAF2FF]/80 leading-relaxed max-w-lg"
            >
              Experience risk-free trading with expertly crafted cryptocurrency signals. 
              Join thousands of traders who trust Zignal for profitable decisions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/auth">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(51, 225, 218, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-[#33E1DA] to-[#1A7FB3] px-8 py-4 rounded-xl font-semibold text-lg text-[#0A0F1F] hover:shadow-2xl transition-all duration-300"
                >
                  Start Trading Now
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-[#33E1DA]/50 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#33E1DA]/10 transition-all duration-300"
              >
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="flex flex-wrap gap-8 text-sm text-[#EAF2FF]/60 pt-8"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                95% Success Rate
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#1A7FB3]" />
                25,000+ Traders
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#33E1DA] rounded-full animate-pulse" />
                120+ Countries
              </div>
            </motion.div>
          </div>

          {/* Right Column - Features & Price Tickers */}
          <div className="space-y-8" id="features">
            {/* Live Prices */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-[#0A0F1F]/20 backdrop-blur-sm border border-[#33E1DA]/20 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-[#EAF2FF] mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live Prices
              </h3>
              <div className="space-y-3">
                {cryptoPrices.map((crypto, index) => (
                  <PriceTicker
                    key={crypto.symbol}
                    {...crypto}
                    delay={0.6 + index * 0.1}
                  />
                ))}
              </div>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  {...feature}
                  delay={0.8 + index * 0.1}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Security Section */}
        <SecuritySection />

        {/* Mission & Vision */}
        <MissionVisionSection />
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{
          x: mousePosition.x * 20,
          y: mousePosition.y * 20,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-[#33E1DA]/10 to-[#1A7FB3]/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          x: mousePosition.x * -15,
          y: mousePosition.y * -15,
        }}
        transition={{ type: "spring", stiffness: 30, damping: 20 }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[#1A7FB3]/10 to-[#33E1DA]/10 rounded-full blur-3xl"
      />
    </div>
  );
}

declare module '@react-three/fiber' {
  interface ThreeElements {
    particleShaderMaterial: any;
  }
}
