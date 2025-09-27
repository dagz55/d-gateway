import { NextResponse } from 'next/server';
import { CryptoPrice } from '@/types';

// In-memory cache with a Time-To-Live (TTL) of 2 minutes
let cachedData: { prices: CryptoPrice[], stats: any, timestamp: number } | null = null;
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

// Enhanced rate limiting with exponential backoff
let lastRequestTimestamp = 0;
let requestCount = 0;
const RATE_LIMIT_MS = 5000; // 5 seconds between requests
const MAX_REQUESTS_PER_HOUR = 50; // CoinGecko free tier limit

// Function to generate fallback data
const generateFallbackData = () => {
  const fallbackData: CryptoPrice[] = [];
  const now = Date.now();
  let price = 50000 + Math.random() * 10000;

  for (let i = 0; i < 24; i++) {
    const timestamp = now - (23 - i) * 60 * 60 * 1000;
    const change = (Math.random() - 0.5) * 0.02;
    price = price * (1 + change);
    
    fallbackData.push({
      t: timestamp.toString(),
      close: price,
    });
  }

  const currentPrice = fallbackData[fallbackData.length - 1]?.close || 0;
  const previousPrice = fallbackData[fallbackData.length - 2]?.close || currentPrice;
  const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;

  return {
    success: true,
    data: fallbackData,
    stats: {
      currentPrice,
      priceChange: priceChange.toFixed(2),
      volatility: (Math.random() * 5 + 1).toFixed(2),
      lastUpdate: new Date().toISOString()
    },
    isFallback: true,
  };
};


const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, backoff = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers as Record<string, string>),
        },
      });
      
      if (response.ok) {
        return response;
      }
      
      // Handle specific error cases
      if (response.status === 401) {
        console.warn('CoinGecko API: Unauthorized - API key may be required');
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      if (response.status === 429) {
        console.warn('CoinGecko API: Rate limited - backing off');
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : backoff * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      const delay = backoff * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${retries} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Failed to fetch after multiple retries");
};

export async function GET() {
  const now = Date.now();

  // 1. Enhanced Rate Limiting
  if (now - lastRequestTimestamp < RATE_LIMIT_MS) {
    console.log('Rate limit: Too many requests, using cached data or fallback');
    if (cachedData && (now - cachedData.timestamp < CACHE_TTL * 2)) {
      return NextResponse.json({
        success: true,
        data: cachedData.prices,
        stats: cachedData.stats,
        fromCache: true,
        rateLimited: true,
      });
    }
    return NextResponse.json(generateFallbackData());
  }
  
  // Reset request count every hour
  if (now - lastRequestTimestamp > 60 * 60 * 1000) {
    requestCount = 0;
  }
  
  if (requestCount >= MAX_REQUESTS_PER_HOUR) {
    console.warn('Hourly rate limit exceeded, using fallback data');
    return NextResponse.json(generateFallbackData());
  }
  
  lastRequestTimestamp = now;
  requestCount++;

  // 2. Caching
  if (cachedData && (now - cachedData.timestamp < CACHE_TTL)) {
    return NextResponse.json({
      success: true,
      data: cachedData.prices,
      stats: cachedData.stats,
      fromCache: true,
    });
  }

  try {
    // 3. Fetch with Retry and better error handling
    const apiKey = process.env.COINGECKO_API_KEY;
    
    const headers: Record<string, string> = { 
      'Accept': 'application/json',
      'User-Agent': 'Zignal-Dashboard/1.0',
    };

    // Add API key to headers if available
    if (apiKey && apiKey.trim() !== '') {
      headers['x-cg-demo-api-key'] = apiKey;
    }

    const response = await fetchWithRetry(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1',
      {
        headers,
        signal: AbortSignal.timeout(10000), // Increased timeout for retries
      }
    );

    const data = await response.json();
    
    const prices: CryptoPrice[] = data.prices.map((price: [number, number]) => ({
      t: price[0].toString(),
      close: price[1],
    }));

    const currentPrice = prices[prices.length - 1]?.close || 0;
    const previousPrice = prices[prices.length - 2]?.close || currentPrice;
    const priceChange = previousPrice === 0 ? 0 : ((currentPrice - previousPrice) / previousPrice) * 100;
    
    const priceValues = prices.map(p => p.close);
    const mean = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
    const variance = priceValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / priceValues.length;
    const volatility = mean === 0 ? 0 : Math.sqrt(variance) / mean * 100;

    const stats = {
      currentPrice,
      priceChange: priceChange.toFixed(2),
      volatility: volatility.toFixed(2),
      lastUpdate: new Date().toISOString()
    };

    // Update cache
    cachedData = { prices, stats, timestamp: now };

    return NextResponse.json({
      success: true,
      data: prices,
      stats: stats
    });
  } catch (error) {
    console.error('Error fetching crypto prices after retries:', error);
    // Return fallback data if all retries fail
    return NextResponse.json(generateFallbackData());
  }
}
