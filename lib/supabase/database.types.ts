/**
 * Columns from the Supabase schema diagram:
 * profiles: id, user_name, full_name, bio, created_at, updated_at
 * recipes: id, created_at, user_id, title, ingredients, instructions, cooking_time, difficulty, category
 * likes: id, created_at, user_id, recipe_id
 * comments: id, created_at, updated_at, user_id, recipe_id, body
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_name: string;
          full_name: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_name: string;
          full_name?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_name?: string;
          full_name?: string | null;
          bio?: string | null;
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
      likes: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          recipe_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          recipe_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          recipe_id?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          recipe_id: string;
          body: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          recipe_id: string;
          body: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          recipe_id?: string;
          body?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
