"use client"

import { useState } from 'react'
import { useReducedMotion, useIntersectionObserver } from '@/hooks/useAnimation'

// Crypto icons data with SVG paths
const cryptoData = {
  bitcoin: {
    name: 'Bitcoin',
    symbol: 'BTC',
    color: '#F7931A',
    glowColor: 'rgba(247, 147, 26, 0.4)',
    path: 'M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546z M15.947 10.4c.223-1.492-.912-2.295-2.465-2.83l.504-2.02-1.228-.307-.49 1.967c-.322-.08-.653-.156-.982-.23l.494-1.98-1.228-.305-.504 2.018c-.267-.061-.53-.122-.785-.187l.002-.009-1.694-.423-.327 1.31s.912.209.894.221c.498.125.588.456.573.719l-.573 2.297c.034.009.078.022.127.043l-.128-.032-.803 3.22c-.061.15-.216.377-.566.291.012.018-.894-.223-.894-.223L5.5 15.101l1.599.4c.297.074.588.152.875.225l-.509 2.04 1.227.305.504-2.02c.332.09.654.173.969.252l-.503 2.013 1.227.305.508-2.037c2.095.396 3.67.236 4.335-1.65.535-1.518-.027-2.395-1.122-2.965.798-.184 1.397-.708 1.557-1.793zm-2.784 3.908c-.38 1.527-2.95.701-3.782.494l.675-2.706c.832.207 3.512.617 3.107 2.212zm.38-3.93c-.346 1.388-2.486.684-3.176.51l.612-2.45c.69.173 2.924.495 2.564 1.94z'
  },
  ethereum: {
    name: 'Ethereum',
    symbol: 'ETH',
    color: '#627EEA',
    glowColor: 'rgba(98, 126, 234, 0.4)',
    path: 'M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z'
  },
  solana: {
    name: 'Solana',
    symbol: 'SOL',
    color: '#9945FF',
    glowColor: 'rgba(153, 69, 255, 0.4)',
    path: 'M4.65 17.59c.26-.26.62-.41.99-.41H23c.55 0 .84.67.46 1.05l-3.97 3.97c-.26.26-.62.41-.99.41H2.14c-.55 0-.84-.67-.46-1.05L4.65 17.59z M4.65 6.41c.26-.26.62-.41.99-.41H23c.55 0 .84.67.46 1.05L19.49 11.02c-.26.26-.62.41-.99.41H2.14c-.55 0-.84-.67-.46-1.05L4.65 6.41z M19.49 12.98c.26-.26.62-.41.99-.41H23c.55 0 .84.67.46 1.05l-3.97 3.97c-.26.26-.62.41-.99.41H2.14c-.55 0-.84-.67-.46-1.05l2.97-2.97z'
  },
  cardano: {
    name: 'Cardano',
    symbol: 'ADA',
    color: '#0033AD',
    glowColor: 'rgba(0, 51, 173, 0.4)',
    path: 'M12 0c6.617 0 12 5.383 12 12s-5.383 12-12 12S0 18.617 0 12 5.383 0 12 0zm-.801 4.094c-1.15 0-2.082.932-2.082 2.082s.932 2.083 2.082 2.083c1.151 0 2.083-.932 2.083-2.083s-.932-2.082-2.083-2.082zm4.226 2.665c-.58 0-1.048.468-1.048 1.048 0 .579.468 1.047 1.048 1.047.579 0 1.047-.468 1.047-1.047 0-.58-.468-1.048-1.047-1.048zm-8.45 0c-.58 0-1.048.468-1.048 1.048 0 .579.468 1.047 1.048 1.047.579 0 1.047-.468 1.047-1.047 0-.58-.468-1.048-1.047-1.048zm11.25 3.6c-.58 0-1.048.468-1.048 1.048 0 .579.468 1.047 1.048 1.047.579 0 1.047-.468 1.047-1.047 0-.58-.468-1.048-1.047-1.048zm-14.05 0c-.58 0-1.048.468-1.048 1.048 0 .579.468 1.047 1.048 1.047.579 0 1.047-.468 1.047-1.047 0-.58-.468-1.048-1.047-1.048zm9.45.9c-.58 0-1.048.468-1.048 1.048 0 .579.468 1.047 1.048 1.047.579 0 1.047-.468 1.047-1.047 0-.58-.468-1.048-1.047-1.048zm-4.85 0c-.58 0-1.048.468-1.048 1.048 0 .579.468 1.047 1.048 1.047.579 0 1.047-.468 1.047-1.047 0-.58-.468-1.048-1.047-1.048zm7.05 3.6c-.58 0-1.048.468-1.048 1.048 0 .579.468 1.047 1.048 1.047.579 0 1.047-.468 1.047-1.047 0-.58-.468-1.048-1.047-1.048zm-9.25 0c-.58 0-1.048.468-1.048 1.048 0 .579.468 1.047 1.048 1.047.579 0 1.047-.468 1.047-1.047 0-.58-.468-1.048-1.047-1.048zm4.626 2.525c-1.15 0-2.082.932-2.082 2.082s.932 2.083 2.082 2.083c1.151 0 2.083-.932 2.083-2.083s-.932-2.082-2.083-2.082z'
  },
  polygon: {
    name: 'Polygon',
    symbol: 'MATIC',
    color: '#8247E5',
    glowColor: 'rgba(130, 71, 229, 0.4)',
    path: 'M15.923 10.382a1.915 1.915 0 0 1-.958.258 1.915 1.915 0 0 1-.958-.258l-2.007-1.16V6.476l2.007-1.16a1.915 1.915 0 0 1 1.916 0l2.007 1.16v2.746l-2.007 1.16z M8.077 13.618a1.915 1.915 0 0 1 .958-.258c.334 0 .665.087.958.258l2.007 1.16v2.746l-2.007 1.16a1.915 1.915 0 0 1-1.916 0l-2.007-1.16v-2.746l2.007-1.16z M20 0H4A4 4 0 0 0 0 4v16a4 4 0 0 0 4 4h16a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4z'
  },
  chainlink: {
    name: 'Chainlink',
    symbol: 'LINK',
    color: '#375BD2',
    glowColor: 'rgba(55, 91, 210, 0.4)',
    path: 'M12 0L9.798 1.266v2.532L12 2.532l2.202 1.266V1.266L12 0z M6.399 2.532L4.197 3.798v2.532l2.202-1.266V2.532z M17.601 2.532v2.532l2.202 1.266V3.798L17.601 2.532z M12 5.064L9.798 6.33v2.532L12 7.596l2.202 1.266V6.33L12 5.064z M3 6.33L.798 7.596v2.532L3 8.862V6.33z M21 6.33v2.532l2.202 1.266V7.596L21 6.33z M6.399 8.862L4.197 10.128v2.532l2.202-1.266V8.862z M17.601 8.862v2.532l2.202 1.266v-2.532L17.601 8.862z M12 10.128L9.798 11.394v2.532L12 12.66l2.202 1.266v-2.532L12 10.128z M3 11.394L.798 12.66v2.532L3 13.926v-2.532z M21 11.394v2.532l2.202 1.266V12.66L21 11.394z M6.399 13.926L4.197 15.192v2.532l2.202-1.266v-2.532z M17.601 13.926v2.532l2.202 1.266v-2.532l-2.202-1.266z M12 15.192L9.798 16.458v2.532L12 17.724l2.202 1.266v-2.532L12 15.192z M12 20.256L9.798 21.522V24L12 22.734l2.202 1.266v-2.478L12 20.256z'
  },
  binancecoin: {
    name: 'BNB',
    symbol: 'BNB',
    color: '#F3BA2F',
    glowColor: 'rgba(243, 186, 47, 0.4)',
    path: 'M12 2L13.09 8.26L22 7L15.74 13.09L22 15.74L13.09 15.74L12 22L10.91 15.74L2 17L8.26 10.91L2 8.26L10.91 8.26L12 2Z'
  },
  avalanche: {
    name: 'Avalanche',
    symbol: 'AVAX',
    color: '#E84142',
    glowColor: 'rgba(232, 65, 66, 0.4)',
    path: 'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 18.26h-2.275a.637.637 0 01-.553-.32l-1.917-3.33a.637.637 0 00-.553-.32h-3.34a.637.637 0 00-.553.32l-1.917 3.33a.637.637 0 01-.553.32H3.432a.637.637 0 01-.553-1.08L8.879 6.32a.637.637 0 01.553-.32h4.136a.637.637 0 01.553.32l6 10.86a.637.637 0 01-.553 1.08z'
  },
  polkadot: {
    name: 'Polkadot',
    symbol: 'DOT',
    color: '#E6007A',
    glowColor: 'rgba(230, 0, 122, 0.4)',
    path: 'M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm0 4.8c1.988 0 3.6 1.612 3.6 3.6S13.988 12 12 12s-3.6-1.612-3.6-3.6S10.012 4.8 12 4.8zm0 9.6c1.988 0 3.6 1.612 3.6 3.6s-1.612 3.6-3.6 3.6-3.6-1.612-3.6-3.6 1.612-3.6 3.6-3.6z'
  },
  uniswap: {
    name: 'Uniswap',
    symbol: 'UNI',
    color: '#FF007A',
    glowColor: 'rgba(255, 0, 122, 0.4)',
    path: 'M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm3.6 18.6c0 .332-.268.6-.6.6H9c-.332 0-.6-.268-.6-.6V9.6c0-.332.268-.6.6-.6h6c.332 0 .6.268.6.6v9z'
  }
}

