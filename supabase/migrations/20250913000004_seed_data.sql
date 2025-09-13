-- =====================================================
-- ZIGNAL - Initial Seed Data
-- Created: 2025-09-13
-- Description: Initial data for crypto prices and sample news
-- =====================================================

-- =====================================================
-- SEED CRYPTO PRICES DATA
-- =====================================================
INSERT INTO public.crypto_prices (symbol, name, price_usd, change_24h, change_7d, volume_24h, market_cap, circulating_supply, rank)
VALUES 
    ('BTC', 'Bitcoin', 45000.00, -2.5, 5.2, 28500000000, 850000000000, 19500000, 1),
    ('ETH', 'Ethereum', 3200.00, -1.8, 3.7, 15200000000, 385000000000, 120300000, 2),
    ('USDT', 'Tether', 1.00, 0.01, -0.02, 42000000000, 83000000000, 83000000000, 3),
    ('BNB', 'BNB', 310.00, 1.2, -2.1, 1800000000, 47500000000, 153000000, 4),
    ('XRP', 'XRP', 0.52, 3.5, 8.9, 1200000000, 28000000000, 53800000000, 5),
    ('USDC', 'USD Coin', 1.00, 0.00, 0.01, 5800000000, 25000000000, 25000000000, 6),
    ('STETH', 'Lido Staked ETH', 3195.00, -1.9, 3.5, 85000000, 30000000000, 9400000, 7),
    ('ADA', 'Cardano', 0.38, 2.8, -1.5, 285000000, 13500000000, 35500000000, 8),
    ('DOGE', 'Dogecoin', 0.075, 5.2, 12.8, 420000000, 10800000000, 144000000000, 9),
    ('SOL', 'Solana', 98.50, -3.2, 1.8, 1800000000, 42500000000, 431000000, 10),
    ('TRX', 'TRON', 0.105, 1.8, -0.5, 580000000, 9200000000, 87600000000, 11),
    ('LINK', 'Chainlink', 14.25, 0.8, 4.2, 450000000, 8100000000, 567000000, 12),
    ('MATIC', 'Polygon', 0.85, -1.5, 2.8, 385000000, 7900000000, 9300000000, 13),
    ('TON', 'The Open Network', 2.45, 4.8, 15.2, 28500000, 8400000000, 3430000000, 14),
    ('WBTC', 'Wrapped Bitcoin', 44950.00, -2.6, 5.1, 185000000, 7800000000, 173500, 15),
    ('ICP', 'Internet Computer', 5.85, 2.2, -3.8, 85000000, 2600000000, 444000000, 16),
    ('SHIB', 'Shiba Inu', 0.0000085, 6.8, 18.5, 125000000, 5000000000, 589000000000000, 17),
    ('UNI', 'Uniswap', 7.25, -0.5, 1.2, 98000000, 5400000000, 743000000, 18),
    ('DAI', 'Dai', 1.00, 0.02, -0.01, 145000000, 5300000000, 5300000000, 19),
    ('LTC', 'Litecoin', 72.80, 1.5, -2.8, 385000000, 5400000000, 74200000, 20)
ON CONFLICT (symbol) DO UPDATE SET
    price_usd = EXCLUDED.price_usd,
    change_24h = EXCLUDED.change_24h,
    change_7d = EXCLUDED.change_7d,
    volume_24h = EXCLUDED.volume_24h,
    market_cap = EXCLUDED.market_cap,
    last_updated = NOW();

