-- ============================================================
-- InspireRise School Platform — Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- SCHOOLS
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TEACHERS (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'teacher',
  avatar TEXT,
  class_teacher_of TEXT,
  subjects TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CLASSES
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  section TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TEACHER ↔ CLASS assignments (which teacher teaches which subject in which class)
CREATE TABLE IF NOT EXISTS public.teacher_classes (
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  PRIMARY KEY (teacher_id, class_id, subject)
);

-- STUDENTS
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id),
  name TEXT NOT NULL,
  email TEXT,
  roll_number TEXT,
  avatar TEXT,
  fees_status TEXT NOT NULL DEFAULT 'pending' CHECK (fees_status IN ('paid', 'pending', 'overdue')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Helper: get the school_id of the currently logged-in teacher
CREATE OR REPLACE FUNCTION public.my_school_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM public.teachers WHERE id = auth.uid() LIMIT 1;
$$;

-- Only authenticated users should call this function (not anon)
REVOKE EXECUTE ON FUNCTION public.my_school_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_school_id() TO authenticated;

-- Drop policies before recreating (makes schema idempotent)
DROP POLICY IF EXISTS "Teachers: read own school" ON public.teachers;
DROP POLICY IF EXISTS "Teachers: update own profile" ON public.teachers;
DROP POLICY IF EXISTS "Classes: read own school" ON public.classes;
DROP POLICY IF EXISTS "TeacherClasses: read own school" ON public.teacher_classes;
DROP POLICY IF EXISTS "Students: read own school" ON public.students;
DROP POLICY IF EXISTS "Schools: read own" ON public.schools;

-- Teachers: can read their own profile + other teachers in the same school
CREATE POLICY "Teachers: read own school" ON public.teachers
  FOR SELECT USING (school_id = public.my_school_id());

CREATE POLICY "Teachers: update own profile" ON public.teachers
  FOR UPDATE USING (id = auth.uid());

-- Classes: teachers see classes in their school
CREATE POLICY "Classes: read own school" ON public.classes
  FOR SELECT USING (school_id = public.my_school_id());

-- Teacher classes: teachers see assignments in their school
CREATE POLICY "TeacherClasses: read own school" ON public.teacher_classes
  FOR SELECT USING (
    teacher_id IN (SELECT id FROM public.teachers WHERE school_id = public.my_school_id())
  );

-- Students: teachers see students in their school
CREATE POLICY "Students: read own school" ON public.students
  FOR SELECT USING (school_id = public.my_school_id());

-- Schools: teachers can read their own school
CREATE POLICY "Schools: read own" ON public.schools
  FOR SELECT USING (id = public.my_school_id());

-- ============================================================
-- SEED: Create a demo school + teacher for testing
-- Run this AFTER creating the teacher in Supabase Auth Dashboard
-- Replace the teacher UUID below with the real auth.users ID
-- ============================================================

-- Step 1: Insert a school
INSERT INTO public.schools (id, name, code)
VALUES ('00000000-0000-0000-0000-000000000001', 'InspireRise Demo School', 'DEMO001')
ON CONFLICT (code) DO NOTHING;

-- Step 2: Insert a class
INSERT INTO public.classes (id, school_id, name, section)
VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Class 8', 'A'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Class 9', 'B')
ON CONFLICT DO NOTHING;

-- Step 3 (run AFTER creating teacher in Supabase Auth):
-- INSERT INTO public.teachers (id, school_id, name, email, role, class_teacher_of, subjects)
-- VALUES (
--   '<paste-auth-user-id-here>',
--   '00000000-0000-0000-0000-000000000001',
--   'Mrs. Anjali Sharma',
--   'teacher@inspirewise.edu',
--   'teacher',
--   'Class 8A',
--   ARRAY['Mathematics', 'Science']
-- );
