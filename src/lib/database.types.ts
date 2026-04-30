export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string;
          full_name: string;
          email: string;
          role: 'user' | 'admin' | 'trader';
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          user_id?: string;
          full_name: string;
          email: string;
          role?: 'user' | 'admin' | 'trader';
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      traders: {
        Row: {
          trader_id: string;
          user_id: string | null;
          shop_name: string;
          description: string | null;
          contact_phone: string | null;
          contact_whatsapp: string | null;
          city: string | null;
          image_url: string | null;
          rating: number;
          verified: boolean;
          status: 'active' | 'pending' | 'suspended';
          created_at: string;
        };
        Insert: {
          trader_id?: string;
          user_id?: string | null;
          shop_name: string;
          description?: string | null;
          contact_phone?: string | null;
          contact_whatsapp?: string | null;
          city?: string | null;
          image_url?: string | null;
          rating?: number;
          verified?: boolean;
          status?: 'active' | 'pending' | 'suspended';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['traders']['Insert']>;
      };
      admins: {
        Row: {
          admin_id: string;
          user_id: string;
          permissions: Json;
          created_at: string;
        };
        Insert: {
          admin_id?: string;
          user_id: string;
          permissions?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['admins']['Insert']>;
      };
      date_types: {
        Row: {
          date_type_id: string;
          name_ar: string;
          name_en: string;
          description_ar: string | null;
          description_en: string | null;
          image_url: string | null;
          season: string | null;
          category: 'premium' | 'fresh' | 'dried';
          calories: number | null;
          created_at: string;
        };
        Insert: {
          date_type_id?: string;
          name_ar: string;
          name_en: string;
          description_ar?: string | null;
          description_en?: string | null;
          image_url?: string | null;
          season?: string | null;
          category?: 'premium' | 'fresh' | 'dried';
          calories?: number | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['date_types']['Insert']>;
      };
      exhibitions: {
        Row: {
          exhibition_id: string;
          name_ar: string;
          name_en: string;
          city: string;
          place: string | null;
          start_date: string | null;
          end_date: string | null;
          time_info: string | null;
          description_ar: string | null;
          description_en: string | null;
          status: 'upcoming' | 'active' | 'ended';
          created_at: string;
        };
        Insert: {
          exhibition_id?: string;
          name_ar: string;
          name_en: string;
          city: string;
          place?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          time_info?: string | null;
          description_ar?: string | null;
          description_en?: string | null;
          status?: 'upcoming' | 'active' | 'ended';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['exhibitions']['Insert']>;
      };
      sales: {
        Row: {
          sale_id: string;
          trader_id: string | null;
          date_type_id: string | null;
          quantity: number;
          price_per_unit: number;
          total_price: number;
          sale_date: string;
          market_name: string | null;
          status: 'pending' | 'confirmed' | 'cancelled';
          created_at: string;
        };
        Insert: {
          sale_id?: string;
          trader_id?: string | null;
          date_type_id?: string | null;
          quantity: number;
          price_per_unit: number;
          sale_date?: string;
          market_name?: string | null;
          status?: 'pending' | 'confirmed' | 'cancelled';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sales']['Insert']>;
      };
      comments: {
        Row: {
          comment_id: string;
          user_id: string | null;
          target_type: 'date_type' | 'trader' | 'exhibition';
          target_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          comment_id?: string;
          user_id?: string | null;
          target_type: 'date_type' | 'trader' | 'exhibition';
          target_id: string;
          content: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['comments']['Insert']>;
      };
    };
  };
}

// Convenience types
export type User       = Database['public']['Tables']['users']['Row'];
export type Trader     = Database['public']['Tables']['traders']['Row'];
export type Admin      = Database['public']['Tables']['admins']['Row'];
export type DateType   = Database['public']['Tables']['date_types']['Row'];
export type Exhibition = Database['public']['Tables']['exhibitions']['Row'];
export type Sale       = Database['public']['Tables']['sales']['Row'];
export type Comment    = Database['public']['Tables']['comments']['Row'];
