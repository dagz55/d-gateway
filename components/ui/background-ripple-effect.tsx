"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BackgroundCellsProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'zignal' | 'minimal';
  intensity?: 'low' | 'medium' | 'high';
  enableRipple?: boolean;
  enableMouse?: boolean;
  cellSize?: number;
  rows?: number;
  cols?: number;
}

interface CellData {
  id: string;
  row: number;
  col: number;
  isActive: boolean;
  intensity: number;
}

export const BackgroundCells = ({ 
  children, 
  className,
  variant = 'zignal',
  intensity = 'medium',
  enableRipple = true,
  enableMouse = true,
  cellSize = 12,
  rows = 25,
  cols = 40
}: BackgroundCellsProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<Array<{ id: string; x: number; y: number; timestamp: number }>>([]);
  const ref = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(undefined);

  // Performance optimization: throttle mouse updates
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!enableMouse) return;
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(() => {
      const rect = ref.current?.getBoundingClientRect();
      if (rect) {
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    });
  }, [enableMouse]);

  const handleCellClick = useCallback((x: number, y: number) => {
    if (!enableRipple) return;
    
    const rippleId = `ripple-${Date.now()}-${Math.random()}`;
    setRipples(prev => [...prev, { id: rippleId, x, y, timestamp: Date.now() }]);
    
    // Clean up old ripples
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId));
    }, 2000);
  }, [enableRipple]);

  // Memoize cell data for performance
  const cells = useMemo(() => {
    const cellArray: CellData[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        cellArray.push({
          id: `${row}-${col}`,
          row,
          col,
          isActive: false,
          intensity: 0
        });
      }
    }
    return cellArray;
  }, [rows, cols]);

  // Theme variants
  const getThemeConfig = () => {
    switch (variant) {
      case 'zignal':
        return {
          background: 'bg-[#0A0F1F]',
          cellBorder: 'border-zinborder',
          activeCell: 'bg-[rgba(51,225,218,0.3)]',
          rippleColor: 'rgba(51,225,218,0.6)',
          maskGradient: 'linear-gradient(to_bottom,transparent,black)'
        };
      case 'minimal':
        return {
          background: 'bg-slate-950',
          cellBorder: 'border-neutral-700',
          activeCell: 'bg-[rgba(14,165,233,0.2)]',
          rippleColor: 'rgba(14,165,233,0.4)',
          maskGradient: 'linear-gradient(to_bottom,transparent,black)'
        };
      default:
        return {
          background: 'bg-slate-950',
          cellBorder: 'border-neutral-600',
          activeCell: 'bg-[rgba(14,165,233,0.3)]',
          rippleColor: 'rgba(14,165,233,0.6)',
          maskGradient: 'linear-gradient(to_bottom,transparent,black)'
        };
    }
  };

  const theme = getThemeConfig();
  const maskSize = intensity === 'high' ? 400 : intensity === 'medium' ? 300 : 200;

  return (
    <div className={cn("relative h-screen flex justify-center overflow-hidden", className, theme.background)}>
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        className="h-full absolute inset-0 cursor-crosshair"
      >
        {/* Background grid */}
        <div className="absolute h-full w-full overflow-hidden">
          {/* Gradient mask */}
          <div className={cn(
            "absolute h-full w-full pointer-events-none -bottom-2 z-40",
            `[mask-image:${theme.maskGradient}]`
          )} />
          
          {/* Mouse spotlight layer */}
          {enableMouse && (
            <div
              className="absolute inset-0 z-20 bg-transparent"
              style={{
                maskImage: `radial-gradient(${maskSize / 4}px circle at center, white, transparent)`,
                WebkitMaskImage: `radial-gradient(${maskSize / 4}px circle at center, white, transparent)`,
                WebkitMaskPosition: `${mousePosition.x - maskSize / 2}px ${mousePosition.y - maskSize / 2}px`,
                WebkitMaskSize: `${maskSize}px`,
                maskSize: `${maskSize}px`,
                pointerEvents: "none",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
              }}
            >
              <CellGrid 
                cells={cells}
                cellSize={cellSize}
                theme={theme}
                onCellClick={handleCellClick}
                variant={variant}
                intensity={intensity}
              />
            </div>
          )}
          
          {/* Base grid layer */}
          <CellGrid 
            cells={cells}
            cellSize={cellSize}
            theme={theme}
            onCellClick={handleCellClick}
            variant={variant}
            intensity={intensity}
            isBaseLayer={true}
          />
        </div>

        {/* Ripple effects */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <RippleEffect
              key={ripple.id}
              x={ripple.x}
              y={ripple.y}
              color={theme.rippleColor}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {children && (
        <div className="relative z-50 mt-40 pointer-events-none select-none">
          {children}
        </div>
      )}
    </div>
  );
};

