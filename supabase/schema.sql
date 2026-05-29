-- ============================================================
-- InspireRise School Platform — Complete Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Safe to re-run: uses IF NOT EXISTS + DROP POLICY IF EXISTS
-- ============================================================

-- ============================================================
-- SECTION 1: CORE TABLES (original + modifications)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.schools (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  code        TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teachers (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id        UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  role             TEXT NOT NULL DEFAULT 'teacher',
  avatar           TEXT,
  class_teacher_of TEXT,
  subjects         TEXT[] DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.classes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id  UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  section    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teacher_classes (
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  class_id   UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject    TEXT NOT NULL,
  PRIMARY KEY (teacher_id, class_id, subject)
);

CREATE TABLE IF NOT EXISTS public.students (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id    UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id     UUID REFERENCES public.classes(id),
  name         TEXT NOT NULL,
  email        TEXT,
  roll_number  TEXT,
  avatar       TEXT,
  fees_status  TEXT NOT NULL DEFAULT 'pending' CHECK (fees_status IN ('paid', 'pending', 'overdue')),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Add user_id to students so they can log in via Supabase Auth
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Per-student and per-teacher feature permission overrides (override school-wide defaults)
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';

-- ============================================================
-- SECTION 2: ACADEMIC CONTENT TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subjects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id  UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chapters (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  number     INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Teacher-created quizzes assigned to a class
CREATE TABLE IF NOT EXISTS public.quizzes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id           UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id            UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id          UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  subject_id          UUID REFERENCES public.subjects(id),
  chapter_id          UUID REFERENCES public.chapters(id),
  title               TEXT NOT NULL,
  questions           JSONB NOT NULL DEFAULT '[]',
  due_date            TIMESTAMPTZ,
  time_limit_minutes  INTEGER DEFAULT 30,
  published           BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS quiz_type TEXT NOT NULL DEFAULT 'quiz'
  CHECK (quiz_type IN ('quiz', 'unit_test', 'main_test', 'assignment'));

-- Student answers for teacher-assigned quizzes
CREATE TABLE IF NOT EXISTS public.quiz_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id         UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  answers         JSONB NOT NULL DEFAULT '[]',
  score           INTEGER NOT NULL DEFAULT 0,
  total           INTEGER NOT NULL DEFAULT 0,
  submitted_at    TIMESTAMPTZ DEFAULT now(),
  feedback        TEXT,
  grade_published BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (quiz_id, student_id)
);

-- Teacher-assigned homework/tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id    UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id  UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  subject_id  UUID REFERENCES public.subjects(id),
  chapter_id  UUID REFERENCES public.chapters(id),
  title       TEXT NOT NULL,
  description TEXT,
  due_date    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Teacher-uploaded study notes (metadata only; file_url for future storage)
CREATE TABLE IF NOT EXISTS public.study_materials (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id    UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id  UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  subject_id  UUID REFERENCES public.subjects(id),
  chapter_id  UUID REFERENCES public.chapters(id),
  title       TEXT NOT NULL,
  description TEXT,
  file_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Daily attendance per student
CREATE TABLE IF NOT EXISTS public.attendance (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id    UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id  UUID REFERENCES public.teachers(id),
  date        DATE NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (student_id, date)
);

-- ============================================================
-- SECTION 3: COMMUNICATION TABLES
-- ============================================================

-- System notifications for teachers and students
CREATE TABLE IF NOT EXISTS public.notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id    UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN (
    'quiz_assigned', 'grade_published', 'announcement',
    'timetable_updated', 'doubt_replied', 'credit_low',
    'credit_request_approved', 'credit_request_denied', 'new_material', 'new_task'
  )),
  title        TEXT NOT NULL,
  message      TEXT NOT NULL,
  read         BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Student questions; teacher replies inline
CREATE TABLE IF NOT EXISTS public.doubt_box (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id    UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id  UUID REFERENCES public.subjects(id),
  chapter_id  UUID REFERENCES public.chapters(id),
  question    TEXT NOT NULL,
  teacher_reply TEXT,
  replied_at  TIMESTAMPTZ,
  replied_by  UUID REFERENCES public.teachers(id),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 4: TIMETABLE TABLES
-- ============================================================

-- Recurring weekly timetable per class
CREATE TABLE IF NOT EXISTS public.timetable_slots (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id      UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id       UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  day_of_week    TEXT NOT NULL CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')),
  period_number  INTEGER NOT NULL CHECK (period_number BETWEEN 1 AND 10),
  subject_id     UUID REFERENCES public.subjects(id),
  teacher_id     UUID REFERENCES public.teachers(id),
  start_time     TIME NOT NULL,
  end_time       TIME NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (class_id, day_of_week, period_number)
);

-- One-off date-specific timetable overrides
CREATE TABLE IF NOT EXISTS public.timetable_overrides (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id       UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id        UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  period_number   INTEGER NOT NULL,
  subject_id      UUID REFERENCES public.subjects(id),
  teacher_id      UUID REFERENCES public.teachers(id),
  reason          TEXT,
  is_free_period  BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (class_id, date, period_number)
);

-- School calendar events (holidays, exams, activities)
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id    UUID REFERENCES public.classes(id),
  teacher_id  UUID REFERENCES public.teachers(id),
  title       TEXT NOT NULL,
  date        DATE NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('Lecture','Holiday','Activity','Meeting','Announcement','Exam')),
  description TEXT,
  is_global   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 5: AI CREDIT TABLES
-- ============================================================

-- Available credit packages (managed by super admin / seeded)
CREATE TABLE IF NOT EXISTS public.credit_packages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  credits     INTEGER NOT NULL,
  price_inr   DECIMAL(10,2) NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Per-user credit balance (one row per user)
CREATE TABLE IF NOT EXISTS public.user_credit_balances (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id        UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  balance          INTEGER NOT NULL DEFAULT 0,
  total_allocated  INTEGER NOT NULL DEFAULT 0,
  total_used       INTEGER NOT NULL DEFAULT 0,
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- Immutable log of every credit event
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id     UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  action_type   TEXT NOT NULL,
  credits_delta INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Student/teacher requests for more credits
CREATE TABLE IF NOT EXISTS public.credit_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id         UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  package_id        UUID REFERENCES public.credit_packages(id),
  credits_requested INTEGER NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','denied')),
  note              TEXT,
  admin_note        TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  resolved_at       TIMESTAMPTZ
);

-- ============================================================
-- SECTION 6: HELPER FUNCTIONS
-- ============================================================

-- Returns school_id for the currently logged-in user (teacher OR student)
CREATE OR REPLACE FUNCTION public.my_school_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT school_id FROM public.teachers WHERE id = auth.uid() LIMIT 1),
    (SELECT school_id FROM public.students WHERE user_id = auth.uid() LIMIT 1)
  );
$$;

-- Returns role of the currently logged-in user
CREATE OR REPLACE FUNCTION public.my_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid()) THEN 'teacher'
    WHEN EXISTS (SELECT 1 FROM public.students WHERE user_id = auth.uid()) THEN 'student'
    ELSE NULL
  END;
