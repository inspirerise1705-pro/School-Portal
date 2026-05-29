export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      schools: {
        Row:    { id: string; name: string; code: string; created_at: string };
        Insert: { id?: string; name: string; code: string; created_at?: string };
        Update: { name?: string; code?: string };
      };
      teachers: {
        Row: {
          id: string; school_id: string; name: string; email: string;
          role: string; avatar: string | null; class_teacher_of: string | null;
          subjects: string[]; created_at: string; permissions: Json | null;
        };
        Insert: {
          id: string; school_id: string; name: string; email: string;
          role?: string; avatar?: string | null; class_teacher_of?: string | null;
          subjects?: string[]; created_at?: string; permissions?: Json | null;
        };
        Update: {
          name?: string; role?: string; avatar?: string | null;
          class_teacher_of?: string | null; subjects?: string[];
          permissions?: Json | null;
        };
      };
      classes: {
        Row:    { id: string; school_id: string; name: string; section: string; created_at: string };
        Insert: { id?: string; school_id: string; name: string; section: string; created_at?: string };
        Update: { name?: string; section?: string };
      };
      teacher_classes: {
        Row:    { teacher_id: string; class_id: string; subject: string };
        Insert: { teacher_id: string; class_id: string; subject: string };
        Update: { subject?: string };
      };
      students: {
        Row: {
          id: string; school_id: string; class_id: string | null;
          name: string; email: string | null; roll_number: string | null;
          avatar: string | null; fees_status: string; created_at: string;
          user_id: string | null; permissions: Json | null;
        };
        Insert: {
          id?: string; school_id: string; class_id?: string | null;
          name: string; email?: string | null; roll_number?: string | null;
          avatar?: string | null; fees_status?: string; created_at?: string;
          user_id?: string | null; permissions?: Json | null;
        };
        Update: {
          class_id?: string | null; name?: string; email?: string | null;
          roll_number?: string | null; avatar?: string | null; fees_status?: string;
          user_id?: string | null; permissions?: Json | null;
        };
      };
      subjects: {
        Row:    { id: string; school_id: string; name: string; color: string; created_at: string };
        Insert: { id?: string; school_id: string; name: string; color?: string; created_at?: string };
        Update: { name?: string; color?: string };
      };
      chapters: {
        Row:    { id: string; subject_id: string; name: string; number: number; created_at: string };
        Insert: { id?: string; subject_id: string; name: string; number?: number; created_at?: string };
        Update: { name?: string; number?: number };
      };
      quizzes: {
        Row: {
          id: string; school_id: string; class_id: string; teacher_id: string;
          subject_id: string | null; chapter_id: string | null; title: string;
          questions: Json; due_date: string | null; time_limit_minutes: number;
          published: boolean; created_at: string; quiz_type: string;
        };
        Insert: {
          id?: string; school_id: string; class_id: string; teacher_id: string;
          subject_id?: string | null; chapter_id?: string | null; title: string;
          questions?: Json; due_date?: string | null; time_limit_minutes?: number;
          published?: boolean; created_at?: string; quiz_type?: string;
        };
        Update: {
          title?: string; questions?: Json; due_date?: string | null;
          time_limit_minutes?: number; published?: boolean; quiz_type?: string;
        };
      };
      quiz_submissions: {
        Row: {
          id: string; quiz_id: string; student_id: string; answers: Json;
          score: number; total: number; submitted_at: string;
          feedback: string | null; grade_published: boolean;
        };
        Insert: {
          id?: string; quiz_id: string; student_id: string; answers?: Json;
          score?: number; total?: number; submitted_at?: string;
          feedback?: string | null; grade_published?: boolean;
        };
        Update: { score?: number; feedback?: string | null; grade_published?: boolean };
      };
      tasks: {
        Row: {
          id: string; school_id: string; class_id: string; teacher_id: string;
          subject_id: string | null; chapter_id: string | null;
          title: string; description: string | null; due_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string; school_id: string; class_id: string; teacher_id: string;
          subject_id?: string | null; chapter_id?: string | null;
          title: string; description?: string | null; due_date?: string | null;
          created_at?: string;
        };
        Update: { title?: string; description?: string | null; due_date?: string | null };
      };
      study_materials: {
        Row: {
          id: string; school_id: string; class_id: string; teacher_id: string;
          subject_id: string | null; title: string; file_url: string;
          file_type: string; created_at: string;
        };
        Insert: {
          id?: string; school_id: string; class_id: string; teacher_id: string;
          subject_id?: string | null; title: string; file_url: string;
          file_type?: string; created_at?: string;
        };
        Update: { title?: string; file_url?: string };
      };
      attendance: {
        Row: {
          id: string; school_id: string; class_id: string; student_id: string;
          date: string; status: string; marked_by: string | null; created_at: string;
        };
        Insert: {
          id?: string; school_id: string; class_id: string; student_id: string;
          date: string; status: string; marked_by?: string | null; created_at?: string;
        };
        Update: { status?: string };
      };
      calendar_events: {
        Row: {
          id: string; school_id: string; teacher_id: string | null;
          title: string; date: string; type: string;
          description: string | null; is_global: boolean; class_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string; school_id: string; teacher_id?: string | null;
          title: string; date: string; type?: string;
          description?: string | null; is_global?: boolean; class_id?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string; date?: string; type?: string;
          description?: string | null; is_global?: boolean; class_id?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string; school_id: string; recipient_id: string;
          title: string; body: string; read: boolean;
          type: string | null; created_at: string;
        };
        Insert: {
          id?: string; school_id: string; recipient_id: string;
          title: string; body: string; read?: boolean;
          type?: string | null; created_at?: string;
        };
        Update: { read?: boolean };
      };
      school_settings: {
        Row: {
          id: string; school_id: string; features: Json;
          academic_year: string; updated_at: string;
        };
        Insert: {
          id?: string; school_id: string; features?: Json;
          academic_year?: string; updated_at?: string;
        };
        Update: { features?: Json; academic_year?: string; updated_at?: string };
      };
      fees_payments: {
        Row: {
          id: string; school_id: string; student_id: string;
          amount: number; paid_at: string; method: string | null;
          receipt_url: string | null; created_at: string;
        };
        Insert: {
          id?: string; school_id: string; student_id: string;
          amount: number; paid_at?: string; method?: string | null;
          receipt_url?: string | null; created_at?: string;
        };
        Update: { amount?: number; receipt_url?: string | null };
      };
      user_credit_balances: {
        Row: {
          id: string; user_id: string; school_id: string;
          balance: number; total_allocated: number; total_used: number;
          updated_at: string;
        };
        Insert: {
          id?: string; user_id: string; school_id: string;
          balance?: number; total_allocated?: number; total_used?: number;
          updated_at?: string;
        };
        Update: { balance?: number; total_allocated?: number; total_used?: number; updated_at?: string };
      };
      credit_requests: {
        Row: {
          id: string; school_id: string; student_id: string;
          credits_requested: number; reason: string | null;
          status: string; resolved_at: string | null; created_at: string;
        };
        Insert: {
          id?: string; school_id: string; student_id: string;
          credits_requested: number; reason?: string | null;
          status?: string; resolved_at?: string | null; created_at?: string;
        };
        Update: { status?: string; resolved_at?: string | null };
      };
      doubt_box: {
        Row: {
          id: string; school_id: string; student_id: string;
          teacher_id: string | null; subject: string | null;
          question: string; answer: string | null; status: string;
          created_at: string; answered_at: string | null;
        };
        Insert: {
          id?: string; school_id: string; student_id: string;
          teacher_id?: string | null; subject?: string | null;
          question: string; answer?: string | null; status?: string;
          created_at?: string; answered_at?: string | null;
        };
        Update: { answer?: string | null; status?: string; answered_at?: string | null };
      };
      credit_transactions: {
        Row: {
          id: string; user_id: string; school_id: string;
          amount: number; action_type: string; description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string; user_id: string; school_id: string;
          amount: number; action_type: string; description?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      my_school_id:          { Args: Record<string, never>; Returns: string };
      is_school_admin:       { Args: Record<string, never>; Returns: boolean };
      ensure_credit_balance: { Args: Record<string, never>; Returns: number };
      deduct_credits: {
        Args: { p_user_id: string; p_amount: number; p_action_type: string; p_description: string };
        Returns: number;
      };
      add_credits: {
        Args: { p_user_id: string; p_amount: number; p_description: string };
        Returns: number;
      };
      admin_allocate_credits: {
        Args: { p_student_id: string; p_amount: number; p_description: string };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
  };
}
