export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          handle: string | null;
          niche: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          handle?: string | null;
          niche?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          handle?: string | null;
          niche?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      generated_scripts: {
        Row: {
          id: string;
          user_id: string;
          client_id: string | null;
          topic: string;
          hook: string;
          content: string;
          cta: string;
          viral_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id?: string | null;
          topic: string;
          hook: string;
          content: string;
          cta: string;
          viral_score?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string | null;
          topic?: string;
          hook?: string;
          content?: string;
          cta?: string;
          viral_score?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      social_accounts: {
        Row: {
          id: string;
          user_id: string;
          platform: string;
          username: string | null;
          connected: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: string;
          username?: string | null;
          connected?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          platform?: string;
          username?: string | null;
          connected?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          hook: string | null;
          hashtags: string[] | null;
          status: string;
          scheduled_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          hook?: string | null;
          hashtags?: string[] | null;
          status?: string;
          scheduled_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          hook?: string | null;
          hashtags?: string[] | null;
          status?: string;
          scheduled_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      seo_pages: {
        Row: {
          id: string;
          user_id: string;
          slug: string;
          title: string | null;
          meta_description: string | null;
          content: string | null;
          indexed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          slug: string;
          title?: string | null;
          meta_description?: string | null;
          content?: string | null;
          indexed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          slug?: string;
          title?: string | null;
          meta_description?: string | null;
          content?: string | null;
          indexed?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      ai_usage_quotas: {
        Row: {
          daily_count: number;
          last_reset: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          daily_count?: number;
          last_reset?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          daily_count?: number;
          last_reset?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_usage_quotas_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          country: string | null;
          created_at: string;
          email: string | null;
          free_plan: boolean;
          id: string;
          tiktok_creator: boolean;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          country?: string | null;
          created_at?: string;
          email?: string | null;
          free_plan?: boolean;
          id: string;
          tiktok_creator?: boolean;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          country?: string | null;
          created_at?: string;
          email?: string | null;
          free_plan?: boolean;
          id?: string;
          tiktok_creator?: boolean;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      tiktok_scripts: {
        Row: {
          created_at: string;
          hashtags: string[] | null;
          id: string;
          is_viral_candidate: boolean;
          niche: string | null;
          script_content: Json;
          tone: string | null;
          topic: string;
          user_id: string;
          viral_score: number;
        };
        Insert: {
          created_at?: string;
          hashtags?: string[] | null;
          id?: string;
          is_viral_candidate?: boolean;
          niche?: string | null;
          script_content: Json;
          tone?: string | null;
          topic: string;
          user_id: string;
          viral_score?: number;
        };
        Update: {
          created_at?: string;
          hashtags?: string[] | null;
          id?: string;
          is_viral_candidate?: boolean;
          niche?: string | null;
          script_content?: Json;
          tone?: string | null;
          topic?: string;
          user_id?: string;
          viral_score?: number;
        };
        Relationships: [
          {
            foreignKeyName: "tiktok_scripts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      trends: {
        Row: {
          category: string | null;
          created_at: string;
          description: string | null;
          growth: number;
          hashtag: string;
          id: string;
          last_updated: string;
          topic: string;
          viral_score: number;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          growth?: number;
          hashtag: string;
          id?: string;
          last_updated?: string;
          topic: string;
          viral_score?: number;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          growth?: number;
          hashtag?: string;
          id?: string;
          last_updated?: string;
          topic?: string;
          viral_score?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_ai_quota: {
        Args: { p_user_id: string };
        Returns: {
          daily_count: number;
          last_reset: string;
        }[];
      };
      increment_ai_quota: { Args: { p_user_id: string }; Returns: undefined };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
