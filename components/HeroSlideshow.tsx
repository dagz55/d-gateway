"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Slide {
  id: number
  title: string
  content: string | string[]
  type: 'promo' | 'security' | 'mission' | 'vision'
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Cryptocurrency trading made simple.",
    content: "Want to experience risk-free trading?\nGo ahead and purchase our trade signals packages!",
    type: 'promo'
  },
  {
    id: 2,
    title: "Flexible Pricing",
    content: "Package price will depend on the duration of the availed packages.",
    type: 'promo'
  },
  {
    id: 3,
    title: "Expert Guidance",
    content: "Having a hard time mastering the art of cryptocurrency? Fret not, we have you covered. Reach out to your Zignals advisor to learn more.",
    type: 'promo'
  },
  {
    id: 4,
    title: "SITE SECURITY - HOW WE MAKE SURE YOUR FUNDS AND INFORMATION ARE SAFE WITH US",
    content: [
      "All payments are processed through secure gateways to protect your financial information.",
      "Personal details are encrypted and never shared with third parties.",
      "Multi-layer security, including strong password encryption and optional 2FA.",
      "We have a dedicated team that will regularly monitor and moderate our platform to protect Zignal members from scams or malicious activity.",
      "Honest results, no hidden tricks because we prioritize building trust within our community"
    ],
    type: 'security'
  },
  {
    id: 5,
    title: "Mission",
    content: "To guide every trader with clear and reliable cryptocurrency trading signals in order to make trading easier, straight to the point, and more profitable while building a supportive community that grows together",
    type: 'mission'
  },
  {
    id: 6,
    title: "Vision",
    content: "To be the go-to crypto signals hub for everyone. We are data-driven, trustworthy, and innovative in the cryptocurrency space. We do this by paving the way for financial freedom for Zignal members",
    type: 'vision'
  }
]

export function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-advance slides every 8 seconds
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }

  const slide = slides[currentSlide]

  const getSlideStyles = (type: string) => {
    switch (type) {
      case 'promo':
        return {
          titleClass: "text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight",
          contentClass: "text-lg lg:text-xl text-white/95 leading-relaxed",
          containerClass: "bg-gradient-to-br from-[#1A7FB3]/20 to-[#33E1DA]/10 backdrop-blur-sm border border-[#33E1DA]/20"
        }
      case 'security':
        return {
          titleClass: "text-2xl lg:text-3xl font-bold text-[#33E1DA] mb-6 leading-tight",
          contentClass: "text-base lg:text-lg text-[#EAF2FF]/90 leading-relaxed space-y-3",
          containerClass: "bg-gradient-to-br from-[#0A0F1F]/80 to-[#1E2A44]/60 backdrop-blur-sm border border-[#1A7FB3]/30"
        }
      case 'mission':
        return {
          titleClass: "text-3xl lg:text-4xl font-bold text-transparent bg-gradient-to-r from-[#1A7FB3] to-[#33E1DA] bg-clip-text mb-6",
          contentClass: "text-lg lg:text-xl text-[#EAF2FF]/90 leading-relaxed italic",
          containerClass: "bg-gradient-to-br from-[#33E1DA]/10 to-[#1A7FB3]/10 backdrop-blur-sm border border-[#33E1DA]/30"
        }
      case 'vision':
        return {
          titleClass: "text-3xl lg:text-4xl font-bold text-transparent bg-gradient-to-r from-[#33E1DA] to-[#1A7FB3] bg-clip-text mb-6",
          contentClass: "text-lg lg:text-xl text-[#EAF2FF]/90 leading-relaxed italic",
          containerClass: "bg-gradient-to-br from-[#1A7FB3]/10 to-[#33E1DA]/10 backdrop-blur-sm border border-[#1A7FB3]/30"
        }
      default:
        return {
          titleClass: "text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight",
          contentClass: "text-lg lg:text-xl text-white/95 leading-relaxed",
          containerClass: "bg-gradient-to-br from-[#1A7FB3]/20 to-[#33E1DA]/10 backdrop-blur-sm border border-[#33E1DA]/20"
        }
    }
  }

  const styles = getSlideStyles(slide.type)

  return (
    <div className="relative h-full flex flex-col justify-center items-center p-6 lg:p-8">
      {/* Main Slide Content */}
      <div className={`${styles.containerClass} rounded-2xl p-8 lg:p-12 max-w-4xl w-full transition-all duration-500 ease-in-out transform`}>
        <h1 className={styles.titleClass}>
          {slide.title}
        </h1>
        
        <div className={styles.contentClass}>
          {Array.isArray(slide.content) ? (
            <ul className="space-y-4">
              {slide.content.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-[#33E1DA] mr-3 mt-1 text-lg">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="whitespace-pre-line">
              {slide.content}
            </p>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center mt-8 space-x-4">
        {/* Previous Button */}
        <button
          onClick={prevSlide}
          className="p-2 rounded-full bg-[#1A7FB3]/20 hover:bg-[#1A7FB3]/40 transition-colors duration-200 border border-[#33E1DA]/30"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 text-[#33E1DA]" />
        </button>

        {/* Slide Indicators */}
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-[#33E1DA] scale-110"
                  : "bg-[#EAF2FF]/30 hover:bg-[#EAF2FF]/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="p-2 rounded-full bg-[#1A7FB3]/20 hover:bg-[#1A7FB3]/40 transition-colors duration-200 border border-[#33E1DA]/30"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 text-[#33E1DA]" />
        </button>
      </div>

      {/* Auto-play indicator */}
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="text-[#EAF2FF]/60 hover:text-[#EAF2FF]/80 text-sm transition-colors duration-200"
        >
          {isAutoPlaying ? "Auto-playing" : "Paused"} • Slide {currentSlide + 1} of {slides.length}
        </button>
      </div>
    </div>
  )
}