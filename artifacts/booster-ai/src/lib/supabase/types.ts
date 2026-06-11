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
          email: string | null
        }
        Insert: {
          id: string
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string | null
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
          refresh_token: string | null
          expires_at: string | null
        }
        Insert: {
          user_id: string
          platform: string
          username: string
          connected?: boolean
          access_token?: string
          refresh_token?: string | null
          expires_at?: string | null
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
          refresh_token?: string | null
          expires_at?: string | null
        }
      }
      posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string | null
          social_account_id: string | null
          content: string
          topic: string | null
          hook: string | null
          cta: string | null
          viral_score: number | null
          status: string
          scheduled_at: string | null
        }
        Insert: {
          user_id?: string | null
          social_account_id?: string | null
          content?: string
          topic?: string | null
          hook?: string | null
          cta?: string | null
          viral_score?: number | null
          status?: string
          scheduled_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          social_account_id?: string | null
          content?: string
          topic?: string | null
          hook?: string | null
          cta?: string | null
          viral_score?: number | null
          status?: string
          scheduled_at?: string | null
        }
      }
      sync_jobs: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string | null
          social_account_id: string | null
          status: string
          payload: Json | null
        }
        Insert: {
          user_id?: string | null
          social_account_id?: string | null
          status?: string
          payload?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
          social_account_id?: string | null
          status?: string
          payload?: Json | null
        }
      }
      trends: {
        Row: {
          id: string
          created_at: string
          hashtag: string
          topic: string | null
          viral_score: number
          growth: number | null
          platform: string | null
        }
        Insert: {
          hashtag: string
          topic?: string | null
          viral_score?: number
          growth?: number | null
          platform?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          hashtag?: string
          topic?: string | null
          viral_score?: number
          growth?: number | null
          platform?: string | null
        }
      }
      clients: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          handle: string | null
          niche: string | null
          notes: string | null
        }
        Insert: {
          user_id: string
          name: string
          handle?: string | null
          niche?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          handle?: string | null
          niche?: string | null
          notes?: string | null
        }
      }
      generated_scripts: {
        Row: {
          id: string
          created_at: string
          user_id: string
          client_id: string | null
          topic: string
          hook: string | null
          content: string | null
          cta: string | null
          viral_score: number | null
        }
        Insert: {
          user_id: string
          client_id?: string | null
          topic: string
          hook?: string | null
          content?: string | null
          cta?: string | null
          viral_score?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          client_id?: string | null
          topic?: string
          hook?: string | null
          content?: string | null
          cta?: string | null
          viral_score?: number | null
        }
      }
      social_analytics: {
        Row: {
          id: string
          created_at: string
          user_id: string
          social_account_id: string | null
          metric_name: string
          metric_value: number | null
          recorded_at: string
        }
        Insert: {
          user_id: string
          social_account_id?: string | null
          metric_name: string
          metric_value?: number | null
          recorded_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          social_account_id?: string | null
          metric_name?: string
          metric_value?: number | null
          recorded_at?: string
        }
      }
      sync_audit_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string | null
          sync_job_id: string | null
          action: string
          status: string
          message: string | null
        }
        Insert: {
          user_id?: string | null
          sync_job_id?: string | null
          action: string
          status?: string
          message?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string | null
          sync_job_id?: string | null
          action?: string
          status?: string
          message?: string | null
        }
      }
      ai_optimization_cache: {
        Row: {
          id: string
          created_at: string
          user_id: string
          cache_key: string
          result: Json
          expires_at: string | null
        }
        Insert: {
          user_id: string
          cache_key: string
          result: Json
          expires_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          cache_key?: string
          result?: Json
          expires_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_sync_jobs: {
        Args: { uid: string }
        Returns: Database["public"]["Tables"]["sync_jobs"]["Row"][]
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

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]
