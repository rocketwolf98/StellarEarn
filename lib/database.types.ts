export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_activity: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          data: Json | null
          description: string
          id: number
          ledger_sequence: number | null
          recorded_at: string | null
          stellar_account_id: string
          txn_hash: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          data?: Json | null
          description: string
          id?: number
          ledger_sequence?: number | null
          recorded_at?: string | null
          stellar_account_id: string
          txn_hash?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          data?: Json | null
          description?: string
          id?: number
          ledger_sequence?: number | null
          recorded_at?: string | null
          stellar_account_id?: string
          txn_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_activity_stellar_account_id_fkey"
            columns: ["stellar_account_id"]
            isOneToOne: false
            referencedRelation: "stellar_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      gig_submissions: {
        Row: {
          approved_at: string | null
          approved_by_user_id: string | null
          description: string | null
          gig_id: string
          id: string
          notes: string | null
          payout_tx_hash: string | null
          reviewed_at: string | null
          status: string
          submission_url: string
          submitted_at: string
          twitter_url: string | null
          worker_name: string | null
          worker_user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by_user_id?: string | null
          description?: string | null
          gig_id: string
          id?: string
          notes?: string | null
          payout_tx_hash?: string | null
          reviewed_at?: string | null
          status?: string
          submission_url: string
          submitted_at?: string
          twitter_url?: string | null
          worker_name?: string | null
          worker_user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by_user_id?: string | null
          description?: string | null
          gig_id?: string
          id?: string
          notes?: string | null
          payout_tx_hash?: string | null
          reviewed_at?: string | null
          status?: string
          submission_url?: string
          submitted_at?: string
          twitter_url?: string | null
          worker_name?: string | null
          worker_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gig_submissions_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gig_submissions_worker_user_id_fkey"
            columns: ["worker_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gigs: {
        Row: {
          bg: string | null
          color: string | null
          created_at: string
          created_by_user_id: string
          deadline_at: string
          deliverables: string[]
          desc_short: string | null
          description: string
          featured: boolean
          fee_xlm: number
          id: string
          initials: string
          live: boolean
          org: string
          paid_at: string | null
          paid_by_user_id: string | null
          payment_tx_hash: string | null
          prize_php: number
          reward_amount: number
          reward_unit: string
          skill: string
          slug: string
          sponsor_name: string | null
          sponsor_wallet: string | null
          status: string
          submissions: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          bg?: string | null
          color?: string | null
          created_at?: string
          created_by_user_id: string
          deadline_at: string
          deliverables?: string[]
          desc_short?: string | null
          description: string
          featured?: boolean
          fee_xlm?: number
          id?: string
          initials: string
          live?: boolean
          org: string
          paid_at?: string | null
          paid_by_user_id?: string | null
          payment_tx_hash?: string | null
          prize_php: number
          reward_amount: number
          reward_unit?: string
          skill: string
          slug: string
          sponsor_name?: string | null
          sponsor_wallet?: string | null
          status?: string
          submissions?: number
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          bg?: string | null
          color?: string | null
          created_at?: string
          created_by_user_id?: string
          deadline_at?: string
          deliverables?: string[]
          desc_short?: string | null
          description?: string
          featured?: boolean
          fee_xlm?: number
          id?: string
          initials?: string
          live?: boolean
          org?: string
          paid_at?: string | null
          paid_by_user_id?: string | null
          payment_tx_hash?: string | null
          prize_php?: number
          reward_amount?: number
          reward_unit?: string
          skill?: string
          slug?: string
          sponsor_name?: string | null
          sponsor_wallet?: string | null
          status?: string
          submissions?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount_stroops: number | null
          asset_code: string | null
          asset_issuer: string | null
          confirmed_at: string | null
          created_at: string
          gig_id: string | null
          id: string
          metadata: Json
          network: Database["public"]["Enums"]["network_type"]
          operation: string
          status: Database["public"]["Enums"]["transaction_status"]
          stellar_public_key: string
          submission_id: string | null
          tx_hash: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_stroops?: number | null
          asset_code?: string | null
          asset_issuer?: string | null
          confirmed_at?: string | null
          created_at?: string
          gig_id?: string | null
          id?: string
          metadata?: Json
          network?: Database["public"]["Enums"]["network_type"]
          operation: string
          status?: Database["public"]["Enums"]["transaction_status"]
          stellar_public_key: string
          submission_id?: string | null
          tx_hash: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_stroops?: number | null
          asset_code?: string | null
          asset_issuer?: string | null
          confirmed_at?: string | null
          created_at?: string
          gig_id?: string | null
          id?: string
          metadata?: Json
          network?: Database["public"]["Enums"]["network_type"]
          operation?: string
          status?: Database["public"]["Enums"]["transaction_status"]
          stellar_public_key?: string
          submission_id?: string | null
          tx_hash?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "gig_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_created_at: string | null
          account_status: Database["public"]["Enums"]["account_status"] | null
          auth_provider: Database["public"]["Enums"]["auth_provider_type"] | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          id: string
          last_login_at: string | null
          location: string | null
          password_hash: string | null
          role: string
          sep10_challenge_created_at: string | null
          sep10_challenge_xdr: string | null
          stellar_public_key: string
          updated_at: string | null
          username: string
          wallet_verified_at: string | null
        }
        Insert: {
          account_created_at?: string | null
          account_status?: Database["public"]["Enums"]["account_status"] | null
          auth_provider?: Database["public"]["Enums"]["auth_provider_type"] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          id?: string
          last_login_at?: string | null
          location?: string | null
          password_hash?: string | null
          role?: string
          sep10_challenge_created_at?: string | null
          sep10_challenge_xdr?: string | null
          stellar_public_key: string
          updated_at?: string | null
          username: string
          wallet_verified_at?: string | null
        }
        Update: {
          account_created_at?: string | null
          account_status?: Database["public"]["Enums"]["account_status"] | null
          auth_provider?: Database["public"]["Enums"]["auth_provider_type"] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          id?: string
          last_login_at?: string | null
          location?: string | null
          password_hash?: string | null
          role?: string
          sep10_challenge_created_at?: string | null
          sep10_challenge_xdr?: string | null
          stellar_public_key?: string
          updated_at?: string | null
          username?: string
          wallet_verified_at?: string | null
        }
        Relationships: []
      }
      wallet_auth_challenges: {
        Row: {
          challenge_hash: string
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          stellar_public_key: string
        }
        Insert: {
          challenge_hash: string
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          stellar_public_key: string
        }
        Update: {
          challenge_hash?: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          stellar_public_key?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      account_status: "pending" | "active" | "suspended" | "closed"
      activity_type:
        | "account_created"
        | "trustline_added"
        | "payment_sent"
        | "payment_received"
        | "balance_updated"
        | "minimum_balance_alert"
        | "error"
      auth_provider_type: "sep10" | "email"
      funding_method: "friendbot" | "createAccount" | "exchange" | "sponsor"
      funding_status_type: "pending" | "completed" | "failed"
      network_type: "testnet" | "mainnet"
      transaction_status:
        | "pending_signature"
        | "signed"
        | "submitted"
        | "confirmed"
        | "failed"
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
