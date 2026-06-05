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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          auto_publish_contributions: boolean
          id: string
          scoring_delay_hours: number
          telegram_chat_id: string | null
          telegram_enabled: boolean
          telegram_notify_feed: boolean
          telegram_notify_tasks: boolean
          updated_at: string
        }
        Insert: {
          auto_publish_contributions?: boolean
          id?: string
          scoring_delay_hours?: number
          telegram_chat_id?: string | null
          telegram_enabled?: boolean
          telegram_notify_feed?: boolean
          telegram_notify_tasks?: boolean
          updated_at?: string
        }
        Update: {
          auto_publish_contributions?: boolean
          id?: string
          scoring_delay_hours?: number
          telegram_chat_id?: string | null
          telegram_enabled?: boolean
          telegram_notify_feed?: boolean
          telegram_notify_tasks?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      content_types: {
        Row: {
          created_at: string
          default_points: number
          id: string
          is_active: boolean
          label: string
          sort_order: number
          value: string
        }
        Insert: {
          created_at?: string
          default_points?: number
          id?: string
          is_active?: boolean
          label: string
          sort_order?: number
          value: string
        }
        Update: {
          created_at?: string
          default_points?: number
          id?: string
          is_active?: boolean
          label?: string
          sort_order?: number
          value?: string
        }
        Relationships: []
      }
      contribute_task_completions: {
        Row: {
          completed_at: string | null
          id: string
          submission_link: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          submission_link?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          submission_link?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contribute_task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "contribute_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      contribute_tasks: {
        Row: {
          action_types: string[]
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_pinned: boolean
          label: string
          points: number
          requires_link_submission: boolean
          sort_order: number | null
          submission_label: string | null
          submission_placeholder: string | null
          task_type: string
          telegram_notified: boolean
          url: string | null
        }
        Insert: {
          action_types?: string[]
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_pinned?: boolean
          label: string
          points?: number
          requires_link_submission?: boolean
          sort_order?: number | null
          submission_label?: string | null
          submission_placeholder?: string | null
          task_type?: string
          telegram_notified?: boolean
          url?: string | null
        }
        Update: {
          action_types?: string[]
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_pinned?: boolean
          label?: string
          points?: number
          requires_link_submission?: boolean
          sort_order?: number | null
          submission_label?: string | null
          submission_placeholder?: string | null
          task_type?: string
          telegram_notified?: boolean
          url?: string | null
        }
        Relationships: []
      }
      contribution_engagements: {
        Row: {
          contribution_id: string
          created_at: string
          id: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          contribution_id: string
          created_at?: string
          id?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          contribution_id?: string
          created_at?: string
          id?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contribution_engagements_contribution_id_fkey"
            columns: ["contribution_id"]
            isOneToOne: false
            referencedRelation: "contributions"
            referencedColumns: ["id"]
          },
        ]
      }
      contributions: {
        Row: {
          admin_notes: string | null
          ai_feedback: string | null
          ai_score: number | null
          content_type: string
          created_at: string
          engagement_count: number
          id: string
          manual_score: number | null
          points_earned: number
          post_author: string | null
          post_fetched_at: string | null
          post_image_url: string | null
          post_text: string | null
          post_url: string
          published_to_feed: boolean
          status: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          ai_feedback?: string | null
          ai_score?: number | null
          content_type?: string
          created_at?: string
          engagement_count?: number
          id?: string
          manual_score?: number | null
          points_earned?: number
          post_author?: string | null
          post_fetched_at?: string | null
          post_image_url?: string | null
          post_text?: string | null
          post_url: string
          published_to_feed?: boolean
          status?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          ai_feedback?: string | null
          ai_score?: number | null
          content_type?: string
          created_at?: string
          engagement_count?: number
          id?: string
          manual_score?: number | null
          points_earned?: number
          post_author?: string | null
          post_fetched_at?: string | null
          post_image_url?: string | null
          post_text?: string | null
          post_url?: string
          published_to_feed?: boolean
          status?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      leaderboard_scores: {
        Row: {
          contribution_xp: number
          display_name: string
          email: string
          total_xp: number
          updated_at: string
          validation_xp: number
          waitlist_xp: number
        }
        Insert: {
          contribution_xp?: number
          display_name: string
          email: string
          total_xp?: number
          updated_at?: string
          validation_xp?: number
          waitlist_xp?: number
        }
        Update: {
          contribution_xp?: number
          display_name?: string
          email?: string
          total_xp?: number
          updated_at?: string
          validation_xp?: number
          waitlist_xp?: number
        }
        Relationships: []
      }
      moderator_permissions: {
        Row: {
          created_at: string
          id: string
          permission: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_tags: {
        Row: {
          created_at: string
          id: string
          tag: string
          user_email: string
        }
        Insert: {
          created_at?: string
          id?: string
          tag: string
          user_email: string
        }
        Update: {
          created_at?: string
          id?: string
          tag?: string
          user_email?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          referral_code: string
          referral_count: number | null
          total_points: number | null
          user_id: string
          waitlist_completed: boolean | null
          x_shared: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          referral_code?: string
          referral_count?: number | null
          total_points?: number | null
          user_id: string
          waitlist_completed?: boolean | null
          x_shared?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          referral_code?: string
          referral_count?: number | null
          total_points?: number | null
          user_id?: string
          waitlist_completed?: boolean | null
          x_shared?: boolean | null
        }
        Relationships: []
      }
      task_action_types: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          sort_order: number
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          sort_order?: number
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          sort_order?: number
          value?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          points: number
          user_email: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          points?: number
          user_email: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          points?: number
          user_email?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      validation_submissions: {
        Row: {
          created_at: string
          email: string
          expected_budget: string | null
          experience: string | null
          form_responses: Json | null
          id: string
          name: string
          points_earned: number
          project_description: string | null
          project_name: string | null
          project_website: string | null
          role: string
          telegram_handle: string | null
          twitter_handle: string | null
          user_id: string | null
          why_interested: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expected_budget?: string | null
          experience?: string | null
          form_responses?: Json | null
          id?: string
          name: string
          points_earned?: number
          project_description?: string | null
          project_name?: string | null
          project_website?: string | null
          role: string
          telegram_handle?: string | null
          twitter_handle?: string | null
          user_id?: string | null
          why_interested?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expected_budget?: string | null
          experience?: string | null
          form_responses?: Json | null
          id?: string
          name?: string
          points_earned?: number
          project_description?: string | null
          project_name?: string | null
          project_website?: string | null
          role?: string
          telegram_handle?: string | null
          twitter_handle?: string | null
          user_id?: string | null
          why_interested?: string | null
        }
        Relationships: []
      }
      waitlist_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          points: number
          referral_code: string | null
          referred_by: string | null
          user_id: string | null
          x_shared: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          points?: number
          referral_code?: string | null
          referred_by?: string | null
          user_id?: string | null
          x_shared?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          points?: number
          referral_code?: string | null
          referred_by?: string | null
          user_id?: string | null
          x_shared?: boolean | null
        }
        Relationships: []
      }
      waitlist_task_submissions: {
        Row: {
          clicked_at: string | null
          created_at: string | null
          id: string
          input_value: string | null
          submission_email: string
          task_id: string
          verified_at: string | null
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string | null
          id?: string
          input_value?: string | null
          submission_email: string
          task_id: string
          verified_at?: string | null
        }
        Update: {
          clicked_at?: string | null
          created_at?: string | null
          id?: string
          input_value?: string | null
          submission_email?: string
          task_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_task_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "waitlist_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_tasks: {
        Row: {
          created_at: string | null
          id: string
          input_label: string | null
          input_placeholder: string | null
          is_active: boolean | null
          label: string
          requires_input: boolean | null
          sort_order: number | null
          task_type: string
          url: string
          verification_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          input_label?: string | null
          input_placeholder?: string | null
          is_active?: boolean | null
          label: string
          requires_input?: boolean | null
          sort_order?: number | null
          task_type: string
          url: string
          verification_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          input_label?: string | null
          input_placeholder?: string | null
          is_active?: boolean | null
          label?: string
          requires_input?: boolean | null
          sort_order?: number | null
          task_type?: string
          url?: string
          verification_type?: string | null
        }
        Relationships: []
      }
      whitepaper: {
        Row: {
          content: string
          created_at: string
          id: string
          is_published: boolean
          updated_at: string
          version: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_published?: boolean
          updated_at?: string
          version?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_published?: boolean
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      whitepaper_changelogs: {
        Row: {
          created_at: string
          description: string
          id: string
          version: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          version: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          version?: string
        }
        Relationships: []
      }
      whitepaper_live: {
        Row: {
          content: string
          created_at: string
          id: string
          source_whitepaper_id: string | null
          updated_at: string
          version: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          source_whitepaper_id?: string | null
          updated_at?: string
          version?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          source_whitepaper_id?: string | null
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_email_exists: { Args: { check_email: string }; Returns: boolean }
      generate_referral_code: { Args: never; Returns: string }
      get_leaderboard: {
        Args: { _period?: string }
        Returns: {
          display_name: string
          email: string
          overall_rank: number
          period_xp: number
          total_xp: number
        }[]
      }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      process_referral: { Args: { referrer_code: string }; Returns: undefined }
      recalculate_all_leaderboard_scores: { Args: never; Returns: undefined }
      recalculate_leaderboard_score: {
        Args: { _email: string }
        Returns: undefined
      }
      refresh_whitepaper_live: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user" | "moderator"
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
    Enums: {
      app_role: ["admin", "user", "moderator"],
    },
  },
} as const
