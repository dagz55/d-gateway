"use client";

// Efficient data buffer to reduce webpack serialization overhead
export class CandlestickDataBuffer {
  private buffer: ArrayBuffer;
  private view: DataView;
  private itemSize = 6 * 8; // 6 numbers * 8 bytes each (Float64)
  private maxItems: number;
  private currentLength = 0;

  constructor(maxItems: number = 50) {
    this.maxItems = maxItems;
    this.buffer = new ArrayBuffer(maxItems * this.itemSize);
    this.view = new DataView(this.buffer);
  }

  // Add a candlestick data point
  add(timestamp: number, open: number, high: number, low: number, close: number, volume: number): void {
    if (this.currentLength >= this.maxItems) {
      // Shift data left (remove oldest)
      this.shiftLeft();
    }

    const index = this.currentLength;
    const offset = index * this.itemSize;

    this.view.setFloat64(offset, timestamp, true);
    this.view.setFloat64(offset + 8, open, true);
    this.view.setFloat64(offset + 16, high, true);
    this.view.setFloat64(offset + 24, low, true);
    this.view.setFloat64(offset + 32, close, true);
    this.view.setFloat64(offset + 40, volume, true);

    if (this.currentLength < this.maxItems) {
      this.currentLength++;
    }
  }

  // Get all data as regular objects
  getData(): Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }> {
    const result = new Array(this.currentLength);
    
    for (let i = 0; i < this.currentLength; i++) {
      const offset = i * this.itemSize;
      result[i] = {
        timestamp: this.view.getFloat64(offset, true),
        open: this.view.getFloat64(offset + 8, true),
        high: this.view.getFloat64(offset + 16, true),
        low: this.view.getFloat64(offset + 24, true),
        close: this.view.getFloat64(offset + 32, true),
        volume: this.view.getFloat64(offset + 40, true)
      };
    }
    
    return result;
  }

  // Get single item by index
  getItem(index: number): {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  } | null {
    if (index < 0 || index >= this.currentLength) {
      return null;
    }

    const offset = index * this.itemSize;
    return {
      timestamp: this.view.getFloat64(offset, true),
      open: this.view.getFloat64(offset + 8, true),
      high: this.view.getFloat64(offset + 16, true),
      low: this.view.getFloat64(offset + 24, true),
      close: this.view.getFloat64(offset + 32, true),
      volume: this.view.getFloat64(offset + 40, true)
    };
  }

  // Update the last item (for live updates)
  updateLast(timestamp: number, open: number, high: number, low: number, close: number, volume: number): void {
    if (this.currentLength === 0) {
      this.add(timestamp, open, high, low, close, volume);
      return;
    }

    const index = this.currentLength - 1;
    const offset = index * this.itemSize;

    this.view.setFloat64(offset, timestamp, true);
    this.view.setFloat64(offset + 8, open, true);
    this.view.setFloat64(offset + 16, high, true);
    this.view.setFloat64(offset + 24, low, true);
    this.view.setFloat64(offset + 32, close, true);
    this.view.setFloat64(offset + 40, volume, true);
  }

  // Get current length
  length(): number {
    return this.currentLength;
  }

  // Clear all data
  clear(): void {
    this.currentLength = 0;
  }

  // Shift data left (remove oldest item)
  private shiftLeft(): void {
    if (this.currentLength <= 1) {
      this.clear();
      return;
    }

    // Move all data one position to the left
    const sourceStart = this.itemSize;
    const sourceEnd = this.currentLength * this.itemSize;
    const sourceLength = sourceEnd - sourceStart;
    
    const sourceArray = new Uint8Array(this.buffer, sourceStart, sourceLength);
    const targetArray = new Uint8Array(this.buffer, 0, sourceLength);
    
    targetArray.set(sourceArray);
    
    this.currentLength--;
  }

  // Get memory usage in bytes
  getMemoryUsage(): number {
    return this.buffer.byteLength;
  }
}

// Lightweight price formatter that avoids large string allocations
export const formatPriceEfficient = (price: number): string => {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(1)}K`;
  }
  if (price >= 1) {
    return `$${price.toFixed(2)}`;
  }
  return `$${price.toFixed(6)}`;
};

// Efficient volume formatter
export const formatVolumeEfficient = (volume: number): string => {
  if (volume >= 1e9) {
    return `${(volume / 1e9).toFixed(1)}B`;
  }
  if (volume >= 1e6) {
    return `${(volume / 1e6).toFixed(1)}M`;
  }
  if (volume >= 1e3) {
    return `${(volume / 1e3).toFixed(1)}K`;
  }
  return volume.toFixed(0);
};

// Memory-efficient technical indicator calculator
export class TechnicalIndicatorCalculator {
  private static calculateSMA(data: number[], period: number): number {
    if (data.length < period) return data[data.length - 1] || 0;
    
    const slice = data.slice(-period);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / period;
  }

  static calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  static calculateMACD(prices: number[]): number {
    const sma12 = this.calculateSMA(prices, 12);
    const sma26 = this.calculateSMA(prices, 26);
    return ((sma12 - sma26) / sma26) * 100;
  }

  static calculateBollingerBands(prices: number[], period: number = 20): {
    upper: number;
    middle: number;
    lower: number;
  } {
    const sma = this.calculateSMA(prices, period);
    
    if (prices.length < period) {
      return { upper: sma, middle: sma, lower: sma };
    }

    const slice = prices.slice(-period);
    const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    return {
      upper: sma + (stdDev * 2),
      middle: sma,
      lower: sma - (stdDev * 2)
    };
  }
}