$$;

-- Returns the student record id for logged-in student
CREATE OR REPLACE FUNCTION public.my_student_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.students WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Returns the class_id for the logged-in student
CREATE OR REPLACE FUNCTION public.my_class_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT class_id FROM public.students WHERE user_id = auth.uid() LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.my_school_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.my_role()      FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.my_student_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.my_class_id()  FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.my_school_id() TO authenticated;
GRANT  EXECUTE ON FUNCTION public.my_role()      TO authenticated;
GRANT  EXECUTE ON FUNCTION public.my_student_id() TO authenticated;
GRANT  EXECUTE ON FUNCTION public.my_class_id()  TO authenticated;

-- ============================================================
-- SECTION 7: CREDIT RPC FUNCTIONS
-- ============================================================

-- Atomically deduct credits; returns new balance or -1 if insufficient
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id     UUID,
  p_amount      INTEGER,
  p_action_type TEXT,
  p_description TEXT DEFAULT NULL
) RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INTEGER;
  v_school_id   UUID;
BEGIN
  SELECT school_id INTO v_school_id FROM public.user_credit_balances WHERE user_id = p_user_id;

  UPDATE public.user_credit_balances
  SET balance    = balance - p_amount,
      total_used = total_used + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id AND balance >= p_amount
  RETURNING balance INTO v_new_balance;

  IF NOT FOUND THEN RETURN -1; END IF;

  INSERT INTO public.credit_transactions
    (user_id, school_id, action_type, credits_delta, balance_after, description)
  VALUES
    (p_user_id, v_school_id, p_action_type, -p_amount, v_new_balance, p_description);

  RETURN v_new_balance;
