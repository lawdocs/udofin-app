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
          full_name: string | null
          language: string | null
          mobile: string | null
          secondary_phone: string | null
          email: string | null
          pin: string | null
          theme: string | null
          biometrics_enabled: boolean
          notifications_push: boolean
          notifications_email: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          language?: string | null
          mobile?: string | null
          secondary_phone?: string | null
          email?: string | null
          pin?: string | null
          theme?: string | null
          biometrics_enabled?: boolean
          notifications_push?: boolean
          notifications_email?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          language?: string | null
          mobile?: string | null
          secondary_phone?: string | null
          email?: string | null
          pin?: string | null
          theme?: string | null
          biometrics_enabled?: boolean
          notifications_push?: boolean
          notifications_email?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
