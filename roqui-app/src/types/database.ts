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
      reservations: {
        Row: {
          id: string
          guest_name: string
          platform: 'Airbnb' | 'Booking' | 'Directa'
          check_in: string
          check_out: string
          nights: number
          price_per_night: number
          cleaning_fee: number
          platform_fee: number
          caretaker_cost: number
          gross_income: number
          net_income: number
          status: 'confirmed' | 'cancelled' | 'pending'
          notes: string | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          guest_name: string
          platform: 'Airbnb' | 'Booking' | 'Directa'
          check_in: string
          check_out: string
          nights: number
          price_per_night: number
          cleaning_fee: number
          platform_fee: number
          caretaker_cost: number
          gross_income: number
          net_income: number
          status?: 'confirmed' | 'cancelled' | 'pending'
          notes?: string | null
          created_at?: string
          user_id?: string
        }
        Update: {
          id?: string
          guest_name?: string
          platform?: 'Airbnb' | 'Booking' | 'Directa'
          check_in?: string
          check_out?: string
          nights?: number
          price_per_night?: number
          cleaning_fee?: number
          platform_fee?: number
          caretaker_cost?: number
          gross_income?: number
          net_income?: number
          status?: 'confirmed' | 'cancelled' | 'pending'
          notes?: string | null
          created_at?: string
          user_id?: string
        }
      }
      expenses: {
        Row: {
          id: string
          category: string
          amount: number
          currency: 'USD' | 'CRC'
          date: string
          description: string | null
          receipt_url: string | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          category: string
          amount: number
          currency?: 'USD' | 'CRC'
          date: string
          description?: string | null
          receipt_url?: string | null
          created_at?: string
          user_id?: string
        }
        Update: {
          id?: string
          category?: string
          amount?: number
          currency?: 'USD' | 'CRC'
          date?: string
          description?: string | null
          receipt_url?: string | null
          created_at?: string
          user_id?: string
        }
      }
      settings: {
        Row: {
          id: string
          base_price: number
          exchange_rate: number
          cleaning_fee: number
          airbnb_fee: number
          booking_fee: number
          caretaker_fee: number
          wifi_name: string | null
          wifi_password: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          base_price?: number
          exchange_rate?: number
          cleaning_fee?: number
          airbnb_fee?: number
          booking_fee?: number
          caretaker_fee?: number
          wifi_name?: string | null
          wifi_password?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          base_price?: number
          exchange_rate?: number
          cleaning_fee?: number
          airbnb_fee?: number
          booking_fee?: number
          caretaker_fee?: number
          wifi_name?: string | null
          wifi_password?: string | null
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'viewer'
          full_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'admin' | 'viewer'
          full_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'viewer'
          full_name?: string | null
          created_at?: string
        }
      }
      images: {
        Row: {
          id: string
          category: string
          url: string
          description: string | null
          is_main: boolean
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          category: string
          url: string
          description?: string | null
          is_main?: boolean
          created_at?: string
          user_id?: string
        }
        Update: {
          id?: string
          category?: string
          url?: string
          description?: string | null
          is_main?: boolean
          created_at?: string
          user_id?: string
        }
      }
      notes: {
        Row: {
          id: string
          title: string
          content: string
          category: string
          date: string
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category?: string
          date: string
          created_at?: string
          user_id?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string
          date?: string
          created_at?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