END;
$$;

-- Add credits to a user (demo purchase / admin allocation)
-- Uses UPSERT so it works even when no balance row exists yet.
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id     UUID,
  p_amount      INTEGER,
  p_description TEXT DEFAULT NULL
) RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INTEGER;
  v_school_id   UUID;
BEGIN
  -- Resolve school_id from teachers or students
  SELECT COALESCE(
    (SELECT school_id FROM public.teachers WHERE id = p_user_id LIMIT 1),
    (SELECT school_id FROM public.students WHERE user_id = p_user_id LIMIT 1)
  ) INTO v_school_id;

  -- UPSERT: create the row if it doesn't exist, then add credits
  INSERT INTO public.user_credit_balances (user_id, school_id, balance, total_allocated, total_used)
  VALUES (p_user_id, v_school_id, p_amount, p_amount, 0)
  ON CONFLICT (user_id) DO UPDATE
    SET balance         = user_credit_balances.balance + p_amount,
        total_allocated = user_credit_balances.total_allocated + p_amount,
        updated_at      = now()
  RETURNING balance INTO v_new_balance;

  INSERT INTO public.credit_transactions
    (user_id, school_id, action_type, credits_delta, balance_after, description)
  VALUES
    (p_user_id, v_school_id, 'purchase', p_amount, v_new_balance, p_description);

  RETURN v_new_balance;
END;
$$;

-- Ensures a balance row exists for the calling user; returns current balance.
-- Call this on app load so purchases and deductions never fail due to missing row.
CREATE OR REPLACE FUNCTION public.ensure_credit_balance()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id UUID;
  v_balance   INTEGER;
