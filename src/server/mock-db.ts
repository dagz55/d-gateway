import { CryptoPrice, DashboardStats, NewsItem, Signal, Trade, Transaction, User } from '@/types';

// Mock database - in-memory storage
export const mockDb = {
  users: new Map<string, User>(),
  trades: new Map<string, Trade>(),
  signals: new Map<string, Signal>(),
  transactions: new Map<string, Transaction>(),
  news: new Map<string, NewsItem>(),
  otpCodes: new Map<string, { code: string; expiresAt: Date; email: string }>(),
  sessions: new Map<string, { userId: string; expiresAt: Date }>(),
};

// Initialize with empty data
export function initializeMockData() {
  // Database starts empty - no sample data
  // Users, trades, signals, transactions, and news will be added through the application
  
  // Add a test user for development
  const testUser: User = {
    id: '1',
    email: 'dagz55@gmail.com',
    username: 'dagz55',
    fullName: 'John Doe',
    password: 'password123', // Default password for testing
    age: 28,
    gender: 'MALE',
    traderLevel: 'ADVANCED',
    accountBalance: 12500.75,
    isVerified: true,
    package: 'PREMIUM',
    status: 'ONLINE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  mockDb.users.set('1', testUser);
}

// Generate empty crypto price data (no mock data)
export function generateCryptoPriceData(days: number = 7): CryptoPrice[] {
  // Return empty array - real data should be fetched from external APIs
  return [];
}

// Helper functions
export function getUserById(id: string): User | undefined {
  return mockDb.users.get(id);
}

export function getUserByUsername(username: string): User | undefined {
  for (const user of mockDb.users.values()) {
    if (user.username === username) {
      return user;
    }
  }
  return undefined;
}

export function getUserByEmail(email: string): User | undefined {
  for (const user of mockDb.users.values()) {
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
}

export function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
  const id = (mockDb.users.size + 1).toString();
  const user: User = {
    ...userData,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockDb.users.set(id, user);
  return user;
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const user = mockDb.users.get(id);
  if (!user) return undefined;
  
  const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
  mockDb.users.set(id, updatedUser);
  return updatedUser;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(email: string, code: string): void {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  mockDb.otpCodes.set(email, { code, expiresAt, email });
}

export function verifyOTP(email: string, code: string): boolean {
  const stored = mockDb.otpCodes.get(email);
  if (!stored) return false;
  
  if (new Date() > stored.expiresAt) {
    mockDb.otpCodes.delete(email);
    return false;
  }
  
  return stored.code === code;
}

export function clearOTP(email: string): void {
  mockDb.otpCodes.delete(email);
}

export function updateUserPassword(email: string, newPassword: string): boolean {
  const user = getUserByEmail(email);
  if (!user) return false;
  
  // In a real app, you would hash the password here
  // For demo purposes, we'll just update the user object
  const updatedUser = {
    ...user,
    updatedAt: new Date().toISOString(),
  };
  
  mockDb.users.set(user.id, updatedUser);
  return true;
}

export function getDashboardStats(): DashboardStats {
  const userTrades = Array.from(mockDb.trades.values());
  const userTransactions = Array.from(mockDb.transactions.values()).filter(tx => tx.status === 'COMPLETED');
  const userSignals = Array.from(mockDb.signals.values()).filter(signal => signal.status === 'ACTIVE');
  
  const totalDeposits = userTransactions
    .filter(tx => tx.type === 'DEPOSIT')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const totalWithdrawals = userTransactions
    .filter(tx => tx.type === 'WITHDRAWAL')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const balance = totalDeposits - totalWithdrawals;
  const pnlToday = userTrades
    .filter(trade => {
      const tradeDate = new Date(trade.time);
      const today = new Date();
      return tradeDate.toDateString() === today.toDateString();
    })
    .reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  
  const winningTrades = userTrades.filter(trade => (trade.pnl || 0) > 0).length;
  const winRate = userTrades.length > 0 ? (winningTrades / userTrades.length) * 100 : 0;
  
  const lastDeposit = userTransactions
    .filter(tx => tx.type === 'DEPOSIT')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.amount;

  return {
    balance,
    pnlToday,
    openSignals: userSignals.length,
    lastDeposit,
    totalTrades: userTrades.length,
    winRate: Math.round(winRate * 100) / 100,
  };
}

// Initialize data on module load
initializeMockData();