interface CellGridProps {
  cells: CellData[];
  cellSize: number;
  theme: any;
  onCellClick: (x: number, y: number) => void;
  variant: string;
  intensity: string;
  isBaseLayer?: boolean;
}

const CellGrid = ({ 
  cells, 
  cellSize, 
  theme, 
  onCellClick, 
  variant, 
  intensity, 
  isBaseLayer = false 
}: CellGridProps) => {
  // Calculate cols from cells data
  const cols = Math.ceil(Math.sqrt(cells.length));
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [clickedCell, setClickedCell] = useState<string | null>(null);

  const handleCellInteraction = (cellId: string, x: number, y: number, isClick = false) => {
    if (isClick) {
      setClickedCell(cellId);
      onCellClick(x, y);
      setTimeout(() => setClickedCell(null), 600);
    } else {
      setHoveredCell(cellId);
    }
  };

  return (
    <div 
      className={cn(
        "grid relative z-30",
        isBaseLayer ? "opacity-20" : "opacity-100"
      )}
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gap: '1px',
        width: 'fit-content'
      }}
    >
      {cells.map((cell) => {
        const isHovered = hoveredCell === cell.id;
        const isClicked = clickedCell === cell.id;
        const x = cell.col * cellSize;
        const y = cell.row * cellSize;

        return (
          <motion.div
            key={cell.id}
            className={cn(
              "border border-solid transition-all duration-200",
              theme.cellBorder,
              isBaseLayer ? "opacity-30" : "opacity-100"
            )}
            style={{
              width: cellSize,
              height: cellSize,
              gridColumn: cell.col + 1,
              gridRow: cell.row + 1
            }}
            onMouseEnter={() => !isBaseLayer && handleCellInteraction(cell.id, x, y)}
            onMouseLeave={() => !isBaseLayer && setHoveredCell(null)}
            onClick={() => handleCellInteraction(cell.id, x, y, true)}
            whileHover={!isBaseLayer ? { scale: 1.05 } : {}}
            whileTap={!isBaseLayer ? { scale: 0.95 } : {}}
          >
            <motion.div
              className={cn(
                "w-full h-full transition-all duration-300",
                isHovered && !isBaseLayer ? theme.activeCell : "bg-transparent",
                isClicked && !isBaseLayer ? "bg-opacity-80" : ""
              )}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: isHovered && !isBaseLayer ? 1 : isClicked && !isBaseLayer ? 0.8 : 0,
                scale: isHovered && !isBaseLayer ? 1 : isClicked && !isBaseLayer ? 1.2 : 1
              }}
              transition={{ 
                duration: isClicked ? 0.3 : 0.2,
                ease: isClicked ? "easeOut" : "easeInOut"
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

interface RippleEffectProps {
  x: number;
  y: number;
  color: string;
}

const RippleEffect = ({ x, y, color }: RippleEffectProps) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: x - 50,
        top: y - 50,
        width: 100,
        height: 100,
      }}
      initial={{ scale: 0, opacity: 0.8 }}
      animate={{ 
        scale: [0, 1, 2],
        opacity: [0.8, 0.4, 0]
      }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 1.5,
        ease: "easeOut",
        times: [0, 0.5, 1]
      }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          boxShadow: `0 0 20px ${color}`
        }}
      />
    </motion.div>
  );
};