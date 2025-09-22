import { NextResponse } from 'next/server';
import { CryptoPrice } from '@/types';

export async function GET() {
  try {
    // Fetch live crypto price data from CoinGecko API
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1&interval=hourly',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match our CryptoPrice interface
    const prices: CryptoPrice[] = data.prices.map((price: [number, number]) => ({
      t: price[0].toString(),
      close: price[1],
    }));

    return NextResponse.json({
      success: true,
      data: prices,
    });
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch crypto prices' },
      { status: 500 }
    );
  }
}
