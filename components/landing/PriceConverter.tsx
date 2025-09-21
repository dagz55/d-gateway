'use client';

import { useMemo, useState } from 'react';
import { ArrowLeftRight, RefreshCw } from 'lucide-react';

const currencies = [
  { code: 'BTC', name: 'Bitcoin', rate: 115_782.93 },
  { code: 'ETH', name: 'Ethereum', rate: 4_471.69 },
  { code: 'USD', name: 'US Dollar', rate: 1 },
  { code: 'EUR', name: 'Euro', rate: 0.85 },
  { code: 'GBP', name: 'British Pound', rate: 0.73 },
];

const quickAmounts = ['0.5', '1', '2', '5'];

export function PriceConverter() {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('BTC');
  const [toCurrency, setToCurrency] = useState('USD');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fromRate = currencies.find((currency) => currency.code === fromCurrency)?.rate ?? 1;
  const toRate = currencies.find((currency) => currency.code === toCurrency)?.rate ?? 1;

  const numericAmount = Number(amount) || 0;

  const convertedAmount = useMemo(() => {
    if (!numericAmount || !fromRate || !toRate) {
      return 0;
    }
    return (numericAmount * fromRate) / toRate;
  }, [numericAmount, fromRate, toRate]);

  const formattedConverted = useMemo(
    () => convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [convertedAmount]
  );

  const exchangeRate = useMemo(() => (fromRate && toRate ? fromRate / toRate : 1), [fromRate, toRate]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 backdrop-blur">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
            Planner
          </span>
          <h3 className="mt-3 text-2xl font-semibold text-white md:text-3xl">Easily buy and sell crypto</h3>
          <p className="mt-2 text-sm text-white/70">
            Plan your entries, check fees, and simulate conversions with live reference rates.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/60 transition hover:border-white/30 hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh rates
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/40">
            <span>Send amount</span>
            <span>{fromCurrency}</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-2xl border border-white/15 bg-[#02060f]/80 px-4 py-4 text-lg font-semibold text-white placeholder:text-white/30 focus:border-[#0577DA] focus:outline-none"
              placeholder="0.00"
            />
            <select
              value={fromCurrency}
              onChange={(event) => setFromCurrency(event.target.value)}
              className="rounded-2xl border border-white/15 bg-[#02060f]/80 px-4 py-4 text-sm font-semibold text-white focus:border-[#0577DA] focus:outline-none"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code} className="bg-[#030a18] text-white">
                  {currency.code}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  amount === value
                    ? 'border-[#0577DA] bg-[#0577DA]/20 text-white'
                    : 'border-white/15 text-white/60 hover:border-white/30 hover:text-white'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden items-center justify-center lg:flex">
          <button
            type="button"
            onClick={swapCurrencies}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 text-white/70 transition hover:border-white/30 hover:text-white"
            aria-label="Swap currencies"
          >
            <ArrowLeftRight className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/40">
            <span>Receive amount</span>
            <span>{toCurrency}</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              readOnly
              value={formattedConverted}
              className="w-full rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-4 text-lg font-semibold text-white"
            />
            <select
              value={toCurrency}
              onChange={(event) => setToCurrency(event.target.value)}
              className="rounded-2xl border border-white/15 bg-[#02060f]/80 px-4 py-4 text-sm font-semibold text-white focus:border-[#0577DA] focus:outline-none"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code} className="bg-[#030a18] text-white">
                  {currency.code}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-white/50">
            Updated automatically — based on reference rates and excludes fees.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-[#02060f]/80 p-6 text-sm text-white/70 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Reference rate</p>
          <p className="mt-2 text-base font-semibold text-white">
            1 {fromCurrency} ≈ {exchangeRate.toLocaleString('en-US', { maximumFractionDigits: 2 })} {toCurrency}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Projected value</p>
          <p className="mt-2 text-base font-semibold text-white">
            {numericAmount.toLocaleString('en-US', { maximumFractionDigits: 4 })} {fromCurrency} → {formattedConverted} {toCurrency}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Next step</p>
          <p className="mt-2">Lock in the rate inside your Zignal desk and auto-sync it to your risk template.</p>
        </div>
      </div>
    </div>
  );
}
