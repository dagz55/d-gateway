"use client"

import { useState, useEffect } from 'react'
import { ChevronDown, TrendingUp, Shield, Users, Star, ArrowRight } from 'lucide-react'
import { 
  FadeInStagger, 
  Typewriter, 
  SlideIn, 
  ScaleIn, 
  TextReveal, 
  LetterReveal,
  MorphingText,
  GradientText
} from '@/components/animations/TextAnimations'
import { 
  CryptoIcon, 
  FloatingCryptoIcons, 
  CryptoGrid, 
  CryptoOrbit 
} from '@/components/animations/CryptoIcons'
import { 
  ParallaxElement, 
  ParallaxBackground, 
  ParallaxSection,
  InteractiveParallax
} from '@/components/animations/Parallax'
import { useReducedMotion, useDeviceCapabilities, useIntersectionObserver } from '@/hooks/useAnimation'

interface LandingSection {
  id: string
  title: string
  subtitle?: string
  content: string | string[]
  type: 'hero' | 'features' | 'security' | 'mission' | 'crypto' | 'testimonials' | 'cta'
  background?: 'gradient' | 'crypto' | 'parallax' | 'interactive'
}

const landingSections: LandingSection[] = [
  {
    id: 'hero',
    type: 'hero',
    title: 'Transform Your Crypto Trading',
    subtitle: 'Professional signals made simple',
    content: 'Experience risk-free trading with our expertly crafted cryptocurrency signals. Join thousands of traders who trust Zignal for profitable decisions.',
    background: 'interactive'
  },
  {
    id: 'features',
    type: 'features',
    title: 'Why Choose Zignal',
    content: [
      'Real-time market analysis and signals',
      'Expert guidance from professional traders',
      'Risk management tools and strategies',
      'Community-driven learning platform'
    ],
    background: 'crypto'
  },
  {
    id: 'security',
    type: 'security',
    title: 'Your Security is Our Priority',
    content: [
      'All payments processed through secure gateways',
      'Personal details encrypted and never shared',
      'Multi-layer security with optional 2FA',
      'Regular monitoring to protect from scams',
      'Transparent results with no hidden tricks'
    ],
    background: 'gradient'
  },
  {
    id: 'crypto',
    type: 'crypto',
    title: 'Trade the Top Cryptocurrencies',
    subtitle: 'Get signals for all major crypto assets',
    content: 'From Bitcoin to emerging altcoins, our signals cover the entire cryptocurrency market with precision and reliability.',
    background: 'parallax'
  },
  {
    id: 'mission',
    type: 'mission',
    title: 'Our Mission & Vision',
    content: 'To guide every trader with clear and reliable cryptocurrency trading signals, making trading easier, profitable, and more accessible while building a supportive community that grows together.',
    background: 'gradient'
  },
  {
    id: 'cta',
    type: 'cta',
    title: 'Ready to Start Trading?',
    subtitle: 'Join Zignal today',
    content: 'Get instant access to professional trading signals and transform your crypto portfolio.',
    background: 'interactive'
  }
]

const features = [
  {
    icon: TrendingUp,
    title: 'Real-time Signals',
    description: 'Get instant notifications for profitable trading opportunities',
    color: '#33E1DA'
  },
  {
    icon: Shield,
    title: 'Risk Management',
    description: 'Built-in stop-loss and take-profit recommendations',
    color: '#1A7FB3'
  },
  {
    icon: Users,
    title: 'Expert Community',
    description: 'Learn from professional traders and experienced members',
    color: '#9945FF'
  },
  {
    icon: Star,
    title: 'Proven Results',
    description: 'Track record of successful signals and satisfied traders',
    color: '#F7931A'
  }
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Crypto Trader',
    content: 'Zignal has transformed my trading. The signals are incredibly accurate and the community is supportive.',
    rating: 5
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Investment Analyst',
    content: 'Professional-grade signals with excellent risk management. Highly recommended for serious traders.',
    rating: 5
  },
  {
    name: 'Elena Kowalski',
    role: 'Portfolio Manager',
    content: 'The best crypto signals platform I have used. Clear, timely, and profitable recommendations.',
    rating: 5
  }
]

