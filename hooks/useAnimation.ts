"use client"

import { useEffect, useState, useRef } from 'react'

// Hook for detecting reduced motion preferences
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}

// Hook for detecting device capabilities
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    isHighPerformance: true,
    supportsTransform3D: true,
    supportsBackdropFilter: true,
    devicePixelRatio: 1,
    isTouch: false,
    isMobile: false
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    const checkCapabilities = () => {
      // Check for 3D transforms
      const supportsTransform3D = (() => {
        const el = document.createElement('div')
        el.style.transform = 'translate3d(1px, 1px, 1px)'
        return el.style.transform !== ''
      })()

      // Check for backdrop filter
      const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(1px)')

      // Detect device performance based on hardware concurrency and memory
      const isHighPerformance = (() => {
        const cores = navigator.hardwareConcurrency || 4
        const memory = (navigator as any).deviceMemory || 4
        return cores >= 4 && memory >= 4
      })()

      // Touch and mobile detection
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

      setCapabilities({
        isHighPerformance,
        supportsTransform3D,
        supportsBackdropFilter,
        devicePixelRatio: window.devicePixelRatio || 1,
        isTouch,
        isMobile
      })
    }

    checkCapabilities()
  }, [])

  return capabilities
}

// Enhanced intersection observer hook with stagger support
export function useIntersectionObserver(
  options: IntersectionObserverInit & { 
    stagger?: number
    threshold?: number | number[]
  } = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCurrentlyIntersecting = entry.isIntersecting
        setIsIntersecting(isCurrentlyIntersecting)
        
        if (isCurrentlyIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px',
        ...options
      }
    )

    observer.observe(element)
    observerRef.current = observer

    return () => {
      observer.disconnect()
    }
  }, [hasIntersected, options.threshold, options.rootMargin])

  return { ref, isIntersecting, hasIntersected }
}

// Hook for staggered animations
export function useStaggeredAnimation(
  itemCount: number,
  delay: number = 100,
  trigger: boolean = false
) {
  const [activeIndices, setActiveIndices] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!trigger) return

    let timeouts: NodeJS.Timeout[] = []

    for (let i = 0; i < itemCount; i++) {
      const timeout = setTimeout(() => {
        setActiveIndices(prev => new Set([...prev, i]))
      }, i * delay)
      
      timeouts.push(timeout)
    }

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [trigger, itemCount, delay])

  return activeIndices
}

// Hook for typewriter effect
export function useTypewriter(
  text: string,
  speed: number = 50,
  trigger: boolean = false
) {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!trigger) {
      setDisplayText('')
      setIsComplete(false)
      return
    }

    let currentIndex = 0
    setDisplayText('')
    setIsComplete(false)

    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        setIsComplete(true)
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed, trigger])

  return { displayText, isComplete }
}

// Hook for parallax scrolling
export function useParallax(speed: number = 0.5) {
  const [offset, setOffset] = useState(0)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      if (!elementRef.current) return
      
      const rect = elementRef.current.getBoundingClientRect()
      const scrolled = window.scrollY
      const rate = scrolled * speed
      
      setOffset(rate)
    }

    const throttledScroll = throttle(handleScroll, 16) // 60fps
    window.addEventListener('scroll', throttledScroll, { passive: true })
    
    return () => window.removeEventListener('scroll', throttledScroll)
  }, [speed])

  return { ref: elementRef, offset }
}

// Utility function for throttling
function throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
  let inThrottle: boolean
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }) as T
}

// Hook for smooth reveal animations
export function useSmoothReveal(delay: number = 0) {
  const { ref, isIntersecting, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '-50px'
  })
  
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    if (hasIntersected && !shouldAnimate) {
      const timer = setTimeout(() => {
        setShouldAnimate(true)
      }, delay)
      
      return () => clearTimeout(timer)
    }
  }, [hasIntersected, shouldAnimate, delay])

  return { ref, shouldAnimate, isIntersecting }
}