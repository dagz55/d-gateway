import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const BitcoinTradingChart = () => {
  const [timeframe, setTimeframe] = useState('5Min');
  const [currentPrice, setCurrentPrice] = useState(112699.84);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Generate realistic Bitcoin price data with seeded random for consistency
  const generateChartData = (seed: number = 12345) => {
    const data: Array<{
      time: string;
      price: number;
      volume: number;
      timestamp: number;
    }> = [];
    let basePrice = 112000;
    const timeframes: Record<string, number> = {
      '1Min': 60,
      '5Min': 12,
      '15Min': 4,
      '30Min': 2,
      '1Day': 1,
      '1Week': 1,
      '1Mon': 1
    };
    
    const points = timeframes[timeframe] || 12;
    
    // Use seeded random for consistent data
    let seedValue = seed;
    const seededRandom = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };
    
    for (let i = 0; i < points; i++) {
      const volatility = 500;
      const change = (seededRandom() - 0.5) * volatility;
      const price = basePrice + change;
      const volume = seededRandom() * 50 + 10;
      
      const time = new Date();
      time.setMinutes(time.getMinutes() - (points - i) * 5);
      
      data.push({
        time: time.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        price: Number(price.toFixed(2)),
        volume: Number(volume.toFixed(2)),
        timestamp: time.getTime()
      });
      
      basePrice = price;
    }
    
    // Update current price to last price
    if (data.length > 0) {
      setCurrentPrice(data[data.length - 1].price);
    }
    
    return data;
  };

  const [chartData, setChartData] = useState<Array<{
    time: string;
    price: number;
    volume: number;
    timestamp: number;
  }>>([]);

  // Initialize chart data only on client
  useEffect(() => {
    if (isClient) {
      const newData = generateChartData();
      setChartData(newData);
    }
  }, [timeframe, isClient]);

  // Simulate real-time price updates only on client
  useEffect(() => {
    if (!isClient) return;
    
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const change = (Math.random() - 0.5) * 50;
        const newPrice = prev + change;
        return Number(newPrice.toFixed(2));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: any[];
    label?: string | number;
  }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0];
      if (data && data.payload) {
        return (
          <div className="bg-gray-800 border border-gray-600 rounded p-3 text-sm shadow-lg">
            <p className="text-gray-300">{`Time: ${label || 'N/A'}`}</p>
            <p className="text-white">{`Price: $${data.payload.price?.toLocaleString() || 'N/A'}`}</p>
            {data.payload.volume && (
              <p className="text-gray-300">{`Volume: ${data.payload.volume}`}</p>
            )}
          </div>
        );
      }
    }
    return null;
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="bg-gray-900 text-white min-h-screen p-4">
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-300">Loading chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-semibold">Riscoin</span>
          </div>
          <div className="flex space-x-6 text-gray-400 text-sm">
            <span className="hover:text-white cursor-pointer">Futures</span>
            <span className="hover:text-white cursor-pointer">Markets</span>
            <span className="hover:text-white cursor-pointer">Assets</span>
            <span className="hover:text-white cursor-pointer">Support center</span>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-gray-400 text-sm">
          <span className="hover:text-white cursor-pointer">Download</span>
          <span className="hover:text-white cursor-pointer">Account</span>
          <span className="hover:text-white cursor-pointer">🇺🇸 English</span>
        </div>
      </div>

      {/* Trading Pair Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="text-xl font-semibold">BTC / USDT</div>
          <div className="text-3xl font-bold">${currentPrice.toLocaleString()}</div>
          <div className="text-green-400">+1.23%</div>
        </div>
        <div className="flex items-center space-x-6 text-sm text-gray-400">
          <div>
            <span>Order deadline(UTC+8): </span>
            <span className="text-blue-400">Countdown</span>
          </div>
          <div>
            <span>Time Period: </span>
            <span>19:04-19:05</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Chart Area */}
        <div className="lg:col-span-3 bg-gray-800 rounded-lg p-4">
          {/* Chart Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              <span className="text-gray-400">Chart</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {['1Min', '5Min', '15Min', '30Min', '1Day', '1Week', '1Mon'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    timeframe === tf 
                      ? 'bg-gray-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Price Stats */}
          <div className="flex flex-wrap gap-4 text-sm mb-4">
            <span className="text-gray-400">H: <span className="text-green-400">113,293.62</span></span>
            <span className="text-gray-400">L: <span className="text-red-400">111,110.79</span></span>
            <span className="text-gray-400">24H: <span className="text-green-400">794.25M</span></span>
            <span className="text-gray-400">O: <span className="text-white">112,065.35</span></span>
            <span className="text-gray-400">C: <span className="text-white">{currentPrice.toLocaleString()}</span></span>
          </div>

          {/* Main Price Chart */}
          <div className="h-80 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  domain={['dataMin - 100', 'dataMax + 100']}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip content={(props) => <CustomTooltip {...props} />} />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#00d4aa" 
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
                <ReferenceLine 
                  y={currentPrice} 
                  stroke="#fbbf24" 
                  strokeDasharray="4 4" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Volume Chart */}
          <div className="h-32 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length > 0) {
                      return (
                        <div className="bg-gray-800 border border-gray-600 rounded p-2 text-xs shadow-lg">
                          <p className="text-gray-300">{`Time: ${label || 'N/A'}`}</p>
                          <p className="text-gray-300">{`Volume: ${payload[0]?.value || 'N/A'}`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="volume" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Technical Indicators */}
          <div className="flex flex-wrap gap-4 text-sm mb-4">
            <span className="text-gray-400">VOL(5,10,20)</span>
            <span className="text-orange-400">MA5: 3.65</span>
            <span className="text-blue-400">MA10: 7.30</span>
            <span className="text-purple-400">MA20: 7.62</span>
            <span className="text-red-400">VOLUME: 0.00</span>
          </div>

          {/* Indicator Buttons */}
          <div className="flex flex-wrap gap-2">
            {['VOL', 'MACD', 'KDJ', 'RSI', 'DMI', 'OBV', 'BOLL', 'SAR', 'DMA', 'TRIX', 'BRAR', 'VR', 'EMV', 'WR', 'ROC', 'MTM', 'PSY'].map((indicator) => (
              <button 
                key={indicator} 
                className="px-2 py-1 text-xs text-gray-400 hover:text-white border border-gray-600 rounded hover:border-gray-500 transition-colors"
              >
                {indicator}
              </button>
            ))}
          </div>
        </div>

        {/* Trading Panel */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white font-semibold">Trade</span>
            <span className="text-gray-400 cursor-pointer">ⓘ</span>
          </div>

          <div className="space-y-4">
            {/* Time Selection */}
            <div>
              <div className="text-gray-400 text-sm mb-2">Time</div>
              <div className="bg-green-500 text-white px-3 py-2 rounded text-center font-semibold">
                19:04
              </div>
              <div className="text-gray-400 text-xs mt-1">Min:1 Available:0</div>
            </div>

            {/* Amount Input */}
            <div>
              <div className="text-gray-400 text-sm mb-2">Amount</div>
              <input 
                type="text" 
                placeholder="Please enter quantity"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Percentage Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {['1%', '50%', '75%', '100%'].map((pct) => (
                <button 
                  key={pct} 
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm transition-colors"
                >
                  {pct}
                </button>
              ))}
            </div>

            {/* Buy Button */}
            <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded font-semibold transition-colors">
              Buy
            </button>

            {/* Call/Put Stats */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-green-500 px-3 py-2 rounded text-center">
                <div className="text-white font-semibold">CALL</div>
                <div className="text-white">50.49%</div>
              </div>
              <div className="bg-gray-600 px-3 py-2 rounded text-center">
                <div className="text-white font-semibold">PUT</div>
                <div className="text-white">51.51%</div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="mt-6 space-y-2">
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors">
              Deposit
            </button>
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors">
              Withdrawal
            </button>
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors">
              Transfer
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="mt-6 bg-gray-800 rounded-lg p-4">
        <div className="flex space-x-6 border-b border-gray-600 pb-2 mb-4">
          <button className="text-green-400 border-b-2 border-green-400 pb-2 font-semibold">
            Position order
          </button>
          <button className="text-gray-400 hover:text-white pb-2">
            Historical orders
          </button>
          <button className="text-gray-400 hover:text-white pb-2">
            invited me
          </button>
          <button className="text-gray-400 hover:text-white pb-2">
            Follow-up plan
          </button>
        </div>
        
        <div className="hidden md:grid grid-cols-10 gap-4 text-sm text-gray-400 mb-2">
          <span>Product(Real Account)</span>
          <span>Status</span>
          <span>Direction</span>
          <span>Time Period</span>
          <span>Open Price</span>
          <span>Amount</span>
          <span>Open Position Time</span>
          <span>Turnover</span>
          <span>Rate of return</span>
          <span>Action</span>
        </div>
        
        <div className="text-center text-gray-400 py-8">
          No data
        </div>
        
        <div className="flex justify-center mt-4">
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-gray-400 hover:text-white">‹</button>
            <span className="px-3 py-1 bg-blue-500 text-white rounded">1</span>
            <button className="px-3 py-1 text-gray-400 hover:text-white">›</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BitcoinTradingChart;