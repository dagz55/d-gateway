"use client"

import { ReactNode, useEffect, useState, forwardRef, ElementType } from 'react'
import { useIntersectionObserver, useTypewriter, useStaggeredAnimation, useReducedMotion } from '@/hooks/useAnimation'

interface BaseAnimationProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  as?: ElementType
}

// Fade in with stagger effect
export function FadeInStagger({
  children,
  className = '',
  delay = 100,
  duration = 600,
  as: Component = 'div'
}: BaseAnimationProps) {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.1 })
  const prefersReducedMotion = useReducedMotion()
  
  const textContent = typeof children === 'string' ? children : ''
  const words = textContent.split(' ')
  const activeIndices = useStaggeredAnimation(words.length, delay, hasIntersected)

  if (prefersReducedMotion) {
    return (
      <div ref={ref as any} className={className}>
        {children}
      </div>
    )
  }

  return (
    <div ref={ref as any} className={`${className} inline-block`}>
      {words.map((word, index) => (
        <span
          key={index}
          className={`inline-block transition-all ease-out mr-2 ${
            activeIndices.has(index)
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{
            transitionDuration: `${duration}ms`,
            transitionDelay: prefersReducedMotion ? '0ms' : `${index * delay}ms`
          }}
        >
          {word}
        </span>
      ))}
    </div>
  )
}

// Typewriter animation component
export function Typewriter({
  text,
  speed = 50,
  className = '',
  showCursor = true
}: {
  text: string
  speed?: number
  className?: string
  showCursor?: boolean
}) {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.3 })
  const { displayText, isComplete } = useTypewriter(text, speed, hasIntersected)
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return (
      <div ref={ref as any} className={className}>
        {text}
      </div>
    )
  }

  return (
    <div ref={ref as any} className={className}>
      {displayText}
      {showCursor && (
        <span
          className={`inline-block w-0.5 h-6 bg-current ml-1 animate-pulse ${
            isComplete ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}
    </div>
  )
}

// Slide in from different directions
export function SlideIn({
  children,
  direction = 'up',
  distance = 50,
  className = '',
  delay = 0,
  duration = 600
}: BaseAnimationProps & {
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
}) {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.1 })
  const prefersReducedMotion = useReducedMotion()

  const getTransform = () => {
    if (prefersReducedMotion || hasIntersected) return 'translate3d(0, 0, 0)'
    
    switch (direction) {
      case 'up': return `translate3d(0, ${distance}px, 0)`
      case 'down': return `translate3d(0, -${distance}px, 0)`
      case 'left': return `translate3d(${distance}px, 0, 0)`
      case 'right': return `translate3d(-${distance}px, 0, 0)`
      default: return `translate3d(0, ${distance}px, 0)`
    }
  }

  return (
    <div
      ref={ref as any}
      className={`${className} transition-all ease-out`}
      style={{
        transform: getTransform(),
        opacity: prefersReducedMotion ? 1 : (hasIntersected ? 1 : 0),
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

// Scale transformation animation
export function ScaleIn({
  children,
  className = '',
  delay = 0,
  duration = 600,
  scale = 0.8
}: BaseAnimationProps & { scale?: number }) {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.1 })
  const prefersReducedMotion = useReducedMotion()

  return (
    <div
      ref={ref as any}
      className={`${className} transition-all ease-out`}
      style={{
        transform: prefersReducedMotion ? 'scale(1)' : (hasIntersected ? 'scale(1)' : `scale(${scale})`),
        opacity: prefersReducedMotion ? 1 : (hasIntersected ? 1 : 0),
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

// Text reveal animation (like wiping effect)
export function TextReveal({
  children,
  className = '',
  delay = 0,
  duration = 800
}: BaseAnimationProps) {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.2 })
  const prefersReducedMotion = useReducedMotion()
  const [isRevealing, setIsRevealing] = useState(false)

  useEffect(() => {
    if (hasIntersected && !isRevealing) {
      const timer = setTimeout(() => {
        setIsRevealing(true)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [hasIntersected, isRevealing, delay])

  if (prefersReducedMotion) {
    return (
      <div ref={ref as any} className={className}>
        {children}
      </div>
    )
  }

  return (
    <div
      ref={ref as any}
      className={`${className} relative overflow-hidden`}
    >
      <span className={`block transition-all ease-out ${
        isRevealing ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ transitionDuration: `${duration}ms` }}>
        {children}
      </span>
      <div
        className={`absolute inset-0 bg-gradient-to-r from-[#33E1DA] to-[#1A7FB3] transition-all ease-in-out ${
          isRevealing ? 'translate-x-full' : 'translate-x-0'
        }`}
        style={{ transitionDuration: `${duration * 0.8}ms`, transitionDelay: `${duration * 0.2}ms` }}
      />
    </div>
  )
}

// Letter-by-letter reveal
export function LetterReveal({
  text,
  className = '',
  delay = 50,
  duration = 400
}: {
  text: string
  className?: string
  delay?: number
  duration?: number
}) {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.2 })
  const prefersReducedMotion = useReducedMotion()
  const letters = text.split('')
  const activeIndices = useStaggeredAnimation(letters.length, delay, hasIntersected)

  if (prefersReducedMotion) {
    return (
      <div ref={ref as any} className={className}>
        {text}
      </div>
    )
  }

  return (
    <div ref={ref as any} className={className}>
      {letters.map((letter, index) => (
        <span
          key={index}
          className={`inline-block transition-all ease-out ${
            activeIndices.has(index)
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-2 scale-90'
          }`}
          style={{
            transitionDuration: `${duration}ms`,
            transitionDelay: `${index * delay}ms`
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </span>
      ))}
    </div>
  )
}

// Morphing text effect
export function MorphingText({ 
  texts, 
  className = '',
  interval = 3000,
  morphDuration = 600
}: {
  texts: string[]
  className?: string
  interval?: number
  morphDuration?: number
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.3 })
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!hasIntersected || prefersReducedMotion) return

    const timer = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % texts.length)
        setIsTransitioning(false)
      }, morphDuration / 2)
    }, interval)

    return () => clearInterval(timer)
  }, [hasIntersected, texts.length, interval, morphDuration, prefersReducedMotion])

  return (
    <div ref={ref as any} className={`${className} relative`}>
      <span
        className={`block transition-all ease-in-out ${
          isTransitioning
            ? 'opacity-0 scale-95 blur-sm'
            : 'opacity-100 scale-100 blur-none'
        }`}
        style={{ transitionDuration: `${morphDuration / 2}ms` }}
      >
        {texts[currentIndex]}
      </span>
    </div>
  )
}

// Gradient text animation
export function GradientText({ 
  children, 
  className = '',
  gradientClass = 'bg-gradient-to-r from-[#33E1DA] to-[#1A7FB3]',
  animate = true
}: {
  children: ReactNode
  className?: string
  gradientClass?: string
  animate?: boolean
}) {
  return (
    <span 
      className={`${className} ${gradientClass} bg-clip-text text-transparent ${
        animate ? 'bg-[length:200%_100%] animate-gradient-shift' : ''
      }`}
    >
      {children}
    </span>
  )
}