function HeroSection() {
  const { isHighPerformance } = useDeviceCapabilities()
  const prefersReducedMotion = useReducedMotion()
  
  const morphingTexts = [
    'Professional Trading Signals',
    'Expert Market Analysis', 
    'Profitable Crypto Strategies',
    'Risk-Free Trading Solutions'
  ]

  return (
    <ParallaxSection 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      background={isHighPerformance ? undefined : '/crypto_image.jpg'}
    >
      {/* Floating crypto icons background */}
      <FloatingCryptoIcons 
        className="opacity-20" 
        count={prefersReducedMotion ? 8 : 25}
      />
      
      {/* Animated background patterns */}
      {isHighPerformance && !prefersReducedMotion && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F1F] via-[#1E2A44] to-[#1A7FB3]" />
          <ParallaxElement speed={0.2} className="absolute inset-0">
            <div className="w-full h-full opacity-30 bg-[radial-gradient(circle_at_20%_80%,rgba(51,225,218,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(26,127,179,0.1)_0%,transparent_50%)]" />
          </ParallaxElement>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Hero title with staggered animation */}
        <FadeInStagger 
          className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          delay={100}
          duration={800}
        >
          Transform Your Crypto Trading
        </FadeInStagger>

        {/* Morphing subtitle */}
        <div className="h-16 mb-8">
          <MorphingText
            texts={morphingTexts}
            className="text-2xl lg:text-3xl font-medium"
            interval={3000}
          />
        </div>

        {/* Description with typewriter effect */}
        <div className="mb-12">
          <Typewriter
            text="Experience risk-free trading with expertly crafted cryptocurrency signals. Join thousands who trust Zignal for profitable decisions."
            speed={30}
            className="text-xl lg:text-2xl text-white/95 max-w-4xl mx-auto"
            showCursor={false}
          />
        </div>

        {/* CTA buttons */}
        <SlideIn direction="up" delay={2000} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="group relative px-8 py-4 bg-gradient-to-r from-[#33E1DA] to-[#1A7FB3] text-[#0A0F1F] font-semibold text-lg rounded-xl hover:scale-105 transition-all duration-300 overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">
              Start Trading Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A7FB3] to-[#33E1DA] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          
          <button className="px-8 py-4 border-2 border-[#33E1DA] text-[#33E1DA] font-semibold text-lg rounded-xl hover:bg-[#33E1DA] hover:text-[#0A0F1F] transition-all duration-300">
            View Demo
          </button>
        </SlideIn>

        {/* Scroll indicator */}
        <SlideIn direction="up" delay={3000} className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center text-[#EAF2FF]/60">
            <span className="text-sm mb-2">Scroll to explore</span>
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </div>
        </SlideIn>
      </div>
    </ParallaxSection>
  )
}

function FeaturesSection() {
  return (
    <ParallaxBackground className="py-24 bg-[#0A0F1F]" layers={3}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <TextReveal className="text-4xl lg:text-5xl font-bold text-[#EAF2FF] mb-4">
            Why Choose Zignal
          </TextReveal>
          <LetterReveal 
            text="Professional tools for professional results"
            className="text-xl text-[#EAF2FF]/70"
          />
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <ScaleIn key={index} delay={index * 200} duration={600}>
              <InteractiveParallax className="glass p-6 rounded-xl text-center hover:glass-hover transition-all duration-300">
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon 
                    className="w-8 h-8" 
                    style={{ color: feature.color }}
                  />
                </div>
                <h3 className="text-xl font-semibold text-[#EAF2FF] mb-2">{feature.title}</h3>
                <p className="text-[#EAF2FF]/70">{feature.description}</p>
              </InteractiveParallax>
            </ScaleIn>
          ))}
        </div>
      </div>
    </ParallaxBackground>
  )
}

function CryptoSection() {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.2 })

  return (
    <div ref={ref as any} className="py-24 bg-gradient-to-br from-[#1E2A44] to-[#0A0F1F] relative overflow-hidden">
      <ParallaxElement speed={0.3} className="absolute inset-0">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(33,225,218,0.1)_0%,transparent_70%)]" />
      </ParallaxElement>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <GradientText className="text-4xl lg:text-5xl font-bold mb-4 block">
            Trade the Top Cryptocurrencies
          </GradientText>
          <SlideIn direction="up" delay={300}>
            <p className="text-xl text-[#EAF2FF]/80">
              Get signals for all major crypto assets with precision and reliability
            </p>
          </SlideIn>
        </div>

        {/* Crypto orbit display */}
        <div className="flex justify-center mb-16">
          <CryptoOrbit
            centerSize={120}
            orbitSize={300}
            iconSize={48}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#33E1DA] to-[#1A7FB3] flex items-center justify-center">
              <span className="text-2xl font-bold text-[#0A0F1F]">ZIGNAL</span>
            </div>
          </CryptoOrbit>
        </div>

        {/* Crypto grid */}
        <CryptoGrid
          className="max-w-4xl mx-auto"
          showNames={true}
          iconSize={56}
          cols={5}
        />
      </div>
    </div>
  )
}

