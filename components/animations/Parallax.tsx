"use client"

import Image from 'next/image'
import { ReactNode, useEffect, useState, useRef } from 'react'
import { useParallax, useReducedMotion, useDeviceCapabilities } from '@/hooks/useAnimation'

// Security: Validate and sanitize image URLs to prevent CSS injection
function validateAndSanitizeImageUrl(url: string): string | null {
  try {
    // Get configurable base URL, fallback to safe defaults
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : 'https://localhost:3000';
    
    // Parse URL to validate structure
    const parsedUrl = new URL(url, baseUrl);
    
    // Only allow http and https schemes
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      console.warn('Invalid URL scheme for background image:', parsedUrl.protocol);
      return null;
    }
    
    // Sanitize URL for CSS injection prevention
    const href = parsedUrl.href;
    if (typeof href !== 'string') {
      console.warn('Invalid URL href type');
      return null;
    }
    
    // Escape special characters for safe CSS url() usage
    const escapedUrl = href
      .replace(/\\/g, '\\\\')  // Escape backslashes
      .replace(/'/g, "\\'")    // Escape single quotes
      .replace(/\n/g, '\\A')   // Escape newlines
      .replace(/\r/g, '\\D')   // Escape carriage returns
      .replace(/\f/g, '\\C')   // Escape form feeds
      .replace(/\0/g, '\\0')   // Escape null bytes
      .replace(/\)/g, '\\)')   // Escape closing parentheses
    
    // Return safe URL wrapped in url() function with escaped content
    return `url('${escapedUrl}')`;
  } catch (error) {
    console.warn('Invalid background URL provided:', url);
    return null;
  }
}

interface ParallaxProps {
  children: ReactNode
  speed?: number
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  easing?: 'linear' | 'easeOut' | 'easeInOut'
  disabled?: boolean
}

export function ParallaxElement({ 
  children, 
  speed = 0.5, 
  className = '',
  direction = 'up',
  easing = 'linear',
  disabled = false
}: ParallaxProps) {
  const { ref, offset } = useParallax(speed)
  const prefersReducedMotion = useReducedMotion()
  const { isHighPerformance } = useDeviceCapabilities()

  // Disable parallax on low-performance devices or if user prefers reduced motion
  const shouldDisable = disabled || prefersReducedMotion || !isHighPerformance

  const getTransform = () => {
    if (shouldDisable) return 'none'

    const easedOffset = easing === 'easeOut' 
      ? offset * (1 - Math.pow(1 - Math.abs(offset) / 100, 3)) * Math.sign(offset)
      : easing === 'easeInOut'
      ? offset * (offset < 0 ? 2 * Math.pow((offset + 100) / 100, 2) - 1 : 1 - 2 * Math.pow((100 - offset) / 100, 2))
      : offset

    switch (direction) {
      case 'up':
      case 'down':
        return `translate3d(0, ${direction === 'up' ? -easedOffset : easedOffset}px, 0)`
      case 'left':
      case 'right':
        return `translate3d(${direction === 'left' ? -easedOffset : easedOffset}px, 0, 0)`
      default:
        return `translate3d(0, ${-easedOffset}px, 0)`
    }
  }

  return (
    <div
      ref={ref as any}
      className={className}
      style={{
        transform: getTransform(),
        willChange: shouldDisable ? 'auto' : 'transform'
      }}
    >
      {children}
    </div>
  )
}

