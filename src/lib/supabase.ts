import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client (for API routes)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

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
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'client'
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
          last_login: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'admin' | 'client'
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'client'
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
        }
      }
      clients: {
        Row: {
          id: string
          company_name: string
          status: 'lead' | 'prospect' | 'active' | 'inactive' | 'churned'
          industry: string | null
          website: string | null
          logo_url: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string | null
          postal_code: string | null
          gstin: string | null
          pan: string | null
          notes: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
      }
      // Add other tables as needed
    }
  }
}
