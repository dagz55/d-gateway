// Animation configuration constants for Zignal Landing
export const ANIMATION_CONFIG = {
  TRADING_GRID_PATTERN: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2333E1DA' fill-opacity='0.05'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3C/g%3E%3Cg stroke='%2333E1DA' stroke-opacity='0.1' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E",
  
  CRYPTO_SYMBOLS: ['₿', '⟠', '◊', '$', '∑', '⧫', '◈', '⬟'],
  
  PRICE_CHANGES: ['+2.4%', '-1.3%', '+5.7%', '+0.8%', '-3.2%', '+4.1%', '-0.5%', '+7.2%'],
  
  // Animation timing constants
  ANIMATION_DELAY_BASE: 0.1,
  ANIMATION_DURATION_BASE: 12,
  ANIMATION_DURATION_VARIANCE: 8,
  
  // Visual constants
  BASE_Y_POSITION: 300,
  Y_VARIANCE: 50,
  BASE_HEIGHT: 20,
  HEIGHT_VARIANCE: 40,
  
  // Grid configuration
  GRID_COLUMNS: 8,
  GRID_ROWS: 6,
  
  // Color configuration
  COLORS: {
    GREEN: '#10b981',
    RED: '#ef4444',
    ACCENT: '#33E1DA',
    BACKGROUND_START: '#1a365d',
    BACKGROUND_MID: '#2d5a87',
    BACKGROUND_END: '#1a365d'
  }
};

// Utility function for pseudo-random generation
export const pseudoRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Animation value generator
export const getAnimationValues = (index: number, isClient: boolean = false) => {
  if (!isClient) {
    return {
      baseY: ANIMATION_CONFIG.BASE_Y_POSITION,
      height: 30,
      isGreen: index % 2 === 0,
      animationDelay: `${index * ANIMATION_CONFIG.ANIMATION_DELAY_BASE}s`,
      animationDuration: `${ANIMATION_CONFIG.ANIMATION_DURATION_BASE + 3}s`
    };
  }
  
  return {
    baseY: ANIMATION_CONFIG.BASE_Y_POSITION + Math.sin(index * 0.5) * ANIMATION_CONFIG.Y_VARIANCE,
    height: ANIMATION_CONFIG.BASE_HEIGHT + pseudoRandom(index + 201) * ANIMATION_CONFIG.HEIGHT_VARIANCE,
    isGreen: pseudoRandom(index + 301) > 0.5,
    animationDelay: `${index * ANIMATION_CONFIG.ANIMATION_DELAY_BASE}s`,
    animationDuration: `${ANIMATION_CONFIG.ANIMATION_DURATION_BASE + pseudoRandom(index + 1) * ANIMATION_CONFIG.ANIMATION_DURATION_VARIANCE}s`
  };
};