function SecuritySection() {
  const securityPoints = [
    'Secure payment gateways',
    'Encrypted personal data',
    'Multi-layer security with 2FA',
    'Regular monitoring and moderation',
    'Transparent, honest results'
  ]

  return (
    <ParallaxSection className="py-24 bg-[#0A0F1F]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <TextReveal className="text-4xl lg:text-5xl font-bold text-[#33E1DA] mb-8">
          Your Security is Our Priority
        </TextReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {securityPoints.map((point, index) => (
            <SlideIn 
              key={index}
              direction="up"
              delay={index * 150}
              className="glass p-6 rounded-xl hover:glass-hover transition-all duration-300"
            >
              <div className="flex items-center mb-3">
                <Shield className="w-6 h-6 text-[#33E1DA] mr-3" />
                <span className="text-[#EAF2FF] font-medium">{point}</span>
              </div>
            </SlideIn>
          ))}
        </div>
      </div>
    </ParallaxSection>
  )
}

function TestimonialsSection() {
  return (
    <ParallaxBackground className="py-24 bg-gradient-to-br from-[#1A7FB3] to-[#0A0F1F]" layers={2}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <FadeInStagger className="text-4xl lg:text-5xl font-bold text-[#EAF2FF] mb-4">
            What Our Traders Say
          </FadeInStagger>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <ScaleIn key={index} delay={index * 200} scale={0.9}>
              <div className="glass p-6 rounded-xl hover:glass-hover transition-all duration-300">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#F7931A] fill-current" />
                  ))}
                </div>
                <p className="text-[#EAF2FF]/90 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-[#EAF2FF]">{testimonial.name}</div>
                  <div className="text-[#EAF2FF]/70 text-sm">{testimonial.role}</div>
                </div>
              </div>
            </ScaleIn>
          ))}
        </div>
      </div>
    </ParallaxBackground>
  )
}

function CTASection() {
  return (
    <ParallaxSection className="py-24 bg-gradient-to-br from-[#33E1DA] to-[#1A7FB3] text-[#0A0F1F]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <TextReveal className="text-4xl lg:text-6xl font-bold mb-6">
          Ready to Start Trading?
        </TextReveal>
        
        <Typewriter
          text="Join thousands of successful traders who trust Zignal for profitable crypto signals."
          className="text-xl lg:text-2xl mb-12 opacity-80"
          speed={25}
        />

        <SlideIn direction="up" delay={2000}>
          <button className="group relative px-12 py-6 bg-[#0A0F1F] text-[#EAF2FF] font-bold text-xl rounded-xl hover:scale-105 transition-all duration-300 overflow-hidden">
            <span className="relative z-10 flex items-center gap-3">
              Get Started Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A7FB3] to-[#33E1DA] opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </button>
        </SlideIn>
      </div>
    </ParallaxSection>
  )
}

export function SophisticatedLanding() {
  const [activeSection, setActiveSection] = useState(0)
  const prefersReducedMotion = useReducedMotion()
  const { isHighPerformance } = useDeviceCapabilities()

  // Auto-advance sections (optional)
  useEffect(() => {
    if (prefersReducedMotion) return

    const interval = setInterval(() => {
      setActiveSection((prev) => (prev + 1) % landingSections.length)
    }, 15000) // 15 seconds per section

    return () => clearInterval(interval)
  }, [prefersReducedMotion])

  return (
    <div className="relative min-h-screen bg-[#0A0F1F] overflow-x-hidden">
      {/* Performance indicator */}
      {!isHighPerformance && (
        <div className="fixed top-4 right-4 z-50 text-xs text-[#EAF2FF]/60 bg-[#1E2A44]/80 px-3 py-1 rounded">
          Optimized mode
        </div>
      )}

      {/* Landing sections */}
      <HeroSection />
      <FeaturesSection />
      <CryptoSection />
      <SecuritySection />
      <TestimonialsSection />
      <CTASection />

      {/* Global floating elements */}
      {!prefersReducedMotion && isHighPerformance && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <ParallaxElement speed={0.1}>
            <div className="absolute top-20 right-20 w-2 h-2 bg-[#33E1DA] rounded-full animate-pulse" />
          </ParallaxElement>
          <ParallaxElement speed={0.15}>
            <div className="absolute bottom-32 left-32 w-1 h-1 bg-[#1A7FB3] rounded-full animate-pulse" />
          </ParallaxElement>
        </div>
      )}
    </div>
  )
}