BEGIN
  SELECT COALESCE(
    (SELECT school_id FROM public.teachers WHERE id = auth.uid() LIMIT 1),
    (SELECT school_id FROM public.students WHERE user_id = auth.uid() LIMIT 1)
  ) INTO v_school_id;

  INSERT INTO public.user_credit_balances (user_id, school_id, balance, total_allocated, total_used)
  VALUES (auth.uid(), v_school_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT balance INTO v_balance FROM public.user_credit_balances WHERE user_id = auth.uid();
  RETURN COALESCE(v_balance, 0);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.ensure_credit_balance FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.ensure_credit_balance TO authenticated;

REVOKE EXECUTE ON FUNCTION public.deduct_credits FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.add_credits    FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.deduct_credits TO authenticated;
GRANT  EXECUTE ON FUNCTION public.add_credits    TO authenticated;

-- ============================================================
-- SECTION 8: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.schools            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_classes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubt_box          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_slots    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_requests    ENABLE ROW LEVEL SECURITY;

-- Drop all policies before recreating (idempotent)
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- SCHOOLS
CREATE POLICY "schools: read own" ON public.schools
  FOR SELECT USING (id = public.my_school_id());

-- TEACHERS
CREATE POLICY "teachers: read own school" ON public.teachers
  FOR SELECT USING (school_id = public.my_school_id());
CREATE POLICY "teachers: update own profile" ON public.teachers
  FOR UPDATE USING (id = auth.uid());

-- CLASSES
CREATE POLICY "classes: read own school" ON public.classes
  FOR SELECT USING (school_id = public.my_school_id());

-- TEACHER_CLASSES
CREATE POLICY "teacher_classes: read own school" ON public.teacher_classes
  FOR SELECT USING (
    teacher_id IN (SELECT id FROM public.teachers WHERE school_id = public.my_school_id())
  );

-- STUDENTS: teachers see all in school; students see only themselves
CREATE POLICY "students: teacher read school" ON public.students
  FOR SELECT USING (
    public.my_role() = 'teacher' AND school_id = public.my_school_id()
  );
CREATE POLICY "students: student read self" ON public.students
  FOR SELECT USING (
    public.my_role() = 'student' AND user_id = auth.uid()
  );
CREATE POLICY "students: teacher update school" ON public.students
  FOR UPDATE USING (
    public.my_role() = 'teacher' AND school_id = public.my_school_id()
  );

-- SUBJECTS
CREATE POLICY "subjects: read own school" ON public.subjects
  FOR SELECT USING (school_id = public.my_school_id());
CREATE POLICY "subjects: teacher manage" ON public.subjects
  FOR ALL USING (
    public.my_role() = 'teacher' AND school_id = public.my_school_id()
  );

-- CHAPTERS
CREATE POLICY "chapters: read via subject" ON public.chapters
  FOR SELECT USING (
    subject_id IN (SELECT id FROM public.subjects WHERE school_id = public.my_school_id())
  );
CREATE POLICY "chapters: teacher manage" ON public.chapters
  FOR ALL USING (
    public.my_role() = 'teacher' AND
    subject_id IN (SELECT id FROM public.subjects WHERE school_id = public.my_school_id())
  );

-- QUIZZES: teachers see all in school; students see published quizzes for their class
CREATE POLICY "quizzes: teacher all" ON public.quizzes
  FOR ALL USING (
    public.my_role() = 'teacher' AND school_id = public.my_school_id()
  );
CREATE POLICY "quizzes: student read published" ON public.quizzes
  FOR SELECT USING (
    public.my_role() = 'student' AND
    published = true AND
    class_id = public.my_class_id()
  );

-- QUIZ_SUBMISSIONS: teachers see all for their quizzes; students see own
CREATE POLICY "quiz_submissions: teacher read" ON public.quiz_submissions
  FOR SELECT USING (
    public.my_role() = 'teacher' AND
    quiz_id IN (SELECT id FROM public.quizzes WHERE school_id = public.my_school_id())
  );
CREATE POLICY "quiz_submissions: teacher update feedback" ON public.quiz_submissions
  FOR UPDATE USING (
    public.my_role() = 'teacher' AND
    quiz_id IN (SELECT id FROM public.quizzes WHERE school_id = public.my_school_id())
  );
CREATE POLICY "quiz_submissions: student read own" ON public.quiz_submissions
  FOR SELECT USING (
    public.my_role() = 'student' AND student_id = public.my_student_id()
  );
CREATE POLICY "quiz_submissions: student insert own" ON public.quiz_submissions
  FOR INSERT WITH CHECK (
    public.my_role() = 'student' AND student_id = public.my_student_id()
  );

-- TASKS
CREATE POLICY "tasks: teacher all" ON public.tasks
  FOR ALL USING (
    public.my_role() = 'teacher' AND school_id = public.my_school_id()
  );
CREATE POLICY "tasks: student read own class" ON public.tasks
  FOR SELECT USING (
    public.my_role() = 'student' AND class_id = public.my_class_id()
  );

-- STUDY_MATERIALS
CREATE POLICY "study_materials: teacher all" ON public.study_materials
  FOR ALL USING (
    public.my_role() = 'teacher' AND school_id = public.my_school_id()
  );
CREATE POLICY "study_materials: student read own class" ON public.study_materials
  FOR SELECT USING (
    public.my_role() = 'student' AND class_id = public.my_class_id()
  );

-- ATTENDANCE
CREATE POLICY "attendance: teacher all" ON public.attendance
  FOR ALL USING (
    public.my_role() = 'teacher' AND school_id = public.my_school_id()
  );
CREATE POLICY "attendance: student read own" ON public.attendance
  FOR SELECT USING (
    public.my_role() = 'student' AND student_id = public.my_student_id()
  );

-- NOTIFICATIONS: users read/update own; authenticated can insert for same school
CREATE POLICY "notifications: read own" ON public.notifications
  FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "notifications: update own read" ON public.notifications
  FOR UPDATE USING (recipient_id = auth.uid());
CREATE POLICY "notifications: insert authenticated" ON public.notifications
  FOR INSERT WITH CHECK (school_id = public.my_school_id());

-- DOUBT_BOX
CREATE POLICY "doubt_box: student own" ON public.doubt_box
  FOR ALL USING (
    public.my_role() = 'student' AND student_id = public.my_student_id()
  );
CREATE POLICY "doubt_box: teacher read class" ON public.doubt_box
  FOR SELECT USING (
    public.my_role() = 'teacher' AND school_id = public.my_school_id()
  );
CREATE POLICY "doubt_box: teacher reply" ON public.doubt_box
  FOR UPDATE USING (
    public.my_role() = 'teacher' AND school_id = public.my_school_id()
  );

-- TIMETABLE_SLOTS
CREATE POLICY "timetable_slots: read own school" ON public.timetable_slots
  FOR SELECT USING (school_id = public.my_school_id());
CREATE POLICY "timetable_slots: teacher manage" ON public.timetable_slots
  FOR ALL USING (
    public.my_role() = 'teacher' AND school_id = public.my_school_id()
  );

-- TIMETABLE_OVERRIDES
CREATE POLICY "timetable_overrides: read own school" ON public.timetable_overrides
  FOR SELECT USING (school_id = public.my_school_id());
CREATE POLICY "timetable_overrides: teacher manage" ON public.timetable_overrides
  FOR ALL USING (
    public.my_role() = 'teacher' AND school_id = public.my_school_id()
  );

-- CALENDAR_EVENTS
CREATE POLICY "calendar_events: read own school" ON public.calendar_events
  FOR SELECT USING (school_id = public.my_school_id());
CREATE POLICY "calendar_events: teacher manage" ON public.calendar_events
  FOR ALL USING (
    public.my_role() = 'teacher' AND school_id = public.my_school_id()
  );

-- CREDIT_PACKAGES: everyone authenticated can read
CREATE POLICY "credit_packages: read all" ON public.credit_packages
  FOR SELECT USING (auth.role() = 'authenticated');

-- USER_CREDIT_BALANCES: users see own only
CREATE POLICY "user_credit_balances: read own" ON public.user_credit_balances
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "user_credit_balances: update own" ON public.user_credit_balances
  FOR UPDATE USING (user_id = auth.uid());

-- CREDIT_TRANSACTIONS: users see own only
CREATE POLICY "credit_transactions: read own" ON public.credit_transactions
  FOR SELECT USING (user_id = auth.uid());

-- CREDIT_REQUESTS: users manage own
CREATE POLICY "credit_requests: manage own" ON public.credit_requests
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- SECTION 9: SEED DATA
-- ============================================================

-- Demo school
INSERT INTO public.schools (id, name, code)
VALUES ('00000000-0000-0000-0000-000000000001', 'InspireRise Demo School', 'DEMO001')
ON CONFLICT (code) DO NOTHING;

-- Demo classes
INSERT INTO public.classes (id, school_id, name, section) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Class 8', 'A'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Class 9', 'B')
ON CONFLICT DO NOTHING;

