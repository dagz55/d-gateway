"use client"

import { useEffect, useRef } from "react"
import { HeroSlideshow } from "./HeroSlideshow"

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
        className="absolute inset-0 w-full h-full opacity-20"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Content - Now using slideshow */}
      <div className="relative z-10 h-full min-h-[50vh] lg:min-h-screen">
        <HeroSlideshow />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1F]/20 to-transparent pointer-events-none" />
    </div>
  )
}
