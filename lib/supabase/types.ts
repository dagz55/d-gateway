export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string
          avatar_url: string | null
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name: string
          avatar_url?: string | null
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string
          avatar_url?: string | null
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      trades: {
        Row: {
          id: string
          user_id: string
          pair: string
          side: 'BUY' | 'SELL'
          amount: number
          price: number
          pnl: number | null
          status: 'OPEN' | 'CLOSED'
          time: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pair: string
          side: 'BUY' | 'SELL'
          amount: number
          price: number
          pnl?: number | null
          status?: 'OPEN' | 'CLOSED'
          time?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pair?: string
          side?: 'BUY' | 'SELL'
          amount?: number
          price?: number
          pnl?: number | null
          status?: 'OPEN' | 'CLOSED'
          time?: string
          created_at?: string
        }
      }
      signals: {
        Row: {
          id: string
          user_id: string
          pair: string
          action: 'BUY' | 'SELL' | 'HOLD'
          target_price: number
          stop_loss: number | null
          status: 'ACTIVE' | 'EXPIRED' | 'TRIGGERED'
          confidence: number
          issued_at: string
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pair: string
          action: 'BUY' | 'SELL' | 'HOLD'
          target_price: number
          stop_loss?: number | null
          status?: 'ACTIVE' | 'EXPIRED' | 'TRIGGERED'
          confidence?: number
          issued_at?: string
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pair?: string
          action?: 'BUY' | 'SELL' | 'HOLD'
          target_price?: number
          stop_loss?: number | null
          status?: 'ACTIVE' | 'EXPIRED' | 'TRIGGERED'
          confidence?: number
          issued_at?: string
          expires_at?: string | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'DEPOSIT' | 'WITHDRAWAL'
          amount: number
          currency: 'USD' | 'USDT' | 'PHP'
          status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
          method: string | null
          destination: string | null
          reference: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'DEPOSIT' | 'WITHDRAWAL'
          amount: number
          currency: 'USD' | 'USDT' | 'PHP'
          status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
          method?: string | null
          destination?: string | null
          reference?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'DEPOSIT' | 'WITHDRAWAL'
          amount?: number
          currency?: 'USD' | 'USDT' | 'PHP'
          status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
          method?: string | null
          destination?: string | null
          reference?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }
      crypto_prices: {
        Row: {
          id: string
          symbol: string
          price: number
          change_24h: number
          volume_24h: number
          market_cap: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          symbol: string
          price: number
          change_24h: number
          volume_24h: number
          market_cap?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          symbol?: string
          price?: number
          change_24h?: number
          volume_24h?: number
          market_cap?: number | null
          updated_at?: string
        }
      }
      news: {
        Row: {
          id: string
          title: string
          summary: string | null
          source: string
          url: string
          image_url: string | null
          published_at: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          summary?: string | null
          source: string
          url: string
          image_url?: string | null
          published_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          summary?: string | null
          source?: string
          url?: string
          image_url?: string | null
          published_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}