-- Demo subjects
INSERT INTO public.subjects (id, school_id, name, color) VALUES
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'Mathematics',  '#3B82F6'),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'Science',      '#10B981'),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', 'History',      '#F59E0B'),
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000001', 'Geography',    '#8B5CF6'),
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000001', 'English',      '#EC4899')
ON CONFLICT DO NOTHING;

-- Demo chapters for Science
INSERT INTO public.chapters (subject_id, name, number) VALUES
  ('00000000-0000-0000-0000-000000000021', 'Cell: The Unit of Life',   1),
  ('00000000-0000-0000-0000-000000000021', 'Tissues',                  2),
  ('00000000-0000-0000-0000-000000000021', 'Motion',                   3),
  ('00000000-0000-0000-0000-000000000021', 'Force and Laws of Motion', 4),
  ('00000000-0000-0000-0000-000000000021', 'Gravitation',              5)
ON CONFLICT DO NOTHING;

-- Demo chapters for Mathematics
INSERT INTO public.chapters (subject_id, name, number) VALUES
  ('00000000-0000-0000-0000-000000000020', 'Rational Numbers',         1),
  ('00000000-0000-0000-0000-000000000020', 'Linear Equations',         2),
  ('00000000-0000-0000-0000-000000000020', 'Understanding Quadrilaterals', 3),
  ('00000000-0000-0000-0000-000000000020', 'Data Handling',            4),
  ('00000000-0000-0000-0000-000000000020', 'Squares and Square Roots', 5)
