// Enterprise Design System - Zignal
// Inspired by industry leaders: Stripe, Linear, Vercel, Framer

export const designSystem = {
  // Premium Color System with Semantic Tokens
  colors: {
    // Brand Core
    brand: {
      50: '#f0fdfc',
      100: '#ccfbf1', 
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf', // Primary brand
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
      950: '#042f2e',
    },
    
    // Neutral System (Premium Grays)
    neutral: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },
    
    // Semantic Colors
    semantic: {
      success: {
        50: '#f0fdf4',
        500: '#22c55e',
        600: '#16a34a',
        900: '#14532d',
      },
      warning: {
        50: '#fffbeb',
        500: '#f59e0b',
        600: '#d97706',
        900: '#78350f',
      },
      danger: {
        50: '#fef2f2',
        500: '#ef4444',
        600: '#dc2626',
        900: '#7f1d1d',
      },
      info: {
        50: '#eff6ff',
        500: '#3b82f6',
        600: '#2563eb',
        900: '#1e3a8a',
      }
    },
    
    // Surface Colors for Depth
    surface: {
      base: '#ffffff',
      raised: '#fafafa',
      overlay: 'rgba(255, 255, 255, 0.95)',
      glass: 'rgba(255, 255, 255, 0.1)',
      backdrop: 'rgba(0, 0, 0, 0.5)',
    }
  },
  
  // Sophisticated Typography Scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    },
    
    fontSize: {
      // Text Sizes
      xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
      sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
      base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
      lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
      xl: ['1.25rem', { lineHeight: '1.875rem', letterSpacing: '-0.025em' }],
      
      // Display Sizes (Optimized for modern screens)
      'display-xs': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
      'display-sm': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
      'display-md': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
      'display-lg': ['3rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
      'display-xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
      'display-2xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
      'display-3xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
    },
    
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },
  
  // Precise Spacing System (8pt grid + optical adjustments)
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',    // 4px
    2: '0.5rem',     // 8px
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    8: '2rem',       // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    32: '8rem',      // 128px
    40: '10rem',     // 160px
    48: '12rem',     // 192px
    56: '14rem',     // 224px
    64: '16rem',     // 256px
  },
  
  // Border Radius System
  borderRadius: {
    none: '0',
    sm: '0.125rem',      // 2px
    base: '0.25rem',     // 4px
    md: '0.375rem',      // 6px
    lg: '0.5rem',        // 8px
    xl: '0.75rem',       // 12px
    '2xl': '1rem',       // 16px
    '3xl': '1.5rem',     // 24px
    full: '9999px',
  },
  
  // Enterprise Shadow System
  boxShadow: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '2xl': '0 50px 100px -20px rgba(0, 0, 0, 0.25)',
    
    // Branded shadows
    brand: '0 10px 15px -3px rgba(45, 212, 191, 0.1), 0 4px 6px -2px rgba(45, 212, 191, 0.05)',
    'brand-lg': '0 20px 25px -5px rgba(45, 212, 191, 0.1), 0 10px 10px -5px rgba(45, 212, 191, 0.04)',
    
    // Interactive shadows
    focus: '0 0 0 3px rgba(45, 212, 191, 0.1)',
    'focus-visible': '0 0 0 2px rgba(45, 212, 191, 0.8)',
  },
  
  // Animation System (Easing curves from Apple HIG and Material Design)
  animation: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
      slowest: '800ms',
    },
    
    easing: {
      // Standard easing
      linear: 'cubic-bezier(0, 0, 1, 1)',
      ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      'ease-in': 'cubic-bezier(0.42, 0, 1, 1)',
      'ease-out': 'cubic-bezier(0, 0, 0.58, 1)',
      'ease-in-out': 'cubic-bezier(0.42, 0, 0.58, 1)',
      
      // Premium easing curves
      'ease-spring': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bouncy
      'ease-smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',   // Smooth
      'ease-swift': 'cubic-bezier(0.4, 0, 0.2, 1)',            // Material Design
      'ease-sharp': 'cubic-bezier(0.4, 0, 0.6, 1)',            // Sharp exit
    },
    
    // Predefined animations
    presets: {
      'fade-in': 'fadeIn 200ms cubic-bezier(0, 0, 0.58, 1)',
      'slide-up': 'slideUp 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      'scale-in': 'scaleIn 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      'bounce-in': 'bounceIn 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  
  // Layout System
  layout: {
    // Container max widths
    container: {
      sm: '640px',
      md: '768px', 
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    
    // Common aspect ratios
    aspectRatio: {
      square: '1 / 1',
      video: '16 / 9',
      golden: '1.618 / 1',
      photo: '4 / 3',
      ultrawide: '21 / 9',
    },
    
    // Grid systems
    grid: {
      cols: 12,
      gap: '1.5rem',
      'gap-sm': '1rem',
      'gap-lg': '2rem',
    },
  },
  
  // Component Tokens
  components: {
    button: {
      height: {
        sm: '2rem',      // 32px
        base: '2.5rem',  // 40px
        lg: '3rem',      // 48px
        xl: '3.5rem',    // 56px
      },
      padding: {
        sm: '0.5rem 0.75rem',
        base: '0.625rem 1rem',
        lg: '0.75rem 1.5rem',
        xl: '1rem 2rem',
      },
      fontSize: {
        sm: '0.875rem',
        base: '0.875rem',
        lg: '1rem',
        xl: '1.125rem',
      },
    },
    
    input: {
      height: {
        sm: '2rem',
        base: '2.5rem',
        lg: '3rem',
      },
      padding: '0.75rem',
      borderWidth: '1px',
    },
    
    card: {
      padding: {
        sm: '1rem',
        base: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
      },
      borderRadius: 'xl',
      borderWidth: '1px',
    },
  },
  
  // Breakpoints (Mobile-first)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-index scale
  zIndex: {
    hide: -1,
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
    toast: 1700,
    max: 2147483647,
  },
} as const;

// Type definitions for TypeScript
export type ColorScale = keyof typeof designSystem.colors.brand;
export type SpacingScale = keyof typeof designSystem.spacing;
export type TypographyScale = keyof typeof designSystem.typography.fontSize;
export type ShadowScale = keyof typeof designSystem.boxShadow;
export type RadiusScale = keyof typeof designSystem.borderRadius;
export type AnimationDuration = keyof typeof designSystem.animation.duration;
export type AnimationEasing = keyof typeof designSystem.animation.easing;
export type Breakpoint = keyof typeof designSystem.breakpoints;

// Helper functions for design tokens
export const getColor = (color: string, shade?: string | number) => {
  if (!shade) return color;
  const [colorName, ...rest] = color.split('.');
  const path = [colorName, shade, ...rest].join('.');
  return `var(--${path.replace('.', '-')})`;
};

export const getSpacing = (space: SpacingScale) => designSystem.spacing[space];
export const getFontSize = (size: TypographyScale) => designSystem.typography.fontSize[size];
export const getShadow = (shadow: ShadowScale) => designSystem.boxShadow[shadow];
export const getRadius = (radius: RadiusScale) => designSystem.borderRadius[radius];

// CSS Custom Properties generator
export const generateCSSCustomProperties = () => {
  const properties: Record<string, string> = {};
  
  // Colors
  Object.entries(designSystem.colors).forEach(([colorName, colorScale]) => {
    if (typeof colorScale === 'object') {
      Object.entries(colorScale).forEach(([shade, value]) => {
        properties[`--color-${colorName}-${shade}`] = value;
      });
    }
  });
  
  // Spacing
  Object.entries(designSystem.spacing).forEach(([key, value]) => {
    properties[`--spacing-${key}`] = value;
  });
  
  return properties;
};