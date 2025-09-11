export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  password?: string; // Optional for security - not always returned
  avatarUrl?: string;
  age?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  traderLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'PROFESSIONAL';
  accountBalance: number;
  isVerified: boolean;
  package: 'BASIC' | 'PREMIUM' | 'PRO' | 'VIP';
  status: 'ONLINE' | 'IDLE' | 'OFFLINE';
  createdAt: string;
  updatedAt: string;
}

export interface Trade {
  id: string;
  pair: string;
  side: 'BUY' | 'SELL';
  price: number;
  qty: number;
  time: string;
  pnl?: number;
}

export interface Signal {
  id: string;
  pair: string;
  action: 'BUY' | 'SELL';
  entry: number;
  sl: number; // Stop Loss
  tp: number[]; // Take Profit levels
  issuedAt: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  currency: 'USD' | 'USDT' | 'PHP';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  method?: string;
  destination?: string;
  createdAt: string;
  completedAt?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary?: string;
}

export interface CryptoPrice {
  t: string;
  close: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangeUsernameData {
  currentUsername: string;
  newUsername: string;
}

export interface DepositData {
  amount: number;
  currency: 'USD' | 'USDT' | 'PHP';
  method: string;
}

export interface WithdrawData {
  amount: number;
  currency: 'USD' | 'USDT' | 'PHP';
  destination: string;
}

export interface OTPResponse {
  otp: string;
  expiresAt: string;
  message: string;
}

export interface DashboardStats {
  balance: number;
  pnlToday: number;
  openSignals: number;
  lastDeposit?: number;
  totalTrades: number;
  winRate: number;
}
