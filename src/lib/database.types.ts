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
          language: string | null
          mobile: string | null
          email: string | null
          pin: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          language?: string | null
          mobile?: string | null
          email?: string | null
          pin?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          language?: string | null
          mobile?: string | null
          email?: string | null
          pin?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
