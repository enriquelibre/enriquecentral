export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          updated_at?: string | null;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          priority: string;
          status: string;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category?: string;
          priority?: string;
          status?: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          priority?: string;
          status?: string;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          amount: number;
          description: string;
          category: string;
          account: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          amount: number;
          description: string;
          category?: string;
          account?: string;
          date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          amount?: number;
          description?: string;
          category?: string;
          account?: string;
          date?: string;
          created_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      deals: {
        Row: {
          id: string;
          user_id: string;
          contact_id: string;
          title: string;
          value: number;
          stage: string;
          probability: number;
          expected_close_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          contact_id: string;
          title: string;
          value?: number;
          stage?: string;
          probability?: number;
          expected_close_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          contact_id?: string;
          title?: string;
          value?: number;
          stage?: string;
          probability?: number;
          expected_close_date?: string | null;
          created_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          category: string;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          category?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          category?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          target_date: string | null;
          progress: number;
          status: string;
          milestones: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          target_date?: string | null;
          progress?: number;
          status?: string;
          milestones?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          target_date?: string | null;
          progress?: number;
          status?: string;
          milestones?: Json;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          start_date: string;
          end_date: string | null;
          all_day: boolean;
          location: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          start_date?: string;
          end_date?: string | null;
          all_day?: boolean;
          location?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string | null;
          all_day?: boolean;
          location?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
