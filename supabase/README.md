# Zignal Database Migrations

This directory contains all database migrations for the Zignal trading platform.

## 📋 Migration Files

1. **`20250913000001_initial_zignal_setup.sql`** - Core database schema
   - User profiles and trading accounts
   - Trading signals and trades tracking
   - Portfolio holdings and watchlist
   - Crypto prices and news articles
   - Notifications and transactions
   - Copy trading and performance analytics
   - Database indexes for performance

2. **`20250913000002_rls_policies.sql`** - Row Level Security
   - User data protection policies
   - Trading account access control
   - Signal and trade visibility rules
   - Copy trading permission system

3. **`20250913000003_functions_triggers.sql`** - Database automation
   - User registration automation
   - Portfolio calculation functions
   - Trading performance analytics
   - Automatic timestamp updates
   - Trade execution handling

4. **`20250913000004_seed_data.sql`** - Initial data
   - Top 20 cryptocurrency prices
   - Sample news articles
   - System-generated trading signals
   - Welcome notifications

## 🚀 Deployment Options

### Option 1: Automated Script (Recommended)

```bash
# Install dependencies
npm install @supabase/supabase-js dotenv

# Run deployment script
node scripts/deploy-migrations.js
```

### Option 2: Supabase CLI

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Run migrations
supabase db push
```

### Option 3: Manual (SQL Editor)

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and execute each migration file in order
4. Verify successful execution

## 📊 Database Schema Overview

### Core Tables

- **`user_profiles`** - Extended user information and trading preferences
- **`trading_accounts`** - Multiple account support (demo/live/paper)
- **`trades`** - Trading history and P&L tracking
- **`trading_signals`** - AI and manual trading signals
- **`portfolio_holdings`** - Real-time portfolio tracking
- **`watchlist`** - User's favorite trading pairs

### Market Data

- **`crypto_prices`** - Real-time cryptocurrency prices
- **`news_articles`** - Crypto news and market updates

### Social Features

- **`copy_trading`** - Social trading relationships
- **`notifications`** - User alerts and messages
- **`performance_analytics`** - Trading statistics

### Financial

- **`transactions`** - Deposits, withdrawals, transfers

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **User isolation** - Users can only access their own data
- **Copy trading permissions** - Controlled access to trader data
- **Service role functions** - Admin operations with proper access control
- **Input validation** - Database-level constraints and checks

## 📈 Key Functions

- `get_dashboard_stats(user_id)` - Real-time dashboard metrics
- `calculate_portfolio_value(user_id, account_id)` - Portfolio valuation
- `calculate_win_rate(user_id, days)` - Trading performance metrics
- `update_portfolio_holding()` - Automatic portfolio updates
- `handle_new_user()` - User onboarding automation
- `handle_trade_execution()` - Trade lifecycle management

## 🎯 Features Enabled

✅ **User Management** - Registration, profiles, preferences  
✅ **Multi-Account Trading** - Demo, live, and paper accounts  
✅ **AI Trading Signals** - Automated signal generation  
✅ **Portfolio Tracking** - Real-time holdings and P&L  
✅ **Copy Trading** - Social trading platform  
✅ **Market Data** - Live crypto prices and news  
✅ **Performance Analytics** - Comprehensive trading stats  
✅ **Notifications** - Real-time alerts and updates  
✅ **Financial Operations** - Deposits and withdrawals  

## 🔧 Post-Migration Setup

After running migrations, you may want to:

1. **Configure OAuth providers** in Supabase Auth
2. **Set up real-time subscriptions** for live data
3. **Configure webhooks** for external integrations
4. **Set up scheduled functions** for price updates
5. **Configure email templates** for notifications

## 📝 Customization

To modify the schema:

1. Create new migration files with timestamp prefix
2. Follow existing naming convention: `YYYYMMDDHHMMSS_description.sql`
3. Test migrations on staging environment first
4. Update this README with new migration details

## ⚠️ Important Notes

- **Backup your database** before running migrations
- **Test on staging** environment first
- **Service role key** required for deployment script
- **Sequential execution** - Run migrations in order
- **Error handling** - Check logs if migrations fail

## 🆘 Troubleshooting

**Connection Issues:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `SUPABASE_SERVICE_ROLE_KEY` permissions
- Ensure network access to Supabase

**Migration Failures:**
- Check SQL syntax in migration files
- Verify table/column names don't conflict
- Review Supabase logs for detailed errors

**Permission Errors:**
- Confirm you're using service role key
- Check RLS policies aren't blocking operations
- Verify user authentication in your app

---

🚀 **Ready to start trading with Zignal!**