import React from 'react';

interface CryptoIconProps {
  symbol: string;
  className?: string;
  size?: number;
}

export const CryptoIcon: React.FC<CryptoIconProps> = ({ 
  symbol, 
  className = '', 
  size = 24 
}) => {
  const getCryptoStyle = (symbol: string) => {
    const symbolUpper = symbol.toUpperCase();
    
    switch (symbolUpper) {
      case 'BTC':
        return {
          background: 'linear-gradient(135deg, #F7931A 0%, #FFB84D 100%)',
          color: '#FFFFFF',
          symbol: '₿',
          fontSize: Math.max(size * 0.6, 12)
        };
      case 'ETH':
        return {
          background: 'linear-gradient(135deg, #627EEA 0%, #8FA4F3 100%)',
          color: '#FFFFFF',
          symbol: 'Ξ',
          fontSize: Math.max(size * 0.6, 12)
        };
      case 'XRP':
        return {
          background: 'linear-gradient(135deg, #23292F 0%, #3A3F45 100%)',
          color: '#FFFFFF',
          symbol: 'X',
          fontSize: Math.max(size * 0.7, 14)
        };
      case 'SOL':
        return {
          background: 'linear-gradient(135deg, #9945FF 0%, #B366FF 100%)',
          color: '#FFFFFF',
          symbol: '◎',
          fontSize: Math.max(size * 0.5, 10)
        };
      case 'CRO':
        return {
          background: 'linear-gradient(135deg, #002D74 0%, #1E4A8C 100%)',
          color: '#FFFFFF',
          symbol: 'C',
          fontSize: Math.max(size * 0.7, 14)
        };
      default:
        return {
          background: 'linear-gradient(135deg, #0577DA 0%, #1199FA 100%)',
          color: '#FFFFFF',
          symbol: symbol.slice(0, 2),
          fontSize: Math.max(size * 0.4, 10)
        };
    }
  };

  const style = getCryptoStyle(symbol);

  return (
    <div 
      className={`flex items-center justify-center rounded-full font-bold ${className}`}
      style={{ 
        width: size, 
        height: size,
        background: style.background,
        color: style.color,
        fontSize: style.fontSize,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '2px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {style.symbol}
    </div>
  );
};

export default CryptoIcon;
