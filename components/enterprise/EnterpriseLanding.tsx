"use client"

import { useState, useEffect } from 'react'
import { ArrowRight, TrendingUp, Shield, Users, Star, CheckCircle, Play, ChevronRight, Globe, Zap, Award, BarChart3, Lock, Smartphone } from 'lucide-react'
import { Button } from './Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card'
import { Badge } from './Badge'
import { Container, Grid, Stack, Flex, Section, Spacer } from './Layout'
import { useIntersectionObserver, useReducedMotion } from '@/hooks/useAnimation'
import { CryptoIcon } from '@/components/animations/CryptoIcons'

// Hero Section
const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Section size="xl" className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-primary/10">
      <div className="absolute inset-0 bg-grid-accent/10 [mask-image:linear-gradient(0deg,rgba(234,242,255,1),rgba(234,242,255,0.6))]" />
      
      <Container size="xl" className="relative">
        <Grid cols={1} className="text-center">
          <Stack spacing="xl" align="center" className="max-w-4xl mx-auto">
            {/* Announcement Badge */}
            <div className={`transition-all duration-700 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <Badge variant="brand" size="base" className="animate-pulse">
                <Zap className="w-3 h-3" />
                New: Advanced AI-Powered Signals
              </Badge>
            </div>

            {/* Main Headline */}
            <div className={`transition-all duration-700 ease-out delay-150 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <h1 className="text-display-2xl sm:text-display-3xl font-bold text-neutral-900 leading-none">
                Professional{' '}
                <span className="bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">
                  Crypto Trading
                </span>{' '}
                Signals
              </h1>
            </div>

            {/* Subtitle */}
            <div className={`transition-all duration-700 ease-out delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <p className="text-xl text-neutral-600 leading-relaxed max-w-3xl">
                Transform your trading with institutional-grade signals, real-time market analysis, 
                and risk management tools trusted by thousands of professional traders worldwide.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className={`transition-all duration-700 ease-out delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <Flex gap="base" className="flex-col sm:flex-row">
                <Button size="xl" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Start Free Trial
                </Button>
                <Button variant="ghost" size="xl" leftIcon={<Play className="w-5 h-5" />}>
                  Watch Demo
                </Button>
              </Flex>
            </div>

            {/* Social Proof */}
            <div className={`transition-all duration-700 ease-out delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <Stack spacing="sm" align="center">
                <Flex gap="sm" align="center">
                  <div className="flex -space-x-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary border-2 border-background flex items-center justify-center text-accent-foreground text-xs font-semibold">
                        {i}
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </Flex>
                <p className="text-sm text-neutral-500">
                  Trusted by <strong>25,000+</strong> traders across 120+ countries
                </p>
              </Stack>
            </div>
          </Stack>
        </Grid>
      </Container>
    </Section>
  )
}

// Features Section
const FeaturesSection = () => {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.1 })

  const features = [
    {
      icon: TrendingUp,
      title: 'Real-Time Signals',
      description: 'Get instant notifications for high-probability trading opportunities with detailed entry, exit, and stop-loss levels.',
      stats: '95% Accuracy',
      color: 'text-green-600'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Advanced position sizing, portfolio allocation, and risk assessment tools to protect your capital.',
      stats: '2% Max Risk',
      color: 'text-blue-600'
    },
    {
      icon: BarChart3,
      title: 'Market Analysis',
      description: 'Professional technical and fundamental analysis with institutional-grade research and insights.',
      stats: '24/7 Coverage',
      color: 'text-purple-600'
    },
    {
      icon: Users,
      title: 'Expert Community',
      description: 'Learn from professional traders, share strategies, and get support from our active community.',
      stats: '1,500+ Experts',
      color: 'text-orange-600'
    }
  ]

  return (
    <Section size="xl" background="none">
      <Container size="xl">
        <Stack spacing="2xl">
          {/* Section Header */}
          <div ref={ref as any} className="text-center max-w-3xl mx-auto">
            <div className={`transition-all duration-700 ease-out ${hasIntersected ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <Badge variant="outline" className="mb-4">
                Why Choose Zignal
              </Badge>
              <h2 className="text-display-lg font-bold text-neutral-900 mb-6">
                Everything you need to trade like a professional
              </h2>
              <p className="text-xl text-neutral-600 leading-relaxed">
                Our platform combines cutting-edge technology with proven trading strategies 
                to give you the edge in cryptocurrency markets.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <Grid cols={2} gap="lg">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ease-out ${
                  hasIntersected ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${(index + 1) * 150}ms` }}
              >
                <Card variant="interactive" padding="lg" className="h-full group">
                  <CardHeader>
                    <Flex align="start" gap="base">
                      <div className={`p-3 rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200 group-hover:from-brand-100 group-hover:to-brand-200 transition-all duration-300`}>
                        <feature.icon className={`w-6 h-6 ${feature.color} transition-colors duration-300`} />
                      </div>
                      <div className="flex-1">
                        <Flex justify="between" align="start">
                          <CardTitle className="group-hover:text-brand-700 transition-colors duration-300">
                            {feature.title}
                          </CardTitle>
                          <Badge variant="brand" size="sm">
                            {feature.stats}
                          </Badge>
                        </Flex>
                      </div>
                    </Flex>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  )
}

// Crypto Assets Section
const CryptoSection = () => {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.1 })
  
  const cryptoAssets = [
    'bitcoin', 'ethereum', 'solana', 'cardano', 
    'polygon', 'chainlink', 'binancecoin', 'avalanche'
  ] as const

  return (
    <Section size="xl" background="subtle">
      <Container size="xl">
        <Stack spacing="2xl">
          <div ref={ref as any} className="text-center">
            <div className={`transition-all duration-700 ease-out ${hasIntersected ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <h2 className="text-display-lg font-bold text-neutral-900 mb-6">
                Trade the top cryptocurrencies
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Get professional signals for all major cryptocurrency pairs with real-time 
                price analysis and market sentiment data.
              </p>
            </div>
          </div>

          <div className={`transition-all duration-700 ease-out delay-300 ${hasIntersected ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <Card variant="elevated" padding="xl" className="bg-enhanced-card border-accent/20">
              <Grid cols={4} gap="lg" className="items-center">
                {cryptoAssets.map((crypto, index) => (
                  <div 
                    key={crypto}
                    className={`transition-all duration-500 ease-out hover:scale-110 ${
                      hasIntersected ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                    style={{ transitionDelay: `${(index + 3) * 100}ms` }}
                  >
                    <Flex direction="col" align="center" gap="sm" className="p-4 rounded-xl hover:bg-enhanced-card transition-colors duration-300">
                      <CryptoIcon 
                        name={crypto} 
                        size={48} 
                        className="transition-transform duration-300 hover:rotate-12" 
                      />
                    </Flex>
                  </div>
                ))}
              </Grid>
            </Card>
          </div>
        </Stack>
      </Container>
    </Section>
  )
}

// Stats Section
const StatsSection = () => {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.1 })

  const stats = [
    { value: '25,000+', label: 'Active Traders', icon: Users },
    { value: '95%', label: 'Signal Accuracy', icon: TrendingUp },
    { value: '120+', label: 'Countries', icon: Globe },
    { value: '$2.5B', label: 'Trading Volume', icon: BarChart3 }
  ]

  return (
    <Section size="lg" background="elevated">
      <Container size="xl">
        <div ref={ref as any}>
          <Grid cols={4} gap="lg">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`transition-all duration-700 ease-out ${
                  hasIntersected ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <Stack spacing="sm" align="center" className="text-center">
                  <stat.icon className="w-8 h-8 text-brand-600" />
                  <div className="text-display-md font-bold text-neutral-900">
                    {stat.value}
                  </div>
                  <div className="text-neutral-600 font-medium">
                    {stat.label}
                  </div>
                </Stack>
              </div>
            ))}
          </Grid>
        </div>
      </Container>
    </Section>
  )
}

// Testimonials Section
const TestimonialsSection = () => {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.1 })

  const testimonials = [
    {
      content: "Zignal has completely transformed my trading approach. The signal accuracy is incredible and the risk management tools have saved me thousands.",
      author: "Sarah Chen",
      role: "Portfolio Manager",
      rating: 5,
      image: "SC"
    },
    {
      content: "The institutional-grade research and analysis provided by Zignal gives me the confidence to make informed trading decisions every single day.",
      author: "Marcus Rodriguez", 
      role: "Crypto Fund Manager",
      rating: 5,
      image: "MR"
    },
    {
      content: "Outstanding platform with professional-grade tools. The community aspect and educational resources are invaluable for continuous learning.",
      author: "Elena Kowalski",
      role: "Independent Trader",
      rating: 5,
      image: "EK"
    }
  ]

  return (
    <Section size="xl" background="none">
      <Container size="xl">
        <Stack spacing="2xl">
          <div ref={ref as any} className="text-center">
            <div className={`transition-all duration-700 ease-out ${hasIntersected ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <Badge variant="outline" className="mb-4">
                Customer Success Stories
              </Badge>
              <h2 className="text-display-lg font-bold text-neutral-900 mb-6">
                Trusted by professional traders worldwide
              </h2>
            </div>
          </div>

          <Grid cols={3} gap="lg">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ease-out ${
                  hasIntersected ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${(index + 1) * 200}ms` }}
              >
                <Card variant="elevated" padding="lg" className="h-full">
                  <Stack spacing="base">
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-neutral-700 leading-relaxed">
                      "{testimonial.content}"
                    </blockquote>
                    <Flex gap="base" align="center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-semibold text-sm">
                        {testimonial.image}
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900">
                          {testimonial.author}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {testimonial.role}
                        </div>
                      </div>
                    </Flex>
                  </Stack>
                </Card>
              </div>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  )
}

// CTA Section
const CTASection = () => {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.1 })

  return (
    <Section size="xl" className="bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/20" />
      <div className="absolute inset-0 bg-grid-accent/10 [mask-image:linear-gradient(0deg,rgba(234,242,255,1),rgba(234,242,255,0.6))]" />
      
      <Container size="xl" className="relative">
        <div ref={ref as any} className="text-center max-w-4xl mx-auto">
          <Stack spacing="xl" align="center">
            <div className={`transition-all duration-700 ease-out ${hasIntersected ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <h2 className="text-display-xl font-bold leading-none">
                Ready to start professional trading?
              </h2>
            </div>
            
            <div className={`transition-all duration-700 ease-out delay-200 ${hasIntersected ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <p className="text-xl text-white/90 leading-relaxed max-w-2xl">
                Join thousands of successful traders who rely on Zignal for consistent, 
                profitable cryptocurrency trading signals and market insights.
              </p>
            </div>

            <div className={`transition-all duration-700 ease-out delay-400 ${hasIntersected ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <Flex gap="base" className="flex-col sm:flex-row">
                <Button 
                  size="xl" 
                  variant="secondary" 
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Start Free 14-Day Trial
                </Button>
                <Button 
                  size="xl" 
                  variant="ghost" 
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  Schedule Demo Call
                </Button>
              </Flex>
            </div>

            <div className={`transition-all duration-700 ease-out delay-600 ${hasIntersected ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <Flex gap="xl" className="text-sm text-white/70">
                <Flex gap="xs" align="center">
                  <CheckCircle className="w-4 h-4" />
                  No credit card required
                </Flex>
                <Flex gap="xs" align="center">
                  <CheckCircle className="w-4 h-4" />
                  Cancel anytime
                </Flex>
                <Flex gap="xs" align="center">
                  <CheckCircle className="w-4 h-4" />
                  24/7 support
                </Flex>
              </Flex>
            </div>
          </Stack>
        </div>
      </Container>
    </Section>
  )
}

// Main Landing Page Component
export function EnterpriseLanding() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <CryptoSection />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  )
}