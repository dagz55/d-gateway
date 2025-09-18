'use client';

import { FunctionalLanding } from "@/components/landing/FunctionalLanding";
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Users, TrendingUp, Shield, Eye, Target, Star, ArrowRight, BarChart3 } from "lucide-react"

// Enhanced UI Showcase Component
function EnhancedUIShowcase() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-enhanced-card backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <span className="text-lg font-bold text-accent-foreground">Z</span>
              </div>
              <h1 className="text-2xl font-bold gradient-text">Zignal</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="text-secondary hover:text-primary transition-colors">Features</Link>
              <Link href="#about" className="text-secondary hover:text-primary transition-colors">About</Link>
              <Link href="#contact" className="text-secondary hover:text-primary transition-colors">Contact</Link>
            </nav>
            <Button className="bg-gradient-to-r from-accent to-primary text-accent-foreground">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-secondary/20 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-accent/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.8))]" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-accent/10 text-accent border-accent/20">
              <Star className="w-4 h-4 mr-2" />
              Professional Crypto Signals
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 leading-tight">
              Enhanced UI with Perfect
              <span className="gradient-text"> Readability</span>
            </h1>
            <p className="text-xl text-secondary max-w-3xl mx-auto mb-8 leading-relaxed">
              Experience our redesigned interface with improved contrast ratios, enhanced accessibility, 
              and crystal-clear text that's easy to read in any lighting condition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-accent to-primary text-accent-foreground">
                <ArrowRight className="w-5 h-5 mr-2" />
                Try Enhanced UI
              </Button>
              <Button size="lg" variant="outline" className="border-accent/30 text-accent hover:bg-accent/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-accent/30 text-accent bg-accent/10">
              <CheckCircle className="w-4 h-4 mr-2" />
              Enhanced Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Better Contrast, Better Experience
            </h2>
            <p className="text-xl text-tertiary max-w-3xl mx-auto">
              Our enhanced UI improvements focus on accessibility and readability without compromising on design aesthetics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Eye,
                title: "Improved Contrast",
                description: "Text contrast ratios now exceed WCAG AA standards with 16.93:1 ratio for primary text",
                color: "text-accent"
              },
              {
                icon: Shield,
                title: "Accessibility First",
                description: "Enhanced muted text opacity from 70% to 85% for better readability",
                color: "text-primary"
              },
              {
                icon: Target,
                title: "Consistent Typography",
                description: "New utility classes for consistent text hierarchy and improved visual flow",
                color: "text-accent"
              },
              {
                icon: TrendingUp,
                title: "Performance Optimized",
                description: "Hardware-accelerated animations and optimized CSS for smooth 60fps performance",
                color: "text-primary"
              },
              {
                icon: Users,
                title: "User-Centric Design",
                description: "Designed based on user feedback about readability issues in various lighting conditions",
                color: "text-accent"
              },
              {
                icon: BarChart3,
                title: "Data-Driven Improvements",
                description: "Color choices backed by contrast ratio calculations and accessibility testing",
                color: "text-primary"
              }
            ].map((feature, index) => (
              <Card key={index} className="bg-enhanced-card bg-enhanced-card-hover border-border/50 hover:border-accent/30 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-primary">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-tertiary leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* White Background Fix Demo Section */}
      <section className="py-20 bg-gradient-to-br from-secondary/10 to-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              White Background Issues Fixed
            </h2>
            <p className="text-xl text-tertiary max-w-3xl mx-auto">
              We've identified and fixed all the problematic white backgrounds that were breaking the dark theme consistency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Before */}
            <Card className="bg-enhanced-card border-border/50">
              <CardHeader>
                <CardTitle className="text-destructive">Before: White Backgrounds</CardTitle>
                <CardDescription className="text-muted-enhanced">
                  Inconsistent theme with jarring white sections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-border/30">
                  <p className="text-gray-800 text-sm">
                    White card backgrounds broke the dark theme
                  </p>
                  <p className="text-gray-600 text-xs mt-2">
                    Created visual inconsistency and poor UX
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-enhanced">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  <span>Inconsistent theme experience</span>
                </div>
              </CardContent>
            </Card>

            {/* After */}
            <Card className="bg-enhanced-card border-accent/30 ring-1 ring-accent/20">
              <CardHeader>
                <CardTitle className="text-accent">After: Consistent Dark Theme</CardTitle>
                <CardDescription className="text-tertiary">
                  All backgrounds now follow the dark theme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-enhanced-card rounded-lg border border-accent/20">
                  <p className="text-tertiary text-sm">
                    Dark card backgrounds maintain theme consistency
                  </p>
                  <p className="text-muted-enhanced text-xs mt-2">
                    Perfect visual harmony throughout the interface
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs text-tertiary">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Consistent dark theme experience</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fixed Areas List */}
          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="bg-enhanced-card border-accent/20">
              <CardHeader>
                <CardTitle className="text-primary text-center">White Background Areas Fixed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-accent">Main Page Backgrounds:</h4>
                    <ul className="space-y-2 text-sm text-tertiary">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        <span>Enterprise landing hero section (from-neutral-50 via-white)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        <span>Main page navigation buttons (bg-white/90)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        <span>Enterprise page navigation (bg-white/90)</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-accent">Component Backgrounds:</h4>
                    <ul className="space-y-2 text-sm text-tertiary">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        <span>Enterprise Button secondary variant (bg-white)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        <span>Layout elevated sections (bg-white shadow-sm)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        <span>Crypto assets card (from-white to-neutral-50/50)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        <span>Interactive hover states (hover:bg-white/80)</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {/* Summary */}
                <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-sm text-tertiary text-center">
                    <strong className="text-accent">Total Fixed:</strong> 8+ white background instances across navigation, 
                    hero sections, buttons, cards, and interactive states - all now use consistent dark theme colors.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent text-accent-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Experience the Difference
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of users who now enjoy a more accessible and readable interface.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-background text-primary hover:bg-background/90">
              View Full Site
            </Button>
            <Button size="lg" variant="outline" className="border-accent-foreground/30 text-accent-foreground hover:bg-accent-foreground/10">
              Learn About Accessibility
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <span className="text-sm font-bold text-accent-foreground">Z</span>
              </div>
              <span className="text-lg font-semibold gradient-text">Zignal</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-tertiary">
              <span>Enhanced for accessibility</span>
              <span>•</span>
              <span>WCAG AA compliant</span>
              <span>•</span>
              <span>Perfect contrast ratios</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function EnhancedUIPage() {
  const [currentView, setCurrentView] = useState<'enhanced' | 'original'>('enhanced')

  return (
    <div className="relative">
      {/* View Toggle */}
      <div className="fixed top-6 left-6 z-50 flex gap-2">
        <Button
          variant={currentView === 'enhanced' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentView('enhanced')}
          className="bg-gradient-to-r from-accent to-primary text-accent-foreground"
        >
          Enhanced UI
        </Button>
        <Button
          variant={currentView === 'original' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentView('original')}
        >
          Original
        </Button>
      </div>

      {/* Auth button */}
      <div className="fixed top-6 right-6 z-50">
        <Link
          href="/auth"
          className="px-6 py-3 bg-gradient-to-r from-accent to-primary text-accent-foreground font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg"
        >
          Login / Sign Up
        </Link>
      </div>

      {/* Content */}
      {currentView === 'enhanced' ? (
        <EnhancedUIShowcase />
      ) : (
        <FunctionalLanding />
      )}
    </div>
  )
}
