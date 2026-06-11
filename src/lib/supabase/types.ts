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
          created_at: string
          email: string
        }
        Insert: {
          id: string
          email: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
        }
      }
      social_accounts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          platform: string
          username: string
          connected: boolean
          access_token: string
          refresh_token: string
          expires_at: string
        }
        Insert: {
          user_id: string
          platform: string
          username: string
          connected: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          platform?: string
          username?: string
          connected?: boolean
          access_token?: string
          refresh_token?: string
          expires_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          social_account_id: string
          status: string
          topic: string
          viral_score: number
          hook: string
          content: string
          cta: string
        }
        Insert: {
          social_account_id: string
          status: string
          topic: string
          viral_score: number
          hook: string
          content: string
          cta: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          social_account_id?: string
          status?: string
          topic?: string
          viral_score?: number
          hook?: string
          content?: string
          cta?: string
        }
      }
      sync_jobs: {
        Row: {
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