ON CONFLICT DO NOTHING;

-- Credit packages
INSERT INTO public.credit_packages (name, credits, price_inr) VALUES
  ('Starter',          50,    49.00),
  ('Standard',        200,   149.00),
  ('Pro',             500,   299.00),
  ('Unlimited Month', 9999,  499.00)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 10: ADMIN / PRINCIPAL TABLES
-- ============================================================

-- Per-school configuration managed by the principal
CREATE TABLE IF NOT EXISTS public.school_settings (
  school_id      UUID PRIMARY KEY REFERENCES public.schools(id) ON DELETE CASCADE,
  academic_year  TEXT NOT NULL DEFAULT '2025-26',
  working_days   TEXT[] DEFAULT ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  features       JSONB NOT NULL DEFAULT '{
    "teacher_ai_quiz": true,
    "teacher_ai_paper": true,
    "student_ai_tutor": true,
    "student_self_practice": true,
    "doubt_box": true,
    "study_materials": true,
    "student_credits_default": 100
  }',
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- Fee payment event log (admin records each payment)
CREATE TABLE IF NOT EXISTS public.fees_payments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id    UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id   UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount       DECIMAL(10,2) NOT NULL DEFAULT 0,
  term         TEXT NOT NULL DEFAULT 'Annual',
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  note         TEXT,
  recorded_by  UUID REFERENCES public.teachers(id),
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fees_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

-- ── Helper: is the calling user the admin of a given school? ──
CREATE OR REPLACE FUNCTION public.is_school_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teachers
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;
REVOKE EXECUTE ON FUNCTION public.is_school_admin() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.is_school_admin() TO authenticated;

-- ── Update my_role() to return 'admin' for principal accounts ──
CREATE OR REPLACE FUNCTION public.my_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid() AND role = 'admin') THEN 'admin'
    WHEN EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid())                    THEN 'teacher'
    WHEN EXISTS (SELECT 1 FROM public.students WHERE user_id = auth.uid())               THEN 'student'
    ELSE NULL
  END;
$$;

-- ── Admin RLS: principal has full read/write on their school ──

-- SCHOOLS
CREATE POLICY "schools: admin read own"   ON public.schools
  FOR SELECT USING (id = public.my_school_id() AND public.is_school_admin());

-- TEACHERS (admin can read/update all teachers in school)
CREATE POLICY "teachers: admin all"       ON public.teachers
  FOR ALL USING (school_id = public.my_school_id() AND public.is_school_admin());

