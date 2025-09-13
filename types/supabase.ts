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
          user_id: string
          email_address: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          email_address: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          email_address?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_dashboard_stats: {
        Args: {
          user_uuid: string
        }
        Returns: Json
      }
      get_user_balance: {
        Args: {
          user_uuid: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}