export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          category: string
          co2_kg: number
          details: Json | null
          id: string
          logged_at: string
          user_id: string
        }
        Insert: {
          category: string
          co2_kg?: number
          details?: Json | null
          id?: string
          logged_at?: string
          user_id: string
        }
        Update: {
          category?: string
          co2_kg?: number
          details?: Json | null
          id?: string
          logged_at?: string
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          badge_name: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_name: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_name?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      eco_tips: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          difficulty?: string
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      emission_sources: {
        Row: {
          category: string
          co2_per_unit: number
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
          unit: string
        }
        Insert: {
          category: string
          co2_per_unit?: number
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          unit: string
        }
        Update: {
          category?: string
          co2_per_unit?: number
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          unit?: string
        }
        Relationships: []
      }
      facts: {
        Row: {
          created_at: string
          fact_text: string
          id: string
          is_active: boolean
          source: string | null
        }
        Insert: {
          created_at?: string
          fact_text: string
          id?: string
          is_active?: boolean
          source?: string | null
        }
        Update: {
          created_at?: string
          fact_text?: string
          id?: string
          is_active?: boolean
          source?: string | null
        }
        Relationships: []
      }
      goal_templates: {
        Row: {
          category: string
          created_at: string
          difficulty: string
          duration_days: number
          id: string
          is_active: boolean
          name: string
          target_co2_kg: number
        }
        Insert: {
          category?: string
          created_at?: string
          difficulty?: string
          duration_days?: number
          id?: string
          is_active?: boolean
          name: string
          target_co2_kg?: number
        }
        Update: {
          category?: string
          created_at?: string
          difficulty?: string
          duration_days?: number
          id?: string
          is_active?: boolean
          name?: string
          target_co2_kg?: number
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          id: string
          user_id: string
          weekly_target: number
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          weekly_target?: number
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          weekly_target?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          author_name: string | null
          category: string
          content: string | null
          created_at: string
          description: string
          external_url: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_published: boolean
          thumbnail_url: string | null
          title: string
          type: string
          url: string
        }
        Insert: {
          author_name?: string | null
          category?: string
          content?: string | null
          created_at?: string
          description: string
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_published?: boolean
          thumbnail_url?: string | null
          title: string
          type?: string
          url?: string
        }
        Update: {
          author_name?: string | null
          category?: string
          content?: string | null
          created_at?: string
          description?: string
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_published?: boolean
          thumbnail_url?: string | null
          title?: string
          type?: string
          url?: string
        }
        Relationships: []
      }
      tip_feedback: {
        Row: {
          created_at: string
          id: string
          is_helpful: boolean
          tip_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_helpful: boolean
          tip_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_helpful?: boolean
          tip_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notes: {
        Row: {
          color: string
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          content?: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          achievement_alerts: boolean
          action_suggestions: boolean
          created_at: string
          daily_reminder: boolean
          eco_tips: boolean
          email_notifications: boolean
          goal_reminders: boolean
          id: string
          onboarding_completed: boolean
          updated_at: string
          user_id: string
          weekly_co2_target: number
          weekly_summary: boolean
        }
        Insert: {
          achievement_alerts?: boolean
          action_suggestions?: boolean
          created_at?: string
          daily_reminder?: boolean
          eco_tips?: boolean
          email_notifications?: boolean
          goal_reminders?: boolean
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
          user_id: string
          weekly_co2_target?: number
          weekly_summary?: boolean
        }
        Update: {
          achievement_alerts?: boolean
          action_suggestions?: boolean
          created_at?: string
          daily_reminder?: boolean
          eco_tips?: boolean
          email_notifications?: boolean
          goal_reminders?: boolean
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
          user_id?: string
          weekly_co2_target?: number
          weekly_summary?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
