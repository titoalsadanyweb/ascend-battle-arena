export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          bonus_tokens: number | null
          category: string
          created_at: string | null
          description: string
          icon_name: string | null
          id: string
          name: string
          rarity: string | null
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          bonus_tokens?: number | null
          category: string
          created_at?: string | null
          description: string
          icon_name?: string | null
          id?: string
          name: string
          rarity?: string | null
          requirement_type: string
          requirement_value: number
        }
        Update: {
          bonus_tokens?: number | null
          category?: string
          created_at?: string | null
          description?: string
          icon_name?: string | null
          id?: string
          name?: string
          rarity?: string | null
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      allies: {
        Row: {
          ally_id: string
          id: string
          paired_at: string | null
          preferences_matched: Json | null
          status: string
          user_id: string
        }
        Insert: {
          ally_id: string
          id?: string
          paired_at?: string | null
          preferences_matched?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          ally_id?: string
          id?: string
          paired_at?: string | null
          preferences_matched?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "allies_ally_id_fkey"
            columns: ["ally_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ally_feed: {
        Row: {
          ally_id: string
          created_at: string | null
          details: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          ally_id: string
          created_at?: string | null
          details: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          ally_id?: string
          created_at?: string | null
          details?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ally_feed_ally_id_fkey"
            columns: ["ally_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ally_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bets: {
        Row: {
          amount: number
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bets_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          message: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          message?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          message?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          created_at: string
          date_local: string
          id: string
          status: string
          tokens_awarded: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date_local: string
          id?: string
          status: string
          tokens_awarded: number
          user_id: string
        }
        Update: {
          created_at?: string
          date_local?: string
          id?: string
          status?: string
          tokens_awarded?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commitments: {
        Row: {
          ally_id: string | null
          created_at: string | null
          description: string | null
          duration_days: number | null
          end_date: string
          failure_count: number | null
          id: string
          stake_amount: number
          start_date: string
          status: string
          success_streak: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ally_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          end_date: string
          failure_count?: number | null
          id?: string
          stake_amount: number
          start_date: string
          status?: string
          success_streak?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ally_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          end_date?: string
          failure_count?: number | null
          id?: string
          stake_amount?: number
          start_date?: string
          status?: string
          success_streak?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commitments_ally_id_fkey"
            columns: ["ally_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commitments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string | null
          created_at: string
          id: string
          media_url: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          media_url?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          media_url?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_theme: string | null
          best_streak: number
          bio: string | null
          country: string | null
          created_at: string
          current_streak: number
          id: string
          language: string | null
          last_check_in_date: string | null
          looking_for_ally: boolean | null
          match_preferences: Json | null
          nationality_preference: string | null
          preferences: Json | null
          preferred_countries: string[] | null
          preferred_languages: string[] | null
          preferred_religions: string[] | null
          rank: string | null
          religion: string | null
          secondary_language: string | null
          timezone: string
          token_balance: number
          updated_at: string
          username: string
        }
        Insert: {
          avatar_theme?: string | null
          best_streak?: number
          bio?: string | null
          country?: string | null
          created_at?: string
          current_streak?: number
          id?: string
          language?: string | null
          last_check_in_date?: string | null
          looking_for_ally?: boolean | null
          match_preferences?: Json | null
          nationality_preference?: string | null
          preferences?: Json | null
          preferred_countries?: string[] | null
          preferred_languages?: string[] | null
          preferred_religions?: string[] | null
          rank?: string | null
          religion?: string | null
          secondary_language?: string | null
          timezone: string
          token_balance?: number
          updated_at?: string
          username: string
        }
        Update: {
          avatar_theme?: string | null
          best_streak?: number
          bio?: string | null
          country?: string | null
          created_at?: string
          current_streak?: number
          id?: string
          language?: string | null
          last_check_in_date?: string | null
          looking_for_ally?: boolean | null
          match_preferences?: Json | null
          nationality_preference?: string | null
          preferences?: Json | null
          preferred_countries?: string[] | null
          preferred_languages?: string[] | null
          preferred_religions?: string[] | null
          rank?: string | null
          religion?: string | null
          secondary_language?: string | null
          timezone?: string
          token_balance?: number
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      quest_completions: {
        Row: {
          completed_at: string | null
          date_local: string
          energy_selected: string | null
          id: string
          mood_selected: string | null
          quest_id: string
          shared_with_ally: boolean | null
          submission_text: string | null
          tokens_awarded: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          date_local: string
          energy_selected?: string | null
          id?: string
          mood_selected?: string | null
          quest_id: string
          shared_with_ally?: boolean | null
          submission_text?: string | null
          tokens_awarded?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          date_local?: string
          energy_selected?: string | null
          id?: string
          mood_selected?: string | null
          quest_id?: string
          shared_with_ally?: boolean | null
          submission_text?: string | null
          tokens_awarded?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quest_completions_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quest_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quest_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          date_local: string
          id: string
          progress_data: Json | null
          quest_id: string
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          date_local: string
          id?: string
          progress_data?: Json | null
          quest_id: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          date_local?: string
          id?: string
          progress_data?: Json | null
          quest_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quest_sessions_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quest_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quest_swaps: {
        Row: {
          created_at: string | null
          date_local: string
          id: string
          original_quest_id: string
          swapped_quest_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_local: string
          id?: string
          original_quest_id: string
          swapped_quest_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_local?: string
          id?: string
          original_quest_id?: string
          swapped_quest_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quest_swaps_original_quest_id_fkey"
            columns: ["original_quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quest_swaps_swapped_quest_id_fkey"
            columns: ["swapped_quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quest_swaps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quests: {
        Row: {
          cooldown_days: number | null
          created_at: string | null
          difficulty_level: number
          energy_level: string | null
          estimated_minutes: number | null
          id: string
          is_active: boolean | null
          max_streak: number | null
          min_streak: number | null
          mood: string | null
          rarity: string | null
          tags: Json | null
          text_prompt: string
          type: string
        }
        Insert: {
          cooldown_days?: number | null
          created_at?: string | null
          difficulty_level?: number
          energy_level?: string | null
          estimated_minutes?: number | null
          id?: string
          is_active?: boolean | null
          max_streak?: number | null
          min_streak?: number | null
          mood?: string | null
          rarity?: string | null
          tags?: Json | null
          text_prompt: string
          type: string
        }
        Update: {
          cooldown_days?: number | null
          created_at?: string | null
          difficulty_level?: number
          energy_level?: string | null
          estimated_minutes?: number | null
          id?: string
          is_active?: boolean | null
          max_streak?: number | null
          min_streak?: number | null
          mood?: string | null
          rarity?: string | null
          tags?: Json | null
          text_prompt?: string
          type?: string
        }
        Relationships: []
      }
      reflection_prompts: {
        Row: {
          context_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          max_streak: number | null
          min_streak: number | null
          prompt_text: string
        }
        Insert: {
          context_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_streak?: number | null
          min_streak?: number | null
          prompt_text: string
        }
        Update: {
          context_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_streak?: number | null
          min_streak?: number | null
          prompt_text?: string
        }
        Relationships: []
      }
      token_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          related_checkin_id: string | null
          related_commitment_id: string | null
          related_quest_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          related_checkin_id?: string | null
          related_commitment_id?: string | null
          related_quest_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          related_checkin_id?: string | null
          related_commitment_id?: string | null
          related_quest_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_transactions_related_checkin_id_fkey"
            columns: ["related_checkin_id"]
            isOneToOne: false
            referencedRelation: "check_ins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          bonus_tokens_awarded: number | null
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          bonus_tokens_awarded?: number | null
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          bonus_tokens_awarded?: number | null
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_resolve_expired_commitments: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_penalty_percentage: {
        Args: { failure_count: number }
        Returns: number
      }
      cancel_commitment: {
        Args: { p_commitment_id: string; p_user_id: string }
        Returns: undefined
      }
      check_completed_14_day_contract: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_completed_7_day_contract: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_daily_swap_limit: {
        Args: { p_user_id: string; p_date_local: string }
        Returns: boolean
      }
      complete_regroup_mission: {
        Args: {
          p_user_id: string
          p_mission_id: string
          p_reflection_text: string
        }
        Returns: Json
      }
      create_commitment: {
        Args: {
          p_user_id: string
          p_ally_id: string
          p_duration: number
          p_stake_amount: number
        }
        Returns: Json
      }
      create_commitment_with_ally_stake: {
        Args: {
          p_user_id: string
          p_ally_id: string
          p_duration: number
          p_user_stake: number
          p_ally_stake?: number
        }
        Returns: Json
      }
      create_regroup_mission: {
        Args: {
          p_user_id: string
          p_failed_commitment_id: string
          p_lost_tokens: number
        }
        Returns: Json
      }
      find_potential_allies: {
        Args: { p_user_id: string; p_limit?: number }
        Returns: {
          user_id: string
          username: string
          language: string
          secondary_language: string
          religion: string
          bio: string
          current_streak: number
          best_streak: number
          timezone: string
          match_score: number
        }[]
      }
      get_active_commitments: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          user_id: string
          ally_id: string
          start_date: string
          end_date: string
          duration_days: number
          stake_amount: number
          status: string
          created_at: string
          description: string
          failure_count: number
          success_streak: number
        }[]
      }
      get_user_commitments: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          user_id: string
          ally_id: string
          start_date: string
          end_date: string
          duration_days: number
          stake_amount: number
          status: string
          created_at: string
          description: string
          failure_count: number
          success_streak: number
        }[]
      }
      handle_checkin_transaction: {
        Args: {
          p_user_id: string
          p_date_local: string
          p_new_streak: number
          p_tokens_awarded: number
          p_best_streak: number
        }
        Returns: Json
      }
      handle_quest_completion: {
        Args: {
          p_user_id: string
          p_quest_id: string
          p_date_local: string
          p_submission_text: string
          p_tokens_awarded: number
          p_shared_with_ally: boolean
        }
        Returns: undefined
      }
      handle_quest_completion_with_session: {
        Args: {
          p_user_id: string
          p_quest_id: string
          p_date_local: string
          p_submission_text: string
          p_tokens_awarded: number
          p_shared_with_ally: boolean
          p_mood_selected?: string
          p_energy_selected?: string
        }
        Returns: Json
      }
      handle_quest_session: {
        Args: {
          p_user_id: string
          p_quest_id: string
          p_date_local: string
          p_action?: string
        }
        Returns: Json
      }
      process_commitment_checkins: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      resolve_commitment_with_penalty_escalation: {
        Args: { p_commitment_id: string }
        Returns: Json
      }
      reward_successful_commitment: {
        Args: { p_commitment_id: string }
        Returns: Json
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
