-- ============================================================
-- InspireRise — Attendance + Calendar Event Seed
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Run AFTER seed_dummy_data.sql (needs students/classes to exist)
-- ============================================================


-- ─────────────────────────────────────────────
-- 1. ATTENDANCE — past 10 school days (auto-generated)
-- Generates records for all enrolled students
-- ─────────────────────────────────────────────
DO $att$
DECLARE
  v_school_id UUID;
  v_date      DATE;
BEGIN
  SELECT id INTO v_school_id FROM public.schools LIMIT 1;
  IF v_school_id IS NULL THEN RAISE EXCEPTION 'No school found. Run seed_dummy_data.sql first.'; END IF;

  -- Loop over the past 14 calendar days, pick weekdays only (Mon–Fri)
  FOR v_date IN
    SELECT gs::DATE
    FROM generate_series(
      CURRENT_DATE - INTERVAL '14 days',
      CURRENT_DATE - INTERVAL '1 day',   -- exclude today (not marked yet)
      '1 day'::INTERVAL
    ) AS gs
    WHERE EXTRACT(DOW FROM gs) NOT IN (0, 6)  -- 0=Sun, 6=Sat
  LOOP
    -- Insert one attendance row per student per day
    -- ~84% present, ~9% late, ~7% absent  (realistic Indian school average)
    INSERT INTO public.attendance (school_id, class_id, student_id, date, status)
    SELECT
      s.school_id,
      s.class_id,
      s.id,
      v_date,
      CASE
        WHEN random() < 0.84 THEN 'present'
        WHEN random() < 0.93 THEN 'late'
        ELSE 'absent'
      END AS status
    FROM public.students s
    WHERE s.school_id = v_school_id
      AND s.class_id IS NOT NULL
    ON CONFLICT DO NOTHING;
  END LOOP;

  RAISE NOTICE 'Attendance seeded for past ~10 weekdays under school %', v_school_id;
END $att$;


-- ─────────────────────────────────────────────
-- 2. CALENDAR EVENTS — 2026 dates
-- Clears old 2025 events and inserts fresh ones
-- ─────────────────────────────────────────────
DO $cal$
DECLARE
  v_school_id UUID;
BEGIN
  SELECT id INTO v_school_id FROM public.schools LIMIT 1;
  IF v_school_id IS NULL THEN RAISE EXCEPTION 'No school found. Run seed_dummy_data.sql first.'; END IF;

  -- Remove stale 2025 holiday entries if they exist
  DELETE FROM public.calendar_events
  WHERE school_id = v_school_id
    AND title IN ('Independence Day', 'Gandhi Jayanti', 'Diwali Break');

  INSERT INTO public.calendar_events
    (school_id, teacher_id, title, date, type, description, is_global, class_id)
  VALUES
    -- ── Upcoming (relative to today) ──────────────────────────────
    (v_school_id, NULL, 'PTM - Parent Teacher Meeting',
      (CURRENT_DATE + 5)::TEXT,  'Announcement',
      'All classes 9 AM to 1 PM. Parents must carry ID.',              TRUE, NULL),

    (v_school_id, NULL, 'Inter-House Debate Competition',
      (CURRENT_DATE + 9)::TEXT,  'Activity',
      'English and Hindi rounds. Mandatory for Class 8 & 9.',          TRUE, NULL),

    (v_school_id, NULL, 'Mid-Term Examinations Begin',
      (CURRENT_DATE + 14)::TEXT, 'Lecture',
      'Exams for all grades 6-9. Revised schedule on notice board.',   TRUE, NULL),

    (v_school_id, NULL, 'Annual Sports Day',
      (CURRENT_DATE + 21)::TEXT, 'Activity',
      'Ground events 8 AM - 2 PM. Students wear house colours.',       TRUE, NULL),

    (v_school_id, NULL, 'Science Exhibition',
      (CURRENT_DATE + 28)::TEXT, 'Lecture',
      'Class 8 and 9 projects on display. Parents welcome.',           TRUE, NULL),

    (v_school_id, NULL, 'Annual Day Rehearsal',
      (CURRENT_DATE + 3)::TEXT,  'Activity',
      'All selected students report to auditorium by 3 PM.',           TRUE, NULL),

    (v_school_id, NULL, 'Term 1 Results Declaration',
      (CURRENT_DATE + 35)::TEXT, 'Announcement',
      'Report cards distributed period-wise.',                         TRUE, NULL),

    -- ── Fixed 2026 holidays ───────────────────────────────────────
    (v_school_id, NULL, 'Independence Day',
      '2026-08-15', 'Holiday', 'School closed. National Holiday.',    TRUE, NULL),

    (v_school_id, NULL, 'Gandhi Jayanti',
      '2026-10-02', 'Holiday', 'School closed. National Holiday.',    TRUE, NULL),

    (v_school_id, NULL, 'Diwali Break Begins',
      '2026-10-19', 'Holiday', '5-day break Oct 19-23.',              TRUE, NULL),

    (v_school_id, NULL, 'Christmas Break',
      '2026-12-25', 'Holiday', 'School closed Dec 25 - Jan 1.',       TRUE, NULL),

    -- ── Past events (still visible on calendar) ───────────────────
    (v_school_id, NULL, 'Republic Day',
      '2026-01-26', 'Holiday', 'School closed. National Holiday.',    TRUE, NULL),

    (v_school_id, NULL, 'Annual Prize Distribution',
      '2026-02-14', 'Activity',
      'Auditorium 10 AM. Parents invited.',                            TRUE, NULL),

    (v_school_id, NULL, 'Holi - School Colour Day',
      '2026-03-06', 'Activity',
      'Half day. Students may wear white for colours.',                TRUE, NULL)

  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Calendar events seeded (2026 dates) under school %', v_school_id;
END $cal$;