// Background parallax container with multiple layers
export function ParallaxBackground({ 
  className = '',
  children,
  layers = 3
}: {
  className?: string
  children?: ReactNode
  layers?: number
}) {
  const prefersReducedMotion = useReducedMotion()
  const { isHighPerformance } = useDeviceCapabilities()

  if (prefersReducedMotion || !isHighPerformance) {
    return (
      <div className={`relative ${className}`}>
        {children}
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background layers with different parallax speeds */}
      {Array.from({ length: layers }, (_, index) => (
        <ParallaxElement
          key={index}
          speed={0.2 + (index * 0.3)}
          className="absolute inset-0"
        >
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: `radial-gradient(circle at ${20 + index * 30}% ${30 + index * 20}%, rgba(51, 225, 218, 0.1) 0%, transparent 50%)`
            }}
          />
        </ParallaxElement>
      ))}
      
      {/* Content layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Parallax text reveal effect
export function ParallaxTextReveal({ 
  text,
  className = '',
  speed = 0.8,
  stagger = 0.1
}: {
  text: string
  className?: string
  speed?: number
  stagger?: number
}) {
  const words = text.split(' ')
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return (
      <div className={className}>
        {text}
      </div>
    )
  }

  return (
    <div className={className}>
      {words.map((word, index) => (
        <ParallaxElement
          key={index}
          speed={speed + (index * stagger)}
          className="inline-block mr-2"
        >
          <span className="block">{word}</span>
        </ParallaxElement>
      ))}
    </div>
  )
}

// Parallax image with depth effect
export function ParallaxImage({ 
  src,
  alt,
  speed = 0.5,
  className = '',
  overlayGradient = true
}: {
  src: string
  alt: string
  speed?: number
  className?: string
  overlayGradient?: boolean
}) {
  const prefersReducedMotion = useReducedMotion()
  const { isHighPerformance } = useDeviceCapabilities()

  if (prefersReducedMotion || !isHighPerformance) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={alt}
          layout="fill"
          className="object-cover"
        />
        {overlayGradient && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1F]/60 to-transparent" />
        )}
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <ParallaxElement speed={speed} className="scale-110">
        <Image
          src={src}
          alt={alt}
          layout="fill"
          className="object-cover"
        />
      </ParallaxElement>
      
      {overlayGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1F]/60 to-transparent" />
      )}
    </div>
  )
}

// Parallax section wrapper
export function ParallaxSection({ 
  children,
  className = '',
  background,
  speed = 0.3,
  minHeight = '100vh'
}: {
  children: ReactNode
  className?: string
  background?: string
  speed?: number
  minHeight?: string
}) {
  const prefersReducedMotion = useReducedMotion()
  const { isHighPerformance } = useDeviceCapabilities()

  return (
    <div 
      className={`relative ${className}`}
      style={{ minHeight }}
    >
      {/* Background with parallax */}
      {background && (
        <div className="absolute inset-0 overflow-hidden">
          {prefersReducedMotion || !isHighPerformance ? (
            <div 
              className="absolute inset-0 scale-110"
              style={{ 
                backgroundImage: validateAndSanitizeImageUrl(background) || undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
              }}
            />
          ) : (
            <ParallaxElement speed={speed} className="scale-110">
              <div 
                className="absolute inset-0"
                style={{ 
                  backgroundImage: validateAndSanitizeImageUrl(background) || undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            </ParallaxElement>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1F]/20 via-transparent to-[#0A0F1F]/40" />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Advanced parallax container with mouse interaction
export function InteractiveParallax({ 
  children,
  className = '',
  intensity = 0.1,
  rotateIntensity = 0.05
}: {
  children: ReactNode
  className?: string
  intensity?: number
  rotateIntensity?: number
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const { isHighPerformance } = useDeviceCapabilities()

  useEffect(() => {
    if (prefersReducedMotion || !isHighPerformance) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      setMousePosition({
        x: (e.clientX - centerX) / rect.width,
        y: (e.clientY - centerY) / rect.height
      })
    }

    const handleMouseLeave = () => {
      setMousePosition({ x: 0, y: 0 })
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseleave', handleMouseLeave)
      
      return () => {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [prefersReducedMotion, isHighPerformance])

  const transform = prefersReducedMotion || !isHighPerformance
    ? 'none'
    : `translate3d(${mousePosition.x * intensity * 20}px, ${mousePosition.y * intensity * 20}px, 0) rotateY(${mousePosition.x * rotateIntensity * 10}deg) rotateX(${-mousePosition.y * rotateIntensity * 10}deg)`

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ perspective: '1000px' }}
    >
      <div
        className="transition-transform duration-300 ease-out"
        style={{
          transform,
          transformStyle: 'preserve-3d'
        }}
      >
        {children}
      </div>
    </div>
  )
}
