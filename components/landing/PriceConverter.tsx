'use client';

import { useState } from 'react';

export function PriceConverter() {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('BTC');
  const [toCurrency, setToCurrency] = useState('USD');
  const [result, setResult] = useState('115,782.93');

  const currencies = [
    { code: 'BTC', name: 'Bitcoin', rate: 115782.93 },
    { code: 'ETH', name: 'Ethereum', rate: 4471.69 },
    { code: 'USD', name: 'US Dollar', rate: 1 },
    { code: 'EUR', name: 'Euro', rate: 0.85 },
    { code: 'GBP', name: 'British Pound', rate: 0.73 },
  ];

  const handleConvert = () => {
    const fromRate = currencies.find(c => c.code === fromCurrency)?.rate || 1;
    const toRate = currencies.find(c => c.code === toCurrency)?.rate || 1;
    const convertedAmount = (parseFloat(amount) * fromRate) / toRate;
    setResult(convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    handleConvert();
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-white mb-4">Easily buy and sell crypto</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
        {/* From Currency */}
        <div className="space-y-2">
          <label className="text-gray-300 text-sm font-medium">From</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#0577DA] focus:border-transparent"
              placeholder="0.00"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="bg-transparent text-white border-none outline-none cursor-pointer"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code} className="bg-[#061121] text-white">
                    {currency.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSwap}
            className="bg-[#0577DA] hover:bg-[#0466c4] text-white p-3 rounded-full transition-colors"
            aria-label="Swap currencies"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 7L13 12L8 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 7L21 12L16 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* To Currency */}
        <div className="space-y-2">
          <label className="text-gray-300 text-sm font-medium">To</label>
          <div className="relative">
            <input
              type="text"
              value={result}
              readOnly
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-lg"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="bg-transparent text-white border-none outline-none cursor-pointer"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code} className="bg-[#061121] text-white">
                    {currency.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Convert Button */}
      <div className="mt-6 text-center">
        <button
          onClick={handleConvert}
          className="bg-[#0577DA] hover:bg-[#0466c4] text-white px-8 py-3 rounded-xl font-semibold transition-colors"
        >
          Convert
        </button>
      </div>

      {/* Exchange Rate Info */}
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          1 {fromCurrency} = {(currencies.find(c => c.code === fromCurrency)?.rate || 1) / (currencies.find(c => c.code === toCurrency)?.rate || 1)} {toCurrency}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Rate is for reference only. Please visit{' '}
          <a href="#" className="text-[#0577DA] hover:underline">
            Crypto.com Price
          </a>{' '}
          for details.
        </p>
      </div>
    </div>
  );
}
