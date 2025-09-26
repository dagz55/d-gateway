'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Bitcoin, BadgeEuro, X, BadgeIndianRupee, BadgeSwissFranc } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface CryptoData {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  marketCap: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  data: Array<{ value: number }>;
}

const cryptoData: CryptoData[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: '$115,782.9',
    change: '-0.77%',
    changePercent: '-0.77%',
    marketCap: '$2,306,777,649,371.17',
    icon: Bitcoin,
    color: '#F7931A',
    data: [
      { value: 115800 },
      { value: 115900 },
      { value: 115700 },
      { value: 115600 },
      { value: 115500 },
      { value: 115400 },
      { value: 115300 },
      { value: 115200 },
      { value: 115100 },
      { value: 115000 },
      { value: 114900 },
      { value: 114800 },
      { value: 115000 },
      { value: 115200 },
      { value: 115400 },
      { value: 115600 },
      { value: 115782 }
    ]
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: '$4,471.6',
    change: '-1.31%',
    changePercent: '-1.31%',
    marketCap: '$539,749,941,707.40',
    icon: BadgeEuro,
    color: '#627EEA',
    data: [
      { value: 4500 },
      { value: 4520 },
      { value: 4480 },
      { value: 4460 },
      { value: 4440 },
      { value: 4420 },
      { value: 4400 },
      { value: 4380 },
      { value: 4360 },
      { value: 4340 },
      { value: 4320 },
      { value: 4300 },
      { value: 4350 },
      { value: 4400 },
      { value: 4450 },
      { value: 4470 },
      { value: 4471 }
    ]
  },
  {
    symbol: 'XRP',
    name: 'XRP',
    price: '$3.00',
    change: '-1.11%',
    changePercent: '-1.11%',
    marketCap: '$179,492,030,212.14',
    icon: X,
    color: '#23292F',
    data: [
      { value: 3.05 },
      { value: 3.08 },
      { value: 3.02 },
      { value: 2.98 },
      { value: 2.95 },
      { value: 2.92 },
      { value: 2.90 },
      { value: 2.88 },
      { value: 2.85 },
      { value: 2.82 },
      { value: 2.80 },
      { value: 2.78 },
      { value: 2.85 },
      { value: 2.92 },
      { value: 2.98 },
      { value: 3.02 },
      { value: 3.00 }
    ]
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    price: '$239.21',
    change: '-1.93%',
    changePercent: '-1.93%',
    marketCap: '$129,899,502,213.55',
    icon: BadgeIndianRupee,
    color: '#9945FF',
    data: [
      { value: 245 },
      { value: 248 },
      { value: 242 },
      { value: 238 },
      { value: 235 },
      { value: 232 },
      { value: 230 },
      { value: 228 },
      { value: 225 },
      { value: 222 },
      { value: 220 },
      { value: 218 },
      { value: 225 },
      { value: 232 },
      { value: 238 },
      { value: 242 },
      { value: 239 }
    ]
  },
  {
    symbol: 'CRO',
    name: 'Cronos',
    price: '$0.232679',
    change: '-0.34%',
    changePercent: '-0.34%',
    marketCap: '$8,100,649,111.74',
    icon: BadgeSwissFranc,
    color: '#003CDA',
    data: [
      { value: 0.235 },
      { value: 0.238 },
      { value: 0.232 },
      { value: 0.230 },
      { value: 0.228 },
      { value: 0.226 },
      { value: 0.224 },
      { value: 0.222 },
      { value: 0.220 },
      { value: 0.218 },
      { value: 0.216 },
      { value: 0.214 },
      { value: 0.220 },
      { value: 0.226 },
      { value: 0.230 },
      { value: 0.234 },
      { value: 0.232679 }
    ]
  }
];

function CryptoCard({ crypto }: { crypto: CryptoData }) {
  const Icon = crypto.icon;
  const isNegative = crypto.change.startsWith('-');

  return (
    <Card className="glass glass-hover transition-all duration-300 hover:scale-105">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: crypto.color }}
            >
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{crypto.name}</h3>
              <p className="text-sm text-muted-foreground">{crypto.symbol}</p>
            </div>
          </div>
          <Badge variant={isNegative ? "destructive" : "default"} className="text-xs">
            {crypto.changePercent}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="text-2xl font-bold text-foreground">{crypto.price}</div>
          <div className={`text-sm ${isNegative ? 'text-red-400' : 'text-green-400'}`}>
            {crypto.change}
          </div>
        </div>

        <div className="h-16 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={crypto.data}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={isNegative ? "#ef4444" : "#10b981"}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="text-xs text-muted-foreground">
          <div>Market cap</div>
          <div className="font-mono">{crypto.marketCap}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MarketOverview() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Market overview</h2>
          <p className="text-muted-foreground">Stay on top of leading assets before the next alert fires.</p>
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          <span>View full market board</span>
          <ArrowRight size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {cryptoData.map((crypto) => (
          <CryptoCard key={crypto.symbol} crypto={crypto} />
        ))}
      </div>
    </div>
  );
}