-- =====================================================
-- SEED NEWS ARTICLES DATA
-- =====================================================
INSERT INTO public.news_articles (title, summary, source, url, category, sentiment, tags, published_at)
VALUES 
    (
        'Bitcoin ETF Sees Record Inflows as Institutional Adoption Grows',
        'Major Bitcoin ETFs recorded their highest single-day inflows this year as institutional investors continue to embrace cryptocurrency exposure.',
        'CryptoNews',
        'https://example.com/news/bitcoin-etf-record-inflows-2024',
        'bitcoin',
        'positive',
        ARRAY['bitcoin', 'etf', 'institutional', 'adoption'],
        NOW() - INTERVAL '2 hours'
    ),
    (
        'Ethereum Layer 2 Solutions Reach New Transaction Volume Milestone',
        'Layer 2 scaling solutions on Ethereum processed over 10 million transactions in a single day, marking a significant milestone for network scalability.',
        'BlockchainDaily',
        'https://example.com/news/ethereum-l2-milestone-2024',
        'ethereum',
        'positive',
        ARRAY['ethereum', 'layer2', 'scalability', 'volume'],
        NOW() - INTERVAL '4 hours'
    ),
    (
        'Regulatory Clarity Expected as Crypto Bills Advance in Congress',
        'Several cryptocurrency-focused bills are making progress through Congress, potentially providing much-needed regulatory clarity for the industry.',
        'CryptoRegWatch',
        'https://example.com/news/crypto-bills-congress-2024',
        'regulation',
        'positive',
        ARRAY['regulation', 'congress', 'clarity', 'legislation'],
        NOW() - INTERVAL '6 hours'
    ),
    (
        'DeFi Protocol Suffers $50M Exploit, Security Concerns Rise',
        'A major DeFi lending protocol was exploited for $50 million, raising questions about smart contract security in the decentralized finance sector.',
        'DeFiAlert',
        'https://example.com/news/defi-exploit-50m-2024',
        'defi',
        'negative',
        ARRAY['defi', 'exploit', 'security', 'hack'],
        NOW() - INTERVAL '8 hours'
    ),
    (
        'Central Bank Digital Currency Pilot Programs Expand Globally',
        'More than 20 countries are now actively testing or implementing central bank digital currencies, signaling a shift toward digital money.',
        'GlobalFinance',
        'https://example.com/news/cbdc-pilot-programs-2024',
        'general',
        'neutral',
        ARRAY['cbdc', 'central-bank', 'digital-currency', 'pilot'],
        NOW() - INTERVAL '12 hours'
    ),
    (
        'NFT Market Shows Signs of Recovery with New Utility-Focused Projects',
        'The NFT market is showing renewed interest as projects focus more on utility and real-world applications rather than speculative trading.',
        'NFTNews',
        'https://example.com/news/nft-market-recovery-utility-2024',
        'nft',
        'positive',
        ARRAY['nft', 'recovery', 'utility', 'applications'],
        NOW() - INTERVAL '1 day'
    )
ON CONFLICT (url) DO NOTHING;

-- =====================================================
-- SAMPLE TRADING SIGNALS (SYSTEM GENERATED)
-- =====================================================
INSERT INTO public.trading_signals (
    signal_provider_id,
    pair,
    action,
    entry_price,
    target_price,
    stop_loss,
    confidence,
    timeframe,
    signal_type,
    analysis,
    tags,
    risk_reward_ratio,
    expires_at
)
VALUES 
    (
        NULL, -- System generated
        'BTC/USDT',
        'BUY',
        44800.00,
        46500.00,
        43500.00,
        75,
        '4H',
        'AI',
        'Technical analysis indicates a bullish reversal pattern forming. RSI oversold conditions with strong support at current levels.',
        ARRAY['bullish', 'reversal', 'support'],
        1.31,
        NOW() + INTERVAL '24 hours'
    ),
    (
        NULL,
        'ETH/USDT',
        'SELL',
        3220.00,
        3050.00,
        3350.00,
        68,
        '1H',
        'AI',
        'Bearish divergence detected on hourly chart. Resistance at 3250 level holding strong.',
        ARRAY['bearish', 'divergence', 'resistance'],
        1.31,
        NOW() + INTERVAL '12 hours'
    ),
    (
        NULL,
        'SOL/USDT',
        'BUY',
        97.50,
        105.00,
        92.00,
        82,
        '1D',
        'AI',
        'Strong fundamentals combined with technical breakout above key resistance. High volume confirmation.',
        ARRAY['breakout', 'volume', 'fundamentals'],
        1.36,
        NOW() + INTERVAL '3 days'
    )
ON CONFLICT DO NOTHING;

-- =====================================================
-- SAMPLE SYSTEM NOTIFICATIONS
-- =====================================================
INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    priority
)
SELECT 
    up.user_id,
    'Welcome to Zignal Trading Platform',
    'Explore our advanced trading signals, portfolio tracking, and analytics tools to enhance your trading journey.',
    'info',
    'normal'
FROM public.user_profiles up
WHERE up.created_at > NOW() - INTERVAL '1 hour'
ON CONFLICT DO NOTHING;