-- CLASSES
CREATE POLICY "classes: admin all"        ON public.classes
  FOR ALL USING (school_id = public.my_school_id() AND public.is_school_admin());

-- TEACHER_CLASSES
CREATE POLICY "teacher_classes: admin all" ON public.teacher_classes
  FOR ALL USING (
    teacher_id IN (SELECT id FROM public.teachers WHERE school_id = public.my_school_id())
    AND public.is_school_admin()
  );

-- STUDENTS (admin full CRUD)
CREATE POLICY "students: admin all"       ON public.students
  FOR ALL USING (school_id = public.my_school_id() AND public.is_school_admin());

-- SUBJECTS
CREATE POLICY "subjects: admin all"       ON public.subjects
  FOR ALL USING (school_id = public.my_school_id() AND public.is_school_admin());

-- CHAPTERS
CREATE POLICY "chapters: admin all"       ON public.chapters
  FOR ALL USING (
    subject_id IN (SELECT id FROM public.subjects WHERE school_id = public.my_school_id())
    AND public.is_school_admin()
  );

-- QUIZZES (read-only for admin — teachers own their quizzes)
CREATE POLICY "quizzes: admin read"       ON public.quizzes
  FOR SELECT USING (school_id = public.my_school_id() AND public.is_school_admin());

-- QUIZ_SUBMISSIONS (read-only for admin)
CREATE POLICY "quiz_submissions: admin read" ON public.quiz_submissions
  FOR SELECT USING (
    quiz_id IN (SELECT id FROM public.quizzes WHERE school_id = public.my_school_id())
    AND public.is_school_admin()
  );

-- TASKS (read-only for admin)
CREATE POLICY "tasks: admin read"         ON public.tasks
  FOR SELECT USING (school_id = public.my_school_id() AND public.is_school_admin());

-- STUDY_MATERIALS (read-only for admin)
CREATE POLICY "study_materials: admin read" ON public.study_materials
  FOR SELECT USING (school_id = public.my_school_id() AND public.is_school_admin());

-- ATTENDANCE (admin full read; teachers still write)
CREATE POLICY "attendance: admin read"    ON public.attendance
  FOR SELECT USING (school_id = public.my_school_id() AND public.is_school_admin());

-- NOTIFICATIONS (admin can insert school-wide)
CREATE POLICY "notifications: admin insert" ON public.notifications
  FOR INSERT WITH CHECK (school_id = public.my_school_id() AND public.is_school_admin());
CREATE POLICY "notifications: admin read"   ON public.notifications
  FOR SELECT USING (school_id = public.my_school_id() AND public.is_school_admin());

-- DOUBT_BOX (read-only for admin)
CREATE POLICY "doubt_box: admin read"     ON public.doubt_box
  FOR SELECT USING (school_id = public.my_school_id() AND public.is_school_admin());

-- TIMETABLE_SLOTS (admin full)
CREATE POLICY "timetable_slots: admin all" ON public.timetable_slots
  FOR ALL USING (school_id = public.my_school_id() AND public.is_school_admin());

-- CALENDAR_EVENTS (admin full — creates holidays/exams/announcements)
CREATE POLICY "calendar_events: admin all" ON public.calendar_events
  FOR ALL USING (school_id = public.my_school_id() AND public.is_school_admin());

-- CREDIT_PACKAGES (admin read)
CREATE POLICY "credit_packages: admin read" ON public.credit_packages
  FOR SELECT USING (public.is_school_admin());

-- USER_CREDIT_BALANCES (admin read all in school; admin can update for allocation)
CREATE POLICY "user_credit_balances: admin all" ON public.user_credit_balances
  FOR ALL USING (school_id = public.my_school_id() AND public.is_school_admin());

-- CREDIT_TRANSACTIONS (admin read all in school)
CREATE POLICY "credit_transactions: admin read" ON public.credit_transactions
  FOR SELECT USING (school_id = public.my_school_id() AND public.is_school_admin());

