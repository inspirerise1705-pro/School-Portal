-- ============================================================
-- Fix duplicate classes + add unique constraint
-- Run in: Supabase Dashboard → SQL Editor
-- Safe to run multiple times
-- ============================================================

-- Step 1: Keep only the class row with the MOST students, delete duplicates
DELETE FROM public.classes
WHERE id IN (
  SELECT c.id FROM public.classes c
  LEFT JOIN (
    SELECT class_id, COUNT(*) AS cnt
    FROM public.students
    GROUP BY class_id
  ) sc ON c.id = sc.class_id
  WHERE (
    -- Among rows with same (school_id, name, section), keep the one with most students
    -- (or earliest created_at if tied)
    SELECT c2.id FROM public.classes c2
    LEFT JOIN (
      SELECT class_id, COUNT(*) AS cnt FROM public.students GROUP BY class_id
    ) sc2 ON c2.id = sc2.class_id
    WHERE c2.school_id = c.school_id AND c2.name = c.name AND c2.section = c.section
    ORDER BY COALESCE(sc2.cnt, 0) DESC, c2.created_at ASC
    LIMIT 1
  ) != c.id
);

-- Step 2: Add unique constraint to prevent future duplicates
ALTER TABLE public.classes
  DROP CONSTRAINT IF EXISTS classes_school_name_section_unique;

ALTER TABLE public.classes
  ADD CONSTRAINT classes_school_name_section_unique
  UNIQUE (school_id, name, section);

-- Verify
SELECT name, section, COUNT(*) FROM public.classes GROUP BY school_id, name, section HAVING COUNT(*) > 1;
-- Should return 0 rows
