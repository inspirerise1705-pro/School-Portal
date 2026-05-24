export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string;
          name: string;
          code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          code?: string;
        };
      };
      teachers: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          email: string;
          role: string;
          avatar: string | null;
          class_teacher_of: string | null;
          subjects: string[];
          created_at: string;
        };
        Insert: {
          id: string;
          school_id: string;
          name: string;
          email: string;
          role?: string;
          avatar?: string | null;
          class_teacher_of?: string | null;
          subjects?: string[];
          created_at?: string;
        };
        Update: {
          name?: string;
          role?: string;
          avatar?: string | null;
          class_teacher_of?: string | null;
          subjects?: string[];
        };
      };
      classes: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          section: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          section: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          section?: string;
        };
      };
      teacher_classes: {
        Row: {
          teacher_id: string;
          class_id: string;
          subject: string;
        };
        Insert: {
          teacher_id: string;
          class_id: string;
          subject: string;
        };
        Update: {
          subject?: string;
        };
      };
      students: {
        Row: {
          id: string;
          school_id: string;
          class_id: string | null;
          name: string;
          email: string | null;
          roll_number: string | null;
          avatar: string | null;
          fees_status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          class_id?: string | null;
          name: string;
          email?: string | null;
          roll_number?: string | null;
          avatar?: string | null;
          fees_status?: string;
          created_at?: string;
        };
        Update: {
          class_id?: string | null;
          name?: string;
          email?: string | null;
          roll_number?: string | null;
          avatar?: string | null;
          fees_status?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
