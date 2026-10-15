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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          auto_approve_beta: boolean
          auto_publish_contributions: boolean
          id: string
          project_referral_percent: number
          referral_xp_per_signup: number
          scoring_delay_hours: number
          telegram_chat_id: string | null
          telegram_enabled: boolean
          telegram_notify_feed: boolean
          telegram_notify_tasks: boolean
          updated_at: string
        }
        Insert: {
          auto_approve_beta?: boolean
          auto_publish_contributions?: boolean
          id?: string
          project_referral_percent?: number
          referral_xp_per_signup?: number
          scoring_delay_hours?: number
          telegram_chat_id?: string | null
          telegram_enabled?: boolean
          telegram_notify_feed?: boolean
          telegram_notify_tasks?: boolean
          updated_at?: string
        }
        Update: {
          auto_approve_beta?: boolean
          auto_publish_contributions?: boolean
          id?: string
          project_referral_percent?: number
          referral_xp_per_signup?: number
          scoring_delay_hours?: number
          telegram_chat_id?: string | null
          telegram_enabled?: boolean
          telegram_notify_feed?: boolean
          telegram_notify_tasks?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      beta_requests: {
        Row: {
          admin_notes: string | null
          code: string | null
          created_at: string
          email: string
          expires_at: string | null
          from_waitlist: boolean
          id: string
          max_uses: number
          name: string | null
          reason: string | null
          referred_by: string | null
          requested_role: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          uses_count: number
          x_handle: string | null
        }
        Insert: {
          admin_notes?: string | null
          code?: string | null
          created_at?: string
          email: string
          expires_at?: string | null
          from_waitlist?: boolean
          id?: string
          max_uses?: number
          name?: string | null
          reason?: string | null
          referred_by?: string | null
          requested_role?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          uses_count?: number
          x_handle?: string | null
        }
        Update: {
          admin_notes?: string | null
          code?: string | null
          created_at?: string
          email?: string
          expires_at?: string | null
          from_waitlist?: boolean
          id?: string
          max_uses?: number
          name?: string | null
          reason?: string | null
          referred_by?: string | null
          requested_role?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          uses_count?: number
          x_handle?: string | null
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
          {
            foreignKeyName: "contribution_engagements_contribution_id_fkey"
            columns: ["contribution_id"]
            isOneToOne: false
            referencedRelation: "contributions_feed"
            referencedColumns: ["id"]
          },
        ]
      }
      contributions: {
        Row: {
          admin_notes: string | null
          ai_feedback: string | null
          ai_generated: boolean
          ai_score: number | null
          content_type: string
          created_at: string
          engagement_count: number
          id: string
          manual_score: number | null
          media_type: string
          points_earned: number
          post_author: string | null
          post_fetched_at: string | null
          post_text: string | null
          post_url: string
          project_id: string | null
          published_to_feed: boolean
          status: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          ai_feedback?: string | null
          ai_generated?: boolean
          ai_score?: number | null
          content_type?: string
          created_at?: string
          engagement_count?: number
          id?: string
          manual_score?: number | null
          media_type?: string
          points_earned?: number
          post_author?: string | null
          post_fetched_at?: string | null
          post_text?: string | null
          post_url: string
          project_id?: string | null
          published_to_feed?: boolean
          status?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          ai_feedback?: string | null
          ai_generated?: boolean
          ai_score?: number | null
          content_type?: string
          created_at?: string
          engagement_count?: number
          id?: string
          manual_score?: number | null
          media_type?: string
          points_earned?: number
          post_author?: string | null
          post_fetched_at?: string | null
          post_text?: string | null
          post_url?: string
          project_id?: string | null
          published_to_feed?: boolean
          status?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contributions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      feedback_reports: {
        Row: {
          created_at: string
          id: string
          kind: string
          message: string
          status: string
          subject: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          message: string
          status?: string
          subject: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          message?: string
          status?: string
          subject?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string
          owner_email: string
          owner_user_id: string
          used_at: string | null
          used_by_email: string | null
        }
        Insert: {
          code: string
          created_at?: string
          owner_email: string
          owner_user_id: string
          used_at?: string | null
          used_by_email?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          owner_email?: string
          owner_user_id?: string
          used_at?: string | null
          used_by_email?: string | null
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
          beta_code: string | null
          created_at: string | null
          email: string
          id: string
          name: string | null
          referral_code: string
          referral_count: number | null
          referred_by: string | null
          total_points: number | null
          user_id: string
          waitlist_completed: boolean | null
          x_shared: boolean | null
          x_username: string | null
          x_verified: boolean
          x_verified_at: string | null
        }
        Insert: {
          beta_code?: string | null
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          referral_code?: string
          referral_count?: number | null
          referred_by?: string | null
          total_points?: number | null
          user_id: string
          waitlist_completed?: boolean | null
          x_shared?: boolean | null
          x_username?: string | null
          x_verified?: boolean
          x_verified_at?: string | null
        }
        Update: {
          beta_code?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          referral_code?: string
          referral_count?: number | null
          referred_by?: string | null
          total_points?: number | null
          user_id?: string
          waitlist_completed?: boolean | null
          x_shared?: boolean | null
          x_username?: string | null
          x_verified?: boolean
          x_verified_at?: string | null
        }
        Relationships: []
      }
      project_ai_config: {
        Row: {
          api_key: string | null
          consent_at: string | null
          consent_by: string | null
          created_at: string
          key_hint: string | null
          model: string
          project_id: string
          provider: string
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          consent_at?: string | null
          consent_by?: string | null
          created_at?: string
          key_hint?: string | null
          model?: string
          project_id: string
          provider?: string
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          consent_at?: string | null
          consent_by?: string | null
          created_at?: string
          key_hint?: string | null
          model?: string
          project_id?: string
          provider?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_ai_config_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          project_id: string
          revoked_at: string | null
          scope: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name?: string
          project_id: string
          revoked_at?: string | null
          scope?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          project_id?: string
          revoked_at?: string | null
          scope?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_api_keys_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_contributor_lists: {
        Row: {
          created_at: string
          created_by: string | null
          emails: string[]
          id: string
          name: string
          note: string | null
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          emails?: string[]
          id?: string
          name: string
          note?: string | null
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          emails?: string[]
          id?: string
          name?: string
          note?: string | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_contributor_lists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string
          email: string
          id: string
          member_role: string
          project_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          member_role?: string
          project_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          member_role?: string
          project_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_referrals: {
        Row: {
          commission_percent: number
          contact_email: string | null
          created_at: string
          id: string
          note: string | null
          project_name: string
          referrer_email: string
          status: string
        }
        Insert: {
          commission_percent?: number
          contact_email?: string | null
          created_at?: string
          id?: string
          note?: string | null
          project_name: string
          referrer_email: string
          status?: string
        }
        Update: {
          commission_percent?: number
          contact_email?: string | null
          created_at?: string
          id?: string
          note?: string | null
          project_name?: string
          referrer_email?: string
          status?: string
        }
        Relationships: []
      }
      project_requests: {
        Row: {
          admin_notes: string | null
          code: string | null
          created_at: string
          discord: string | null
          email: string
          estimated_budget: string | null
          expectations: string | null
          expires_at: string | null
          founder_name: string
          goal: string | null
          id: string
          investment_ready: boolean | null
          logo_data_url: string | null
          project_name: string
          raidfi_community_opt_in: boolean
          referred_by: string | null
          request_types: string[]
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          telegram: string | null
          telegram_bot_added: boolean
          telegram_group_id: string | null
          website: string | null
          why: string | null
          x_handle: string | null
        }
        Insert: {
          admin_notes?: string | null
          code?: string | null
          created_at?: string
          discord?: string | null
          email: string
          estimated_budget?: string | null
          expectations?: string | null
          expires_at?: string | null
          founder_name: string
          goal?: string | null
          id?: string
          investment_ready?: boolean | null
          logo_data_url?: string | null
          project_name: string
          raidfi_community_opt_in?: boolean
          referred_by?: string | null
          request_types?: string[]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          telegram?: string | null
          telegram_bot_added?: boolean
          telegram_group_id?: string | null
          website?: string | null
          why?: string | null
          x_handle?: string | null
        }
        Update: {
          admin_notes?: string | null
          code?: string | null
          created_at?: string
          discord?: string | null
          email?: string
          estimated_budget?: string | null
          expectations?: string | null
          expires_at?: string | null
          founder_name?: string
          goal?: string | null
          id?: string
          investment_ready?: boolean | null
          logo_data_url?: string | null
          project_name?: string
          raidfi_community_opt_in?: boolean
          referred_by?: string | null
          request_types?: string[]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          telegram?: string | null
          telegram_bot_added?: boolean
          telegram_group_id?: string | null
          website?: string | null
          why?: string | null
          x_handle?: string | null
        }
        Relationships: []
      }
      project_saved_views: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          id: string
          kind: string
          name: string
          project_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          name: string
          project_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          name?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_saved_views_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          contact_email: string
          created_at: string
          description: string | null
          discord: string | null
          founder_name: string | null
          id: string
          is_private: boolean
          name: string
          slug: string
          status: string
          telegram: string | null
          telegram_bot_added: boolean
          telegram_group_id: string | null
          trust_score: number
          updated_at: string
          verification: string
          website: string | null
          x_handle: string | null
          x_verified: boolean
          x_verified_at: string | null
        }
        Insert: {
          contact_email: string
          created_at?: string
          description?: string | null
          discord?: string | null
          founder_name?: string | null
          id?: string
          is_private?: boolean
          name: string
          slug: string
          status?: string
          telegram?: string | null
          telegram_bot_added?: boolean
          telegram_group_id?: string | null
          trust_score?: number
          updated_at?: string
          verification?: string
          website?: string | null
          x_handle?: string | null
          x_verified?: boolean
          x_verified_at?: string | null
        }
        Update: {
          contact_email?: string
          created_at?: string
          description?: string | null
          discord?: string | null
          founder_name?: string | null
          id?: string
          is_private?: boolean
          name?: string
          slug?: string
          status?: string
          telegram?: string | null
          telegram_bot_added?: boolean
          telegram_group_id?: string | null
          trust_score?: number
          updated_at?: string
          verification?: string
          website?: string | null
          x_handle?: string | null
          x_verified?: boolean
          x_verified_at?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
      telegram_link_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          used: boolean
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          used?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          used?: boolean
        }
        Relationships: []
      }
      telegram_links: {
        Row: {
          dm_subscribed: boolean
          email: string
          first_name: string | null
          linked_at: string
          telegram_chat_id: number
          telegram_user_id: number
          telegram_username: string | null
        }
        Insert: {
          dm_subscribed?: boolean
          email: string
          first_name?: string | null
          linked_at?: string
          telegram_chat_id: number
          telegram_user_id: number
          telegram_username?: string | null
        }
        Update: {
          dm_subscribed?: boolean
          email?: string
          first_name?: string | null
          linked_at?: string
          telegram_chat_id?: number
          telegram_user_id?: number
          telegram_username?: string | null
        }
        Relationships: []
      }
      telegram_pending_submissions: {
        Row: {
          chat_id: number
          created_at: string
          email: string
          expires_at: string
          message_id: number | null
          post_url: string
          telegram_user_id: number
          token: string
        }
        Insert: {
          chat_id: number
          created_at?: string
          email: string
          expires_at?: string
          message_id?: number | null
          post_url: string
          telegram_user_id: number
          token: string
        }
        Update: {
          chat_id?: number
          created_at?: string
          email?: string
          expires_at?: string
          message_id?: number | null
          post_url?: string
          telegram_user_id?: number
          token?: string
        }
        Relationships: []
      }
      telegram_updates: {
        Row: {
          chat_id: number | null
          created_at: string
          raw_update: Json
          text: string | null
          update_id: number
          user_id: number | null
        }
        Insert: {
          chat_id?: number | null
          created_at?: string
          raw_update: Json
          text?: string | null
          update_id: number
          user_id?: number | null
        }
        Update: {
          chat_id?: number | null
          created_at?: string
          raw_update?: Json
          text?: string | null
          update_id?: number
          user_id?: number | null
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
      contributions_feed: {
        Row: {
          ai_feedback: string | null
          ai_score: number | null
          author_name: string | null
          content_type: string | null
          created_at: string | null
          engagement_count: number | null
          id: string | null
          manual_score: number | null
          points_earned: number | null
          post_author: string | null
          post_text: string | null
          post_url: string | null
          project_id: string | null
          project_name: string | null
          project_slug: string | null
          published_to_feed: boolean | null
          referral_code: string | null
          status: string | null
          user_id: string | null
          x_username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contributions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_public: {
        Row: {
          contribution_xp: number | null
          display_name: string | null
          total_xp: number | null
          updated_at: string | null
          validation_xp: number | null
          waitlist_xp: number | null
        }
        Insert: {
          contribution_xp?: number | null
          display_name?: string | null
          total_xp?: number | null
          updated_at?: string | null
          validation_xp?: number | null
          waitlist_xp?: number | null
        }
        Update: {
          contribution_xp?: number | null
          display_name?: string | null
          total_xp?: number | null
          updated_at?: string | null
          validation_xp?: number | null
          waitlist_xp?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_beta_code:
        | { Args: { _code: string }; Returns: Json }
        | { Args: { _code: string; _email?: string }; Returns: Json }
      check_email_exists: { Args: { check_email: string }; Returns: boolean }
      claim_project_memberships: { Args: never; Returns: number }
      consume_beta_code: {
        Args: { _code?: string; _email?: string; _referred_by?: string }
        Returns: Json
      }
      contact_email_exists: { Args: { _email: string }; Returns: boolean }
      create_project_api_key: {
        Args: { _name: string; _project_id: string; _scope: string }
        Returns: string
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      ensure_user_role: { Args: never; Returns: undefined }
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
      get_my_invite_codes: {
        Args: never
        Returns: {
          code: string
          created_at: string
          owner_email: string
          owner_user_id: string
          used_at: string | null
          used_by_email: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "invite_codes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_profile_tags: {
        Args: { _referral_code: string }
        Returns: {
          tag: string
        }[]
      }
      get_scoring_delay_hours: { Args: never; Returns: number }
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
      is_project_admin: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      is_project_member: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      is_super_or_admin: { Args: { _user_id: string }; Returns: boolean }
      mark_waitlist_x_shared: { Args: { _id: string }; Returns: undefined }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      process_referral: { Args: { referrer_code: string }; Returns: undefined }
      project_activity: {
        Args: {
          _from?: string
          _limit?: number
          _offset?: number
          _only_project?: boolean
          _project_id: string
          _to?: string
        }
        Returns: {
          ai_generated: boolean
          content_type: string
          created_at: string
          display_name: string
          email: string
          id: string
          is_project: boolean
          media_type: string
          points_earned: number
          post_text: string
          post_url: string
          referral_code: string
          score: number
          status: string
          x_username: string
        }[]
      }
      project_ai_status: { Args: { _project_id: string }; Returns: Json }
      project_contributor_analytics: {
        Args: { _from?: string; _project_id: string; _to?: string }
        Returns: {
          acceptance_rate: number
          accepted: number
          active_days: number
          active_weeks: number
          ai_generated_count: number
          avg_quality: number
          contributions: number
          display_name: string
          email: string
          first_contribution: string
          last_contribution: string
          max_quality: number
          pending: number
          project_accepted: number
          project_contributions: number
          project_last: string
          project_xp: number
          referral_code: string
          rejected: number
          total_xp: number
          x_username: string
          xp_earned: number
        }[]
      }
      project_period_stats: {
        Args: { _from: string; _project_id: string; _to: string }
        Returns: Json
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      recalculate_all_leaderboard_scores: { Args: never; Returns: undefined }
      recalculate_leaderboard_score: {
        Args: { _email: string }
        Returns: undefined
      }
      redeem_beta_code: {
        Args: { _code: string; _email: string }
        Returns: boolean
      }
      refresh_whitepaper_live: { Args: never; Returns: undefined }
      update_waitlist_task_email: {
        Args: { _new_email: string; _old_email: string }
        Returns: undefined
      }
      x_handle_taken: { Args: { _handle: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user" | "moderator" | "super_admin" | "project_admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user", "moderator", "super_admin", "project_admin"],
    },
  },
} as const
