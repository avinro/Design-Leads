export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      account_members: {
        Row: {
          account_id: string
          created_at: string
          id: string
          invited_at: string
          joined_at: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          id?: string
          invited_at?: string
          joined_at?: string | null
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          id?: string
          invited_at?: string
          joined_at?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_members_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          plan: string
          settings: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          plan?: string
          settings?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          plan?: string
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          account_id: string
          author_id: string
          body: string
          created_at: string
          deliverable_id: string | null
          id: string
          milestone_id: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          author_id: string
          body: string
          created_at?: string
          deliverable_id?: string | null
          id?: string
          milestone_id?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          author_id?: string
          body?: string
          created_at?: string
          deliverable_id?: string | null
          id?: string
          milestone_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          ip_address: string | null
          message: string
          name: string
          notification_error: string | null
          notification_status: string
          notified_at: string | null
          user_agent: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          message: string
          name: string
          notification_error?: string | null
          notification_status?: string
          notified_at?: string | null
          user_agent?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          message?: string
          name?: string
          notification_error?: string | null
          notification_status?: string
          notified_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      deliverables: {
        Row: {
          account_id: string
          created_at: string
          external_link: string | null
          file_path: string | null
          id: string
          milestone_id: string
          status: string
          title: string
          type: string
          updated_at: string
          uploaded_at: string | null
        }
        Insert: {
          account_id: string
          created_at?: string
          external_link?: string | null
          file_path?: string | null
          id?: string
          milestone_id: string
          status?: string
          title: string
          type: string
          updated_at?: string
          uploaded_at?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string
          external_link?: string | null
          file_path?: string | null
          id?: string
          milestone_id?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_forms: {
        Row: {
          account_id: string
          created_at: string
          id: string
          project_id: string
          responses: Json | null
          schema: Json
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          id?: string
          project_id: string
          responses?: Json | null
          schema?: Json
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          id?: string
          project_id?: string
          responses?: Json | null
          schema?: Json
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_forms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          account_id: string
          created_at: string
          description: string | null
          display_order: number
          due_at: string | null
          id: string
          name: string
          project_id: string
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          description?: string | null
          display_order?: number
          due_at?: string | null
          id?: string
          name: string
          project_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          description?: string | null
          display_order?: number
          due_at?: string | null
          id?: string
          name?: string
          project_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          account_id: string
          created_at: string
          current_phase: string
          description: string | null
          id: string
          name: string
          owner_id: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          current_phase?: string
          description?: string | null
          id?: string
          name: string
          owner_id?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          current_phase?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      system_owners: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      account_role: { Args: { p_account_id: string }; Returns: string }
      is_account_member: { Args: { p_account_id: string }; Returns: boolean }
      is_account_owner: { Args: { p_account_id: string }; Returns: boolean }
      is_project_owner: { Args: { p_project_id: string }; Returns: boolean }
      is_system_owner: { Args: never; Returns: boolean }
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

