import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const days = url.searchParams.get('days') || '1';
    const apiKey = process.env.COINGECKO_API_KEY;

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'Zignal-App/1.0',
    };

    // Add API key to headers if available
    if (apiKey && apiKey.trim() !== '') {
      headers['x-cg-demo-api-key'] = apiKey;
    }

    // Fetch OHLC data from CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=usd&days=${days}`,
      {
        headers,
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const ohlcData = await response.json();

    // Also fetch current price and volume data
    const priceResponse = await fetch(
      'https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false',
      {
        headers,
        next: { revalidate: 60 },
      }
    );

    const priceData = await priceResponse.json();

    // Transform OHLC data for the chart
    const chartData = ohlcData.map((item: number[], index: number) => ({
      timestamp: item[0],
      time: new Date(item[0]).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      volume: Math.floor(Math.random() * 100) + 20, // Simulated volume data
    }));

    const currentPrice = priceData.market_data?.current_price?.usd || 0;
    const priceChange24h = priceData.market_data?.price_change_percentage_24h || 0;
    const volume24h = priceData.market_data?.total_volume?.usd || 0;
    const marketCap = priceData.market_data?.market_cap?.usd || 0;
    const high24h = priceData.market_data?.high_24h?.usd || 0;
    const low24h = priceData.market_data?.low_24h?.usd || 0;

    const responseData = {
      symbol: 'BTC/USD',
      current_price: currentPrice,
      price_change_24h: priceChange24h,
      volume_24h: volume24h,
      market_cap: marketCap,
      high_24h: high24h,
      low_24h: low24h,
      chart_data: chartData,
      last_updated: new Date().toISOString(),
    };

    return NextResponse.json(responseData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching Bitcoin chart data:', error);

    return NextResponse.json(
      { error: 'Failed to fetch Bitcoin chart data' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}