-- CREDIT_REQUESTS (admin read + update in school)
CREATE POLICY "credit_requests: admin all" ON public.credit_requests
  FOR ALL USING (school_id = public.my_school_id() AND public.is_school_admin());

-- FEES_PAYMENTS (admin full)
CREATE POLICY "fees_payments: admin all"  ON public.fees_payments
  FOR ALL USING (school_id = public.my_school_id() AND public.is_school_admin());

-- SCHOOL_SETTINGS (admin full)
CREATE POLICY "school_settings: admin all" ON public.school_settings
  FOR ALL USING (school_id = public.my_school_id() AND public.is_school_admin());
CREATE POLICY "school_settings: teacher read" ON public.school_settings
  FOR SELECT USING (school_id = public.my_school_id());

-- ── Admin RPC: allocate credits to a student from admin ──────
CREATE OR REPLACE FUNCTION public.admin_allocate_credits(
  p_student_user_id UUID,
  p_amount          INTEGER,
  p_description     TEXT DEFAULT 'Admin allocation'
) RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_school_id   UUID;
  v_new_balance INTEGER;
BEGIN
  IF NOT public.is_school_admin() THEN RAISE EXCEPTION 'Forbidden'; END IF;
  SELECT school_id INTO v_school_id FROM public.teachers WHERE id = auth.uid();

  INSERT INTO public.user_credit_balances (user_id, school_id, balance, total_allocated, total_used)
  VALUES (p_student_user_id, v_school_id, p_amount, p_amount, 0)
  ON CONFLICT (user_id) DO UPDATE
    SET balance         = user_credit_balances.balance + p_amount,
        total_allocated = user_credit_balances.total_allocated + p_amount,
        updated_at      = now()
  RETURNING balance INTO v_new_balance;

  INSERT INTO public.credit_transactions
    (user_id, school_id, action_type, credits_delta, balance_after, description)
  VALUES (p_student_user_id, v_school_id, 'admin_allocation', p_amount, v_new_balance, p_description);

  RETURN v_new_balance;
END; $$;
REVOKE EXECUTE ON FUNCTION public.admin_allocate_credits FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.admin_allocate_credits TO authenticated;

-- ── HOW TO ADD A PRINCIPAL (run AFTER creating user in Supabase Auth):
-- INSERT INTO public.teachers (id, school_id, name, email, role)
-- VALUES ('<auth-user-id>', '00000000-0000-0000-0000-000000000001',
--         'Dr. Anita Sharma', 'principal@school.edu', 'admin');
-- ============================================================

-- ============================================================
-- HOW TO ADD A TEACHER (run AFTER creating user in Supabase Auth):
-- INSERT INTO public.teachers (id, school_id, name, email, role, class_teacher_of, subjects)
-- VALUES ('<auth-user-id>', '00000000-0000-0000-0000-000000000001',
--         'Ms. Sanjana Shah', 'teacher@school.edu', 'teacher', 'Class 8A',
--         ARRAY['Mathematics','Science']);
-- INSERT INTO public.user_credit_balances (user_id, school_id, balance, total_allocated)
-- VALUES ('<auth-user-id>', '00000000-0000-0000-0000-000000000001', 200, 200);
--
-- HOW TO ADD A STUDENT (run AFTER creating user in Supabase Auth):
-- INSERT INTO public.students (user_id, school_id, class_id, name, email, roll_number)
-- VALUES ('<auth-user-id>', '00000000-0000-0000-0000-000000000001',
--         '00000000-0000-0000-0000-000000000010', 'Aaryan Kapoor',
--         'student@school.edu', '8A-01');
-- INSERT INTO public.user_credit_balances (user_id, school_id, balance, total_allocated)
-- VALUES ('<auth-user-id>', '00000000-0000-0000-0000-000000000001', 100, 100);
-- ============================================================
