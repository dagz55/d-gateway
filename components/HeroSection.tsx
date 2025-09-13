"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Animated grid and signal lines
    let animationId: number
    const gridSize = 40
    const signalLines: Array<{ x: number; y: number; progress: number }> = []

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Draw grid
      ctx.strokeStyle = "rgba(51, 225, 218, 0.1)"
      ctx.lineWidth = 1

      for (let x = 0; x < canvas.offsetWidth; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.offsetHeight)
        ctx.stroke()
      }

      for (let y = 0; y < canvas.offsetHeight; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.offsetWidth, y)
        ctx.stroke()
      }

      // Add signal lines occasionally
      if (Math.random() < 0.02) {
        signalLines.push({
          x: 0,
          y: Math.random() * canvas.offsetHeight,
          progress: 0,
        })
      }

      // Draw and update signal lines
      ctx.strokeStyle = "rgba(51, 225, 218, 0.8)"
      ctx.lineWidth = 2

      signalLines.forEach((line, index) => {
        line.progress += 0.02
        line.x = line.progress * canvas.offsetWidth

        if (line.progress > 1) {
          signalLines.splice(index, 1)
          return
        }

        ctx.beginPath()
        ctx.moveTo(line.x - 50, line.y)
        ctx.lineTo(line.x, line.y)
        ctx.stroke()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-[#0A0F1F] via-[#1E2A44] to-[#1A7FB3] lg:min-h-screen">
      {/* Animated Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-30"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-start p-8 lg:p-16 h-full min-h-[50vh] lg:min-h-screen">
        {/* Logo */}
        <div className="mb-8 lg:mb-12">
          <Image
            src="/zignal-logo.png"
            alt="Zignal Logo"
            width={200}
            height={80}
            className="w-auto h-16 lg:h-20"
            priority
          />
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl lg:text-6xl font-bold text-[#EAF2FF] mb-6 leading-tight text-balance">
          Trade the future.{" "}
          <span className="text-transparent bg-gradient-to-r from-[#1A7FB3] to-[#33E1DA] bg-clip-text">Zignal</span>{" "}
          turns pro signals into clear actions.
        </h1>

        {/* Subtitle */}
        <p className="text-xl lg:text-2xl text-[#EAF2FF]/80 mb-8 lg:mb-12 max-w-2xl leading-relaxed text-pretty">
          Login to access member dashboards and admin tools.
        </p>

        {/* Signal Chart Visualization */}
        <div className="flex items-center space-x-4 text-[#33E1DA]">
          <div className="flex items-end space-x-1">
            {[20, 35, 25, 45, 60, 40, 55].map((height, i) => (
              <div
                key={i}
                className="w-2 bg-gradient-to-t from-[#1A7FB3] to-[#33E1DA] animate-pulse"
                style={{
                  height: `${height}px`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
          <div className="text-sm font-mono">
            <div className="text-[#33E1DA]">+24.7%</div>
            <div className="text-[#EAF2FF]/60">Live Signals</div>
          </div>
        </div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1F]/20 to-transparent pointer-events-none" />
    </div>
  )
}