interface CryptoIconProps {
  name: keyof typeof cryptoData
  size?: number
  showName?: boolean
  className?: string
  glowIntensity?: number
}

export function CryptoIcon({ 
  name, 
  size = 64, 
  showName = false,
  className = '',
  glowIntensity = 0.6
}: CryptoIconProps) {
  const [isHovered, setIsHovered] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const crypto = cryptoData[name]

  if (!crypto) return null

  const iconStyle = {
    filter: isHovered && !prefersReducedMotion 
      ? `drop-shadow(0 0 ${size * 0.3}px ${crypto.glowColor}) brightness(1.2)` 
      : 'none',
    transform: isHovered && !prefersReducedMotion ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }

  return (
    <div 
      className={`inline-flex flex-col items-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          style={iconStyle}
          className="cursor-pointer"
        >
          <path
            fill={crypto.color}
            d={crypto.path}
          />
        </svg>
        
        {/* Animated ring effect */}
        {isHovered && !prefersReducedMotion && (
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-75"
            style={{
              background: `radial-gradient(circle, ${crypto.glowColor} 0%, transparent 70%)`,
              transform: 'scale(1.2)'
            }}
          />
        )}
      </div>
      
      {showName && (
        <div className="mt-2 text-center">
          <div className="text-sm font-medium text-[#EAF2FF]">{crypto.name}</div>
          <div className="text-xs text-[#EAF2FF]/70">{crypto.symbol}</div>
        </div>
      )}
    </div>
  )
}

// Floating crypto icons background component
export function FloatingCryptoIcons({ 
  className = '',
  count = 20,
  minSize = 24,
  maxSize = 48
}: {
  className?: string
  count?: number
  minSize?: number
  maxSize?: number
}) {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.1 })
  const prefersReducedMotion = useReducedMotion()
  
  const cryptoNames = Object.keys(cryptoData) as (keyof typeof cryptoData)[]
  
  // Generate random positions and crypto icons
  const floatingIcons = Array.from({ length: count }, (_, index) => {
    const crypto = cryptoNames[index % cryptoNames.length]
    const size = Math.random() * (maxSize - minSize) + minSize
    const x = Math.random() * 100
    const y = Math.random() * 100
    const delay = Math.random() * 5
    const duration = 10 + Math.random() * 20
    
    return {
      crypto,
      size,
      x,
      y,
      delay,
      duration,
      id: index
    }
  })

  if (prefersReducedMotion) {
    return (
      <div ref={ref as any} className={`absolute inset-0 pointer-events-none ${className}`}>
        {floatingIcons.slice(0, 8).map((icon) => (
          <div
            key={icon.id}
            className="absolute opacity-20"
            style={{
              left: `${icon.x}%`,
              top: `${icon.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <CryptoIcon name={icon.crypto} size={icon.size} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div ref={ref as any} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {hasIntersected && floatingIcons.map((icon) => (
        <div
          key={icon.id}
          className="absolute animate-float opacity-30 hover:opacity-60"
          style={{
            left: `${icon.x}%`,
            top: `${icon.y}%`,
            animationDelay: `${icon.delay}s`,
            animationDuration: `${icon.duration}s`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <CryptoIcon name={icon.crypto} size={icon.size} />
        </div>
      ))}
    </div>
  )
}

// Grid of crypto icons with staggered animation
export function CryptoGrid({ 
  className = '',
  showNames = true,
  iconSize = 64,
  cols = 5
}: {
  className?: string
  showNames?: boolean
  iconSize?: number
  cols?: number
}) {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.1 })
  const prefersReducedMotion = useReducedMotion()
  const cryptoNames = Object.keys(cryptoData) as (keyof typeof cryptoData)[]

  return (
    <div 
      ref={ref as any}
      className={`grid gap-6 ${className}`}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {cryptoNames.map((crypto, index) => (
        <div
          key={crypto}
          className={`transition-all duration-500 ease-out ${
            hasIntersected && !prefersReducedMotion
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
          style={{
            transitionDelay: prefersReducedMotion ? '0ms' : `${index * 100}ms`
          }}
        >
          <CryptoIcon
            name={crypto}
            size={iconSize}
            showName={showNames}
            className="w-full justify-center"
          />
        </div>
      ))}
    </div>
  )
}

// Orbiting crypto icons around a center element
export function CryptoOrbit({ 
  className = '',
  centerSize = 80,
  orbitSize = 200,
  iconSize = 40,
  children
}: {
  className?: string
  centerSize?: number
  orbitSize?: number
  iconSize?: number
  children?: React.ReactNode
}) {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.2 })
  const prefersReducedMotion = useReducedMotion()
  const cryptoNames = Object.keys(cryptoData).slice(0, 6) as (keyof typeof cryptoData)[]

  return (
    <div 
      ref={ref as any}
      className={`relative ${className}`}
      style={{ 
        width: `${orbitSize + iconSize}px`,
        height: `${orbitSize + iconSize}px`
      }}
    >
      {/* Center element */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
        style={{ 
          width: `${centerSize}px`,
          height: `${centerSize}px`
        }}
      >
        {children}
      </div>

      {/* Orbiting icons */}
      {hasIntersected && cryptoNames.map((crypto, index) => {
        const angle = (index * 360) / cryptoNames.length
        const radius = orbitSize / 2
        const x = radius * Math.cos((angle * Math.PI) / 180)
        const y = radius * Math.sin((angle * Math.PI) / 180)

        return (
          <div
            key={crypto}
            className={`absolute top-1/2 left-1/2 ${
              prefersReducedMotion ? '' : 'animate-spin-slow'
            }`}
            style={{
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
              animationDuration: '20s',
              animationDelay: `${index * 0.5}s`
            }}
          >
            <div className={prefersReducedMotion ? '' : 'animate-reverse-spin'}>
              <CryptoIcon name={crypto} size={iconSize} />
            </div>
          </div>
        )
      })}
    </div>
  )
}