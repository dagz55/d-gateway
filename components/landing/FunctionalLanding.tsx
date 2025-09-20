"use client"

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Shield, Target, Eye, Star, ArrowRight, CheckCircle, TrendingUp, Users, Globe, BarChart3, Play } from 'lucide-react'
import { Button } from '@/components/enterprise/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/enterprise/Card'
import { Badge } from '@/components/enterprise/Badge'
import { Container, Grid, Stack, Flex, Section, Spacer } from '@/components/enterprise/Layout'
import { CryptoIcon } from '@/components/animations/CryptoIcons'
import { EnhancedHeroSection } from './EnhancedHeroSection'
import { CombinedBackgroundAnimations } from '@/components/animations/BackgroundAnimations'
import { LANDING_STRINGS } from '@/lib/constants/landing-strings'

// Enhanced Hero Section - now using the new component
const HeroSection = () => {
  return <EnhancedHeroSection />
}

// Security Section
const SecuritySection = () => {
  const securityFeatures = LANDING_STRINGS.SECURITY.FEATURES.map(feature => ({
    ...feature,
    icon: Shield
  }))

  return (
    <Section size="xl" className="bg-[#0A0F1F] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#33E1DA]/5 via-transparent to-[#1A7FB3]/5" />
      <div className="absolute inset-0 bg-grid-[#33E1DA]/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.8))]" />

      <Container size="xl" className="relative z-10">
        <Stack spacing="2xl">
          {/* Section Header */}
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-4 border-[#33E1DA]/30 text-[#33E1DA] bg-[#33E1DA]/10">
              <Shield className="w-3 h-3" />
              Security First
            </Badge>
            <h2 className="text-display-lg font-bold text-[#EAF2FF] mb-4">
              Your Security is Our Priority
            </h2>
            <p className="text-xl text-tertiary max-w-3xl mx-auto">
              SITE SECURITY - HOW WE MAKE SURE YOUR FUNDS AND INFORMATION ARE SAFE WITH US
            </p>
          </div>

          {/* Security Features */}
          <Grid cols={1} gap="lg" className="max-w-5xl mx-auto">
            {securityFeatures.map((feature, index) => (
              <Card
                key={index}
                variant="interactive"
                padding="xl"
                className="bg-gradient-to-br from-[#1E2A44]/90 to-[#0A0F1F]/80 border border-[#33E1DA]/30 group transition-all duration-500 hover:shadow-2xl hover:shadow-[#33E1DA]/20 hover:-translate-y-2 hover:border-[#33E1DA]/50"
              >
                <Flex gap="lg" align="start">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#33E1DA]/30 to-[#1A7FB3]/30 rounded-xl flex items-center justify-center group-hover:from-[#33E1DA]/50 group-hover:to-[#1A7FB3]/50 transition-all duration-300 group-hover:scale-110">
                    <feature.icon className="w-8 h-8 text-[#33E1DA]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-[#EAF2FF] mb-3 group-hover:text-[#33E1DA] transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-tertiary leading-relaxed text-lg">
                      {feature.description}
                    </p>
                  </div>
                </Flex>
              </Card>
            ))}
          </Grid>

          {/* Trust Indicators */}
          <div className="text-center pt-8">
            <Flex gap="xl" justify="center" className="text-sm text-[#EAF2FF]/60">
              <Flex gap="xs" align="center">
                <CheckCircle className="w-5 h-5 text-[#33E1DA]" />
                <span className="font-medium">Bank-Level Security</span>
              </Flex>
              <Flex gap="xs" align="center">
                <Shield className="w-5 h-5 text-[#1A7FB3]" />
                <span className="font-medium">GDPR Compliant</span>
              </Flex>
              <Flex gap="xs" align="center">
                <CheckCircle className="w-5 h-5 text-[#33E1DA]" />
                <span className="font-medium">SSL Encrypted</span>
              </Flex>
            </Flex>
          </div>
        </Stack>
      </Container>
    </Section>
  )
}

// Mission Section
const MissionSection = () => {
  return (
    <Section size="xl" className="bg-gradient-to-br from-[#1A7FB3] via-[#33E1DA] to-[#1A7FB3] text-[#0A0F1F] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F1F]/30 via-transparent to-[#0A0F1F]/30" />
      <div className="absolute inset-0 bg-grid-[#0A0F1F]/15 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.7))]" />

      <Container size="xl" className="relative z-10">
        <Stack spacing="2xl" align="center" className="text-center max-w-5xl mx-auto">
          <Badge variant="outline" className="text-[#0A0F1F] border-[#0A0F1F]/40 bg-[#0A0F1F]/20 backdrop-blur-sm">
            <Target className="w-4 h-4" />
            Our Mission
          </Badge>

          <h2 className="text-display-xl font-bold mb-8 leading-tight">
            Mission
          </h2>

          <Card variant="elevated" padding="xl" className="w-full bg-[#0A0F1F]/60 backdrop-blur-md border border-[#EAF2FF]/20 shadow-2xl">
            <blockquote className="text-2xl leading-relaxed text-[#EAF2FF] font-medium italic">
              "To guide every trader with clear and reliable cryptocurrency trading signals in order to make trading easier, straight to the point, and more profitable while building a supportive community that grows together"
            </blockquote>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 w-full max-w-4xl">
            <Card variant="interactive" padding="lg" className="bg-[#0A0F1F]/40 backdrop-blur-sm border border-[#EAF2FF]/20 hover:bg-[#0A0F1F]/60 hover:border-[#EAF2FF]/30 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#33E1DA]/30 to-[#1A7FB3]/30 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-[#EAF2FF]" />
                </div>
                <h3 className="text-lg font-semibold text-[#EAF2FF] mb-2">Clear Signals</h3>
                <p className="text-sm text-[#EAF2FF]/80">Precise, actionable trading signals</p>
              </div>
            </Card>

            <Card variant="interactive" padding="lg" className="bg-[#0A0F1F]/40 backdrop-blur-sm border border-[#EAF2FF]/20 hover:bg-[#0A0F1F]/60 hover:border-[#EAF2FF]/30 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#33E1DA]/30 to-[#1A7FB3]/30 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-[#EAF2FF]" />
                </div>
                <h3 className="text-lg font-semibold text-[#EAF2FF] mb-2">Community</h3>
                <p className="text-sm text-[#EAF2FF]/80">Supportive trading community</p>
              </div>
            </Card>

            <Card variant="interactive" padding="lg" className="bg-[#0A0F1F]/40 backdrop-blur-sm border border-[#EAF2FF]/20 hover:bg-[#0A0F1F]/60 hover:border-[#EAF2FF]/30 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#33E1DA]/30 to-[#1A7FB3]/30 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-[#EAF2FF]" />
                </div>
                <h3 className="text-lg font-semibold text-[#EAF2FF] mb-2">Profitable</h3>
                <p className="text-sm text-[#EAF2FF]/80">Consistent profitable results</p>
              </div>
            </Card>
          </div>

          {/* Mission Stats - TODO: Replace with real metrics from API */}
          <div className="pt-8 border-t border-[#EAF2FF]/20 w-full max-w-2xl">
            <Flex gap="xl" justify="center" className="text-sm text-[#EAF2FF]/80">
              <Flex gap="xs" align="center">
                <CheckCircle className="w-5 h-5 text-[#EAF2FF]" />
                <span className="font-medium">High Success Rate</span>
              </Flex>
              <Flex gap="xs" align="center">
                <Users className="w-5 h-5 text-[#EAF2FF]" />
                <span className="font-medium">Active Traders</span>
              </Flex>
              <Flex gap="xs" align="center">
                <Globe className="w-5 h-5 text-[#EAF2FF]" />
                <span className="font-medium">Global Community</span>
              </Flex>
            </Flex>
          </div>
        </Stack>
      </Container>
    </Section>
  )
}

// Vision Section
const VisionSection = () => {
  return (
    <Section size="xl" className="bg-[#0A0F1F] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#33E1DA]/5 via-transparent to-[#1A7FB3]/5" />
      <div className="absolute inset-0 bg-grid-[#33E1DA]/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.8))]" />

      <Container size="xl" className="relative z-10">
        <Stack spacing="2xl" align="center" className="text-center max-w-5xl mx-auto">
          <Badge variant="info" className="bg-[#33E1DA] text-[#0A0F1F] border-0">
            <Eye className="w-4 h-4" />
            Our Vision
          </Badge>

          <h2 className="text-display-xl font-bold text-[#EAF2FF] mb-8 leading-tight">
            Vision
          </h2>

          <Card variant="elevated" padding="xl" className="w-full bg-gradient-to-br from-[#1E2A44]/90 to-[#0A0F1F]/80 border border-[#33E1DA]/30 shadow-2xl shadow-[#33E1DA]/10">
            <blockquote className="text-2xl leading-relaxed text-[#EAF2FF] font-medium italic">
              "To be the go-to crypto signals hub for everyone. We are data-driven, trustworthy, and innovative in the cryptocurrency space. We do this by paving the way for financial freedom for Zignal members"
            </blockquote>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 w-full max-w-4xl">
            <Card variant="interactive" padding="xl" className="text-center bg-gradient-to-br from-[#1E2A44]/90 to-[#0A0F1F]/80 border border-[#33E1DA]/30 hover:shadow-2xl hover:shadow-[#33E1DA]/20 hover:border-[#33E1DA]/50 transition-all duration-500 hover:scale-105">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#1A7FB3]/30 to-[#33E1DA]/30 rounded-full flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-[#1A7FB3]" />
              </div>
              <h4 className="text-xl font-semibold text-[#EAF2FF] mb-3">Data-Driven</h4>
              <p className="text-[#EAF2FF]/80 leading-relaxed">Analytics-based decisions for optimal trading strategies</p>
            </Card>

            <Card variant="interactive" padding="xl" className="text-center bg-gradient-to-br from-[#1E2A44]/90 to-[#0A0F1F]/80 border border-[#33E1DA]/30 hover:shadow-2xl hover:shadow-[#33E1DA]/20 hover:border-[#33E1DA]/50 transition-all duration-500 hover:scale-105">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#33E1DA]/30 to-[#1A7FB3]/30 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-[#33E1DA]" />
              </div>
              <h4 className="text-xl font-semibold text-[#EAF2FF] mb-3">Trustworthy</h4>
              <p className="text-[#EAF2FF]/80 leading-relaxed">Transparent and honest platform you can rely on</p>
            </Card>

            <Card variant="interactive" padding="xl" className="text-center bg-gradient-to-br from-[#1E2A44]/90 to-[#0A0F1F]/80 border border-[#33E1DA]/30 hover:shadow-2xl hover:shadow-[#33E1DA]/20 hover:border-[#33E1DA]/50 transition-all duration-500 hover:scale-105">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#33E1DA]/30 to-[#1A7FB3]/30 rounded-full flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-[#33E1DA]" />
              </div>
              <h4 className="text-xl font-semibold text-[#EAF2FF] mb-3">Innovative</h4>
              <p className="text-[#EAF2FF]/80 leading-relaxed">Cutting-edge technology for modern trading</p>
            </Card>
          </div>

          {/* Vision Stats */}
          <div className="pt-12 border-t border-[#33E1DA]/20 w-full max-w-3xl">
            <Flex gap="xl" justify="center" className="text-sm text-[#EAF2FF]/60 flex-wrap">
              <Flex gap="xs" align="center">
                <BarChart3 className="w-5 h-5 text-[#33E1DA]" />
                <span className="font-medium">Real-time Analytics</span>
              </Flex>
              <Flex gap="xs" align="center">
                <Shield className="w-5 h-5 text-[#1A7FB3]" />
                <span className="font-medium">Bank-Level Security</span>
              </Flex>
              <Flex gap="xs" align="center">
                <TrendingUp className="w-5 h-5 text-[#33E1DA]" />
                <span className="font-medium">AI-Powered Insights</span>
              </Flex>
              <Flex gap="xs" align="center">
                <Users className="w-5 h-5 text-[#1A7FB3]" />
                <span className="font-medium">Global Community</span>
              </Flex>
            </Flex>
          </div>
        </Stack>
      </Container>
    </Section>
  )
}

// Crypto Assets Section
const CryptoSection = () => {
  const cryptoAssets = [
    'bitcoin', 'ethereum', 'solana', 'cardano',
    'polygon', 'chainlink', 'binancecoin', 'avalanche'
  ] as const

  return (
    <Section size="xl" className="bg-gradient-to-br from-[#1E2A44] to-[#0A0F1F] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#33E1DA]/10 via-transparent to-[#1A7FB3]/10" />
      <div className="absolute inset-0 bg-grid-[#33E1DA]/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.8))]" />

      <Container size="xl" className="relative z-10">
        <Stack spacing="2xl">
          <div className="text-center">
            <Badge variant="brand" className="mb-6 bg-[#33E1DA] text-[#0A0F1F] border-0">
              <Globe className="w-4 h-4" />
              Supported Assets
            </Badge>
            <h2 className="text-display-xl font-bold text-[#EAF2FF] mb-8 leading-tight">
              Trade Top Cryptocurrencies
            </h2>
            <p className="text-xl text-[#EAF2FF]/80 max-w-4xl mx-auto leading-relaxed">
              Get professional signals for all major cryptocurrency pairs with real-time
              price analysis and market sentiment data. Our expert analysis covers the most
              traded digital assets in the market.
            </p>
          </div>

          <Card variant="elevated" padding="xl" className="bg-gradient-to-br from-[#1E2A44]/90 to-[#0A0F1F]/80 border border-[#33E1DA]/30 shadow-2xl shadow-[#33E1DA]/10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-[#EAF2FF] mb-2">Major Cryptocurrency Pairs</h3>
              <p className="text-[#EAF2FF]/70">Real-time signals and analysis for these leading assets</p>
            </div>

            <Grid cols={4} gap="xl" className="items-center">
              {cryptoAssets.map((crypto, index) => (
                <div key={crypto} className="group text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-[#33E1DA]/20 to-[#1A7FB3]/20 rounded-2xl flex items-center justify-center group-hover:from-[#33E1DA]/40 group-hover:to-[#1A7FB3]/40 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <CryptoIcon
                      name={crypto}
                      size={48}
                      showName={true}
                    />
                  </div>
                  <div className="text-sm text-[#EAF2FF]/60 group-hover:text-[#33E1DA] transition-colors duration-300">
                    Professional Signals
                  </div>
                </div>
              ))}
            </Grid>

            {/* Additional Info */}
            <div className="mt-12 pt-8 border-t border-[#33E1DA]/20">
              <Flex gap="xl" justify="center" className="text-sm text-[#EAF2FF]/60 flex-wrap">
                <Flex gap="xs" align="center">
                  <TrendingUp className="w-4 h-4 text-[#33E1DA]" />
                  <span className="font-medium">Real-time Analysis</span>
                </Flex>
                <Flex gap="xs" align="center">
                  <BarChart3 className="w-4 h-4 text-[#1A7FB3]" />
                  <span className="font-medium">Market Sentiment</span>
                </Flex>
                <Flex gap="xs" align="center">
                  <CheckCircle className="w-4 h-4 text-[#33E1DA]" />
                  <span className="font-medium">Risk Management</span>
                </Flex>
                <Flex gap="xs" align="center">
                  <Users className="w-4 h-4 text-[#1A7FB3]" />
                  <span className="font-medium">Expert Community</span>
                </Flex>
              </Flex>
            </div>
          </Card>
        </Stack>
      </Container>
    </Section>
  )
}

// Testimonials Section - TODO: Replace with real testimonials from API
const TestimonialsSection = () => {
  // TODO: Fetch real testimonials from API/database
  // For now, showing placeholder structure

  return (
    <Section size="xl" className="bg-[#0A0F1F] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#33E1DA]/5 via-transparent to-[#1A7FB3]/5" />
      <div className="absolute inset-0 bg-grid-[#33E1DA]/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.8))]" />

      <Container size="xl" className="relative z-10">
        <Stack spacing="2xl">
          <div className="text-center">
            <Badge variant="outline" className="mb-6 border-[#33E1DA]/30 text-[#33E1DA] bg-[#33E1DA]/10">
              <Star className="w-4 h-4" />
              Testimonials
            </Badge>
            <h2 className="text-display-xl font-bold text-[#EAF2FF] mb-8 leading-tight">
              What Our Traders Say
            </h2>
            <p className="text-xl text-[#EAF2FF]/70 max-w-3xl mx-auto">
              Join successful traders who trust <img src="/zignal-logo.png" alt="Zignal" className="inline h-6 w-auto" /> for their cryptocurrency trading decisions
            </p>
          </div>

          {/* Placeholder for testimonials - TODO: Replace with real testimonials */}
          <Card variant="elevated" padding="xl" className="bg-gradient-to-br from-[#1E2A44]/90 to-[#0A0F1F]/80 border border-[#33E1DA]/30">
            <div className="text-center text-[#EAF2FF]/70">
              <Users className="w-16 h-16 mx-auto mb-4 text-[#33E1DA]" />
              <h3 className="text-xl font-semibold text-[#EAF2FF] mb-2">Real Testimonials Coming Soon</h3>
              <p>We're gathering verified testimonials from our community members</p>
            </div>
          </Card>

          {/* Trust Indicators - TODO: Replace with real metrics */}
          <div className="text-center pt-8">
            <Flex gap="xl" justify="center" className="text-sm text-[#EAF2FF]/60 flex-wrap">
              <Flex gap="xs" align="center">
                <CheckCircle className="w-5 h-5 text-[#33E1DA]" />
                <span className="font-medium">Verified Reviews</span>
              </Flex>
              <Flex gap="xs" align="center">
                <Users className="w-5 h-5 text-[#1A7FB3]" />
                <span className="font-medium">Growing Community</span>
              </Flex>
              <Flex gap="xs" align="center">
                <Star className="w-5 h-5 text-[#F7931A]" />
                <span className="font-medium">Rated Platform</span>
              </Flex>
            </Flex>
          </div>
        </Stack>
      </Container>
    </Section>
  )
}

// CTA Section
const CTASection = () => {
  return (
    <Section size="xl" className="bg-gradient-to-br from-[#33E1DA] via-[#1A7FB3] to-[#33E1DA] text-[#0A0F1F] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F1F]/30 via-transparent to-[#0A0F1F]/30" />
      <div className="absolute inset-0 bg-grid-[#0A0F1F]/15 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.7))]" />

      <Container size="xl" className="relative z-10">
        <Stack spacing="2xl" align="center" className="text-center max-w-5xl mx-auto">
          <Badge variant="outline" className="text-[#0A0F1F] border-[#0A0F1F]/40 bg-[#0A0F1F]/20 backdrop-blur-sm">
            <TrendingUp className="w-4 h-4" />
            Get Started Today
          </Badge>

          <h2 className="text-display-2xl font-bold leading-tight">
            Ready to Start Professional Trading?
          </h2>

          <p className="text-xl text-[#0A0F1F]/90 leading-relaxed max-w-3xl">
            Join thousands of successful traders who rely on Zignal for consistent,
            profitable cryptocurrency trading signals and market insights.
          </p>

          <Card variant="elevated" padding="xl" className="w-full bg-[#0A0F1F]/60 backdrop-blur-md border border-[#EAF2FF]/20 shadow-2xl">
            <Flex gap="lg" className="flex-col sm:flex-row justify-center items-center">
              <Button
                size="xl"
                variant="secondary"
                rightIcon={<ArrowRight className="w-6 h-6" />}
                className="bg-[#33E1DA] text-[#0A0F1F] hover:bg-[#1A7FB3] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Start Free Trial
              </Button>
              <Button
                size="xl"
                variant="ghost"
                leftIcon={<Play className="w-6 h-6" />}
                className="text-[#EAF2FF] border-[#EAF2FF]/30 hover:bg-[#EAF2FF]/10 backdrop-blur-sm hover:scale-105 transition-all duration-300"
              >
                Watch Demo Video
              </Button>
            </Flex>

            <div className="mt-8 pt-8 border-t border-[#EAF2FF]/20">
              <Flex gap="xl" justify="center" className="text-sm text-[#EAF2FF]/80 flex-wrap">
                <Flex gap="xs" align="center">
                  <CheckCircle className="w-5 h-5 text-[#EAF2FF]" />
                  <span className="font-medium">No credit card required</span>
                </Flex>
                <Flex gap="xs" align="center">
                  <CheckCircle className="w-5 h-5 text-[#EAF2FF]" />
                  <span className="font-medium">14-day free trial</span>
                </Flex>
                <Flex gap="xs" align="center">
                  <CheckCircle className="w-5 h-5 text-[#EAF2FF]" />
                  <span className="font-medium">Cancel anytime</span>
                </Flex>
                <Flex gap="xs" align="center">
                  <CheckCircle className="w-5 h-5 text-[#EAF2FF]" />
                  <span className="font-medium">24/7 support</span>
                </Flex>
              </Flex>
            </div>
          </Card>

          {/* Final Trust Indicators - TODO: Replace with real metrics */}
          <div className="pt-8 border-t border-[#EAF2FF]/20 w-full max-w-3xl">
            <Flex gap="xl" justify="center" className="text-sm text-[#EAF2FF]/70 flex-wrap">
              <Flex gap="xs" align="center">
                <Shield className="w-5 h-5 text-[#EAF2FF]" />
                <span className="font-medium">Bank-Level Security</span>
              </Flex>
              <Flex gap="xs" align="center">
                <Users className="w-5 h-5 text-[#EAF2FF]" />
                <span className="font-medium">Active Traders</span>
              </Flex>
              <Flex gap="xs" align="center">
                <Globe className="w-5 h-5 text-[#EAF2FF]" />
                <span className="font-medium">Global Community</span>
              </Flex>
              <Flex gap="xs" align="center">
                <Star className="w-5 h-5 text-[#EAF2FF]" />
                <span className="font-medium">Professional Platform</span>
              </Flex>
            </Flex>
          </div>
        </Stack>
      </Container>
    </Section>
  )
}

// Main Landing Page Component
export function FunctionalLanding() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#0A0F1F] via-[#1E2A44] to-[#0A0F1F] overflow-hidden">
      {/* Background Animations */}
      <CombinedBackgroundAnimations />
      
      {/* Content */}
      <div className="relative z-10">
        <HeroSection />
        <SecuritySection />
        <CryptoSection />
        <MissionSection />
        <VisionSection />
        <TestimonialsSection />
        <CTASection />
      </div>
    </main>
  )
}
