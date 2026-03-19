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
      contribute_task_completions: {
        Row: {
          completed_at: string | null
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
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
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          label: string
          points: number
          sort_order: number | null
          task_type: string
          url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          points?: number
          sort_order?: number | null
          task_type?: string
          url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          points?: number
          sort_order?: number | null
          task_type?: string
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
          ai_feedback: string | null
          ai_score: number | null
          created_at: string
          engagement_count: number
          id: string
          points_earned: number
          post_url: string
          status: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          ai_feedback?: string | null
          ai_score?: number | null
          created_at?: string
          engagement_count?: number
          id?: string
          points_earned?: number
          post_url: string
          status?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          ai_feedback?: string | null
          ai_score?: number | null
          created_at?: string
          engagement_count?: number
          id?: string
          points_earned?: number
          post_url?: string
          status?: string
          user_email?: string
          user_id?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_email_exists: { Args: { check_email: string }; Returns: boolean }
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      process_referral: { Args: { referrer_code: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
