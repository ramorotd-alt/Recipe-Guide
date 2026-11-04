/**
 * Columns from the Supabase schema diagram:
 * profiles: id, user_name, full_name, created_at, updated_at
 * recipes: id, created_at, user_id, title, ingredients, instructions, cooking_time, difficulty, category
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_name: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_name: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_name?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      recipes: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          title: string;
          ingredients: string;
          instructions: string;
          cooking_time: number;
          difficulty: string;
          category: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          title: string;
          ingredients: string;
          instructions: string;
          cooking_time: number;
          difficulty: string;
          category: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          title?: string;
          ingredients?: string;
          instructions?: string;
          cooking_time?: number;
          difficulty?: string;
          category?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
