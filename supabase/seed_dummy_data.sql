-- ============================================================
-- InspireRise — Dummy Seed Data
-- School: Classes 6–9 (8 sections, ~30 students each)
-- Run in: Supabase Dashboard → SQL Editor → New Query
--
-- IMPORTANT: Your 2 real users are already in the system.
-- This script only adds:
--   • 1 school (skipped if one already exists)
--   • 8 classes (6A, 6B, 7A, 7B, 8A, 8B, 9A, 9B)
--   • 6 subjects
--   • ~240 dummy students distributed across the classes
--   • Sample fees statuses
--
-- Teachers must be created via Supabase Auth (they need login).
-- See the teacher invite section at the bottom of this file.
-- ============================================================

DO $$
DECLARE
  v_school_id UUID;

  id_6A UUID; id_6B UUID;
  id_7A UUID; id_7B UUID;
  id_8A UUID; id_8B UUID;
  id_9A UUID; id_9B UUID;

  sub_math UUID; sub_sci UUID; sub_eng UUID;
  sub_soc  UUID; sub_hin UUID; sub_cs  UUID;
BEGIN

-- ─────────────────────────────────────────────
-- 1. SCHOOL
-- ─────────────────────────────────────────────
SELECT id INTO v_school_id FROM public.schools LIMIT 1;

IF v_school_id IS NULL THEN
  INSERT INTO public.schools (name, code)
  VALUES ('InspireRise School', 'IR2025')
  RETURNING id INTO v_school_id;
  RAISE NOTICE 'Created school: %', v_school_id;
ELSE
  RAISE NOTICE 'Using existing school: %', v_school_id;
END IF;


-- ─────────────────────────────────────────────
-- 2. CLASSES  (skip if already present)
-- ─────────────────────────────────────────────
INSERT INTO public.classes (school_id, name, section) VALUES (v_school_id, 'Class 6', 'A')
  ON CONFLICT DO NOTHING RETURNING id INTO id_6A;
INSERT INTO public.classes (school_id, name, section) VALUES (v_school_id, 'Class 6', 'B')
  ON CONFLICT DO NOTHING RETURNING id INTO id_6B;
INSERT INTO public.classes (school_id, name, section) VALUES (v_school_id, 'Class 7', 'A')
  ON CONFLICT DO NOTHING RETURNING id INTO id_7A;
INSERT INTO public.classes (school_id, name, section) VALUES (v_school_id, 'Class 7', 'B')
  ON CONFLICT DO NOTHING RETURNING id INTO id_7B;
INSERT INTO public.classes (school_id, name, section) VALUES (v_school_id, 'Class 8', 'A')
  ON CONFLICT DO NOTHING RETURNING id INTO id_8A;
INSERT INTO public.classes (school_id, name, section) VALUES (v_school_id, 'Class 8', 'B')
  ON CONFLICT DO NOTHING RETURNING id INTO id_8B;
INSERT INTO public.classes (school_id, name, section) VALUES (v_school_id, 'Class 9', 'A')
  ON CONFLICT DO NOTHING RETURNING id INTO id_9A;
INSERT INTO public.classes (school_id, name, section) VALUES (v_school_id, 'Class 9', 'B')
  ON CONFLICT DO NOTHING RETURNING id INTO id_9B;

-- Re-fetch IDs if INSERTs were skipped due to conflicts
SELECT id INTO id_6A FROM public.classes WHERE school_id = v_school_id AND name = 'Class 6' AND section = 'A';
SELECT id INTO id_6B FROM public.classes WHERE school_id = v_school_id AND name = 'Class 6' AND section = 'B';
SELECT id INTO id_7A FROM public.classes WHERE school_id = v_school_id AND name = 'Class 7' AND section = 'A';
SELECT id INTO id_7B FROM public.classes WHERE school_id = v_school_id AND name = 'Class 7' AND section = 'B';
SELECT id INTO id_8A FROM public.classes WHERE school_id = v_school_id AND name = 'Class 8' AND section = 'A';
SELECT id INTO id_8B FROM public.classes WHERE school_id = v_school_id AND name = 'Class 8' AND section = 'B';
SELECT id INTO id_9A FROM public.classes WHERE school_id = v_school_id AND name = 'Class 9' AND section = 'A';
SELECT id INTO id_9B FROM public.classes WHERE school_id = v_school_id AND name = 'Class 9' AND section = 'B';


-- ─────────────────────────────────────────────
-- 3. SUBJECTS
-- ─────────────────────────────────────────────
INSERT INTO public.subjects (school_id, name, color) VALUES
  (v_school_id, 'Mathematics',     '#3B82F6'),
  (v_school_id, 'Science',         '#10B981'),
  (v_school_id, 'English',         '#F59E0B'),
  (v_school_id, 'Social Studies',  '#8B5CF6'),
  (v_school_id, 'Hindi',           '#EF4444'),
  (v_school_id, 'Computer Science','#06B6D4')
ON CONFLICT DO NOTHING;

SELECT id INTO sub_math FROM public.subjects WHERE school_id = v_school_id AND name = 'Mathematics';
SELECT id INTO sub_sci  FROM public.subjects WHERE school_id = v_school_id AND name = 'Science';
SELECT id INTO sub_eng  FROM public.subjects WHERE school_id = v_school_id AND name = 'English';
SELECT id INTO sub_soc  FROM public.subjects WHERE school_id = v_school_id AND name = 'Social Studies';
SELECT id INTO sub_hin  FROM public.subjects WHERE school_id = v_school_id AND name = 'Hindi';
SELECT id INTO sub_cs   FROM public.subjects WHERE school_id = v_school_id AND name = 'Computer Science';


-- ─────────────────────────────────────────────
-- 4. STUDENTS — Class 6A (30 students)
-- ─────────────────────────────────────────────
INSERT INTO public.students (school_id, class_id, name, email, roll_number, fees_status) VALUES
  (v_school_id, id_6A, 'Aarav Sharma',    'aarav.s@student.ir',    '6A-01', 'paid'),
  (v_school_id, id_6A, 'Ananya Iyer',     'ananya.i@student.ir',   '6A-02', 'paid'),
  (v_school_id, id_6A, 'Arjun Mehta',     'arjun.m@student.ir',    '6A-03', 'pending'),
  (v_school_id, id_6A, 'Aisha Khan',      'aisha.k@student.ir',    '6A-04', 'paid'),
  (v_school_id, id_6A, 'Aditya Nair',     'aditya.n@student.ir',   '6A-05', 'overdue'),
  (v_school_id, id_6A, 'Bhavya Reddy',    'bhavya.r@student.ir',   '6A-06', 'paid'),
  (v_school_id, id_6A, 'Chetan Joshi',    'chetan.j@student.ir',   '6A-07', 'paid'),
  (v_school_id, id_6A, 'Deepika Pillai',  'deepika.p@student.ir',  '6A-08', 'pending'),
  (v_school_id, id_6A, 'Dev Gupta',       'dev.g@student.ir',      '6A-09', 'paid'),
  (v_school_id, id_6A, 'Divya Menon',     'divya.m@student.ir',    '6A-10', 'paid'),
  (v_school_id, id_6A, 'Esha Bose',       'esha.b@student.ir',     '6A-11', 'paid'),
  (v_school_id, id_6A, 'Farhan Sheikh',   'farhan.s@student.ir',   '6A-12', 'overdue'),
  (v_school_id, id_6A, 'Gauri Kulkarni',  'gauri.k@student.ir',    '6A-13', 'paid'),
  (v_school_id, id_6A, 'Harsh Verma',     'harsh.v@student.ir',    '6A-14', 'pending'),
  (v_school_id, id_6A, 'Ishaan Bajaj',    'ishaan.b@student.ir',   '6A-15', 'paid'),
  (v_school_id, id_6A, 'Jiya Aggarwal',   'jiya.a@student.ir',     '6A-16', 'paid'),
  (v_school_id, id_6A, 'Kartik Singh',    'kartik.s@student.ir',   '6A-17', 'paid'),
  (v_school_id, id_6A, 'Kavya Rao',       'kavya.r@student.ir',    '6A-18', 'pending'),
  (v_school_id, id_6A, 'Lakshmi Naik',    'lakshmi.n@student.ir',  '6A-19', 'paid'),
  (v_school_id, id_6A, 'Manav Tiwari',    'manav.t@student.ir',    '6A-20', 'paid'),
  (v_school_id, id_6A, 'Meera Shetty',    'meera.s@student.ir',    '6A-21', 'overdue'),
  (v_school_id, id_6A, 'Mihir Desai',     'mihir.d@student.ir',    '6A-22', 'paid'),
  (v_school_id, id_6A, 'Nandini Patil',   'nandini.p@student.ir',  '6A-23', 'paid'),
  (v_school_id, id_6A, 'Nikhil Chavan',   'nikhil.c@student.ir',   '6A-24', 'paid'),
  (v_school_id, id_6A, 'Pooja Tripathi',  'pooja.t@student.ir',    '6A-25', 'pending'),
  (v_school_id, id_6A, 'Pranav Malhotra', 'pranav.m@student.ir',   '6A-26', 'paid'),
  (v_school_id, id_6A, 'Priya Kapoor',    'priya.k@student.ir',    '6A-27', 'paid'),
  (v_school_id, id_6A, 'Rahul Das',       'rahul.d@student.ir',    '6A-28', 'paid'),
  (v_school_id, id_6A, 'Riya Jain',       'riya.j@student.ir',     '6A-29', 'overdue'),
  (v_school_id, id_6A, 'Rohan Pandey',    'rohan.p@student.ir',    '6A-30', 'paid')
ON CONFLICT DO NOTHING;

-- Class 6B (30 students)
INSERT INTO public.students (school_id, class_id, name, email, roll_number, fees_status) VALUES
  (v_school_id, id_6B, 'Saanvi Goel',     'saanvi.g@student.ir',   '6B-01', 'paid'),
  (v_school_id, id_6B, 'Sahil Bhat',      'sahil.b@student.ir',    '6B-02', 'pending'),
  (v_school_id, id_6B, 'Sakshi Mishra',   'sakshi.m@student.ir',   '6B-03', 'paid'),
  (v_school_id, id_6B, 'Shaan Oberoi',    'shaan.o@student.ir',    '6B-04', 'paid'),
  (v_school_id, id_6B, 'Shreya Bansal',   'shreya.b@student.ir',   '6B-05', 'paid'),
  (v_school_id, id_6B, 'Siddharth Roy',   'siddharth.r@student.ir','6B-06', 'overdue'),
  (v_school_id, id_6B, 'Sneha Dixit',     'sneha.d@student.ir',    '6B-07', 'paid'),
  (v_school_id, id_6B, 'Sumit Ahuja',     'sumit.a@student.ir',    '6B-08', 'paid'),
  (v_school_id, id_6B, 'Tanvi Sinha',     'tanvi.s@student.ir',    '6B-09', 'pending'),
  (v_school_id, id_6B, 'Tarun Mathur',    'tarun.m@student.ir',    '6B-10', 'paid'),
  (v_school_id, id_6B, 'Uday Sharma',     'uday.s@student.ir',     '6B-11', 'paid'),
  (v_school_id, id_6B, 'Uma Krishnan',    'uma.k@student.ir',      '6B-12', 'paid'),
  (v_school_id, id_6B, 'Vaibhav Saxena',  'vaibhav.s@student.ir',  '6B-13', 'overdue'),
  (v_school_id, id_6B, 'Vandana Shah',    'vandana.s@student.ir',  '6B-14', 'paid'),
  (v_school_id, id_6B, 'Veer Chopra',     'veer.c@student.ir',     '6B-15', 'paid'),
  (v_school_id, id_6B, 'Vidya Nambiar',   'vidya.n@student.ir',    '6B-16', 'paid'),
  (v_school_id, id_6B, 'Vikram Patel',    'vikram.p@student.ir',   '6B-17', 'pending'),
  (v_school_id, id_6B, 'Vinay Kumar',     'vinay.k@student.ir',    '6B-18', 'paid'),
  (v_school_id, id_6B, 'Vineeta Ghosh',   'vineeta.g@student.ir',  '6B-19', 'paid'),
  (v_school_id, id_6B, 'Vishal Yadav',    'vishal.y@student.ir',   '6B-20', 'paid'),
  (v_school_id, id_6B, 'Yash Rastogi',    'yash.r@student.ir',     '6B-21', 'overdue'),
  (v_school_id, id_6B, 'Yashodhara Sen',  'yasho.s@student.ir',    '6B-22', 'paid'),
  (v_school_id, id_6B, 'Zara Ahmed',      'zara.a@student.ir',     '6B-23', 'paid'),
  (v_school_id, id_6B, 'Aakash Tomar',    'aakash.t@student.ir',   '6B-24', 'paid'),
  (v_school_id, id_6B, 'Aditi Chandra',   'aditi.c@student.ir',    '6B-25', 'pending'),
  (v_school_id, id_6B, 'Ajay Bhatt',      'ajay.b@student.ir',     '6B-26', 'paid'),
  (v_school_id, id_6B, 'Alka Singh',      'alka.s@student.ir',     '6B-27', 'paid'),
  (v_school_id, id_6B, 'Amit Rawat',      'amit.r@student.ir',     '6B-28', 'paid'),
  (v_school_id, id_6B, 'Amrita Basu',     'amrita.b@student.ir',   '6B-29', 'paid'),
  (v_school_id, id_6B, 'Anand Pillai',    'anand.p@student.ir',    '6B-30', 'overdue')
ON CONFLICT DO NOTHING;

-- Class 7A (30 students)
INSERT INTO public.students (school_id, class_id, name, email, roll_number, fees_status) VALUES
  (v_school_id, id_7A, 'Ankita Verma',   'ankita.v@student.ir',  '7A-01', 'paid'),
  (v_school_id, id_7A, 'Ankit Dubey',    'ankit.d@student.ir',   '7A-02', 'paid'),
  (v_school_id, id_7A, 'Anu Krishnan',   'anu.k@student.ir',     '7A-03', 'pending'),
  (v_school_id, id_7A, 'Aparna Nair',    'aparna.n@student.ir',  '7A-04', 'paid'),
  (v_school_id, id_7A, 'Aryan Kapoor',   'aryan.k@student.ir',   '7A-05', 'paid'),
  (v_school_id, id_7A, 'Ayesha Siddiqui','ayesha.s@student.ir',  '7A-06', 'overdue'),
  (v_school_id, id_7A, 'Chirag Mehta',   'chirag.m@student.ir',  '7A-07', 'paid'),
  (v_school_id, id_7A, 'Disha Patel',    'disha.p@student.ir',   '7A-08', 'paid'),
  (v_school_id, id_7A, 'Gaurav Tiwari',  'gaurav.t@student.ir',  '7A-09', 'paid'),
  (v_school_id, id_7A, 'Geeta Shukla',   'geeta.s@student.ir',   '7A-10', 'pending'),
  (v_school_id, id_7A, 'Hardik Modi',    'hardik.m@student.ir',  '7A-11', 'paid'),
  (v_school_id, id_7A, 'Isha Pandey',    'isha.p@student.ir',    '7A-12', 'paid'),
  (v_school_id, id_7A, 'Jay Thakur',     'jay.t@student.ir',     '7A-13', 'paid'),
  (v_school_id, id_7A, 'Jhanvi Rathi',   'jhanvi.r@student.ir',  '7A-14', 'overdue'),
  (v_school_id, id_7A, 'Kabir Malhotra', 'kabir.m@student.ir',   '7A-15', 'paid'),
  (v_school_id, id_7A, 'Kavita Garg',    'kavita.g@student.ir',  '7A-16', 'paid'),
  (v_school_id, id_7A, 'Krish Aggarwal', 'krish.a@student.ir',   '7A-17', 'paid'),
  (v_school_id, id_7A, 'Kunal Batra',    'kunal.b@student.ir',   '7A-18', 'pending'),
  (v_school_id, id_7A, 'Lata Mishra',    'lata.m@student.ir',    '7A-19', 'paid'),
  (v_school_id, id_7A, 'Mihika Rao',     'mihika.r@student.ir',  '7A-20', 'paid'),
  (v_school_id, id_7A, 'Moksha Jain',    'moksha.j@student.ir',  '7A-21', 'paid'),
  (v_school_id, id_7A, 'Naveen Reddy',   'naveen.r@student.ir',  '7A-22', 'overdue'),
  (v_school_id, id_7A, 'Neha Bajaj',     'neha.b@student.ir',    '7A-23', 'paid'),
  (v_school_id, id_7A, 'Nihal Chandra',  'nihal.c@student.ir',   '7A-24', 'paid'),
  (v_school_id, id_7A, 'Nisha Ranjan',   'nisha.r@student.ir',   '7A-25', 'paid'),
  (v_school_id, id_7A, 'Om Sharma',      'om.s@student.ir',      '7A-26', 'pending'),
  (v_school_id, id_7A, 'Palak Soni',     'palak.s@student.ir',   '7A-27', 'paid'),
  (v_school_id, id_7A, 'Parth Joshi',    'parth.j@student.ir',   '7A-28', 'paid'),
  (v_school_id, id_7A, 'Pawan Gupta',    'pawan.g@student.ir',   '7A-29', 'paid'),
  (v_school_id, id_7A, 'Pihu Khatri',    'pihu.k@student.ir',    '7A-30', 'paid')
ON CONFLICT DO NOTHING;

-- Class 7B (30 students)
INSERT INTO public.students (school_id, class_id, name, email, roll_number, fees_status) VALUES
  (v_school_id, id_7B, 'Pooja Rathore',  'poojar.r@student.ir',  '7B-01', 'paid'),
  (v_school_id, id_7B, 'Prem Chauhan',   'prem.c@student.ir',    '7B-02', 'pending'),
  (v_school_id, id_7B, 'Priyansh Arora', 'priyansh.a@student.ir','7B-03', 'paid'),
  (v_school_id, id_7B, 'Radhika Sen',    'radhika.s@student.ir', '7B-04', 'paid'),
  (v_school_id, id_7B, 'Raj Khanna',     'raj.k@student.ir',     '7B-05', 'overdue'),
  (v_school_id, id_7B, 'Rashmi Dey',     'rashmi.d@student.ir',  '7B-06', 'paid'),
  (v_school_id, id_7B, 'Renu Negi',      'renu.n@student.ir',    '7B-07', 'paid'),
  (v_school_id, id_7B, 'Rishab Goyal',   'rishab.g@student.ir',  '7B-08', 'paid'),
  (v_school_id, id_7B, 'Ritesh Saxena',  'ritesh.s@student.ir',  '7B-09', 'pending'),
  (v_school_id, id_7B, 'Ritu Agarwal',   'ritu.a@student.ir',    '7B-10', 'paid'),
  (v_school_id, id_7B, 'Rohit Srivastava','rohit.s@student.ir',  '7B-11', 'paid'),
  (v_school_id, id_7B, 'Ruhi Bhatnagar', 'ruhi.b@student.ir',    '7B-12', 'paid'),
  (v_school_id, id_7B, 'Sahana Nair',    'sahana.n@student.ir',  '7B-13', 'overdue'),
  (v_school_id, id_7B, 'Sameer Ansari',  'sameer.a@student.ir',  '7B-14', 'paid'),
  (v_school_id, id_7B, 'Sanchi Garg',    'sanchi.g@student.ir',  '7B-15', 'paid'),
  (v_school_id, id_7B, 'Sandeep Yadav',  'sandeep.y@student.ir', '7B-16', 'paid'),
  (v_school_id, id_7B, 'Saniya Patel',   'saniya.p@student.ir',  '7B-17', 'pending'),
  (v_school_id, id_7B, 'Sarthak Gupta',  'sarthak.g@student.ir', '7B-18', 'paid'),
  (v_school_id, id_7B, 'Sejal Sharma',   'sejal.s@student.ir',   '7B-19', 'paid'),
  (v_school_id, id_7B, 'Shiv Raina',     'shiv.r@student.ir',    '7B-20', 'paid'),
  (v_school_id, id_7B, 'Shubham Walia',  'shubham.w@student.ir', '7B-21', 'overdue'),
  (v_school_id, id_7B, 'Simran Kohli',   'simran.k@student.ir',  '7B-22', 'paid'),
  (v_school_id, id_7B, 'Soham Das',      'soham.d@student.ir',   '7B-23', 'paid'),
  (v_school_id, id_7B, 'Sonali Bhatt',   'sonali.b@student.ir',  '7B-24', 'paid'),
  (v_school_id, id_7B, 'Souvik Roy',     'souvik.r@student.ir',  '7B-25', 'pending'),
  (v_school_id, id_7B, 'Sudhanshu Tomar','sudhanshu.t@student.ir','7B-26','paid'),
  (v_school_id, id_7B, 'Suhana Khan',    'suhana.k@student.ir',  '7B-27', 'paid'),
  (v_school_id, id_7B, 'Surbhi Bose',    'surbhi.b@student.ir',  '7B-28', 'paid'),
  (v_school_id, id_7B, 'Swati Biswas',   'swati.b@student.ir',   '7B-29', 'overdue'),
  (v_school_id, id_7B, 'Tanmay Trivedi', 'tanmay.t@student.ir',  '7B-30', 'paid')
ON CONFLICT DO NOTHING;

-- Class 8A (30 students)
INSERT INTO public.students (school_id, class_id, name, email, roll_number, fees_status) VALUES
  (v_school_id, id_8A, 'Tanushree Roy',  'tanushree.r@student.ir','8A-01', 'paid'),
  (v_school_id, id_8A, 'Tarun Rajput',   'tarun.r@student.ir',   '8A-02', 'paid'),
  (v_school_id, id_8A, 'Trisha Menon',   'trisha.m@student.ir',  '8A-03', 'pending'),
  (v_school_id, id_8A, 'Tushar Bedi',    'tushar.b@student.ir',  '8A-04', 'paid'),
  (v_school_id, id_8A, 'Udita Mathur',   'udita.m@student.ir',   '8A-05', 'paid'),
  (v_school_id, id_8A, 'Utkarsh Singh',  'utkarsh.s@student.ir', '8A-06', 'overdue'),
  (v_school_id, id_8A, 'Vaishnavi Iyer', 'vaishnavi.i@student.ir','8A-07','paid'),
  (v_school_id, id_8A, 'Vedant Jha',     'vedant.j@student.ir',  '8A-08', 'paid'),
  (v_school_id, id_8A, 'Vibha Rastogi',  'vibha.r@student.ir',   '8A-09', 'paid'),
  (v_school_id, id_8A, 'Vidit Arora',    'vidit.a@student.ir',   '8A-10', 'pending'),
  (v_school_id, id_8A, 'Vrinda Kapila',  'vrinda.k@student.ir',  '8A-11', 'paid'),
  (v_school_id, id_8A, 'Yash Mittal',    'yash.m@student.ir',    '8A-12', 'paid'),
  (v_school_id, id_8A, 'Yashika Goel',   'yashika.g@student.ir', '8A-13', 'paid'),
  (v_school_id, id_8A, 'Zoya Malik',     'zoya.m@student.ir',    '8A-14', 'overdue'),
  (v_school_id, id_8A, 'Abhinav Khanna', 'abhinav.k@student.ir', '8A-15', 'paid'),
  (v_school_id, id_8A, 'Abhishek Pandey','abhishek.p@student.ir','8A-16', 'paid'),
  (v_school_id, id_8A, 'Aishwarya Dixit','aishwarya.d@student.ir','8A-17','paid'),
  (v_school_id, id_8A, 'Akash Soni',     'akash.s@student.ir',   '8A-18', 'pending'),
  (v_school_id, id_8A, 'Akshita Gulati', 'akshita.g@student.ir', '8A-19', 'paid'),
  (v_school_id, id_8A, 'Akshat Bahl',    'akshat.b@student.ir',  '8A-20', 'paid'),
  (v_school_id, id_8A, 'Alisha Goswami', 'alisha.g@student.ir',  '8A-21', 'paid'),
  (v_school_id, id_8A, 'Amaan Mirza',    'amaan.m@student.ir',   '8A-22', 'overdue'),
  (v_school_id, id_8A, 'Amisha Lal',     'amisha.l@student.ir',  '8A-23', 'paid'),
  (v_school_id, id_8A, 'Anshul Nanda',   'anshul.n@student.ir',  '8A-24', 'paid'),
  (v_school_id, id_8A, 'Archit Mehra',   'archit.m@student.ir',  '8A-25', 'pending'),
  (v_school_id, id_8A, 'Ashna Bajpai',   'ashna.b@student.ir',   '8A-26', 'paid'),
  (v_school_id, id_8A, 'Ashutosh Tiwari','ashutosh.t@student.ir','8A-27', 'paid'),
  (v_school_id, id_8A, 'Avni Malik',     'avni.m@student.ir',    '8A-28', 'paid'),
  (v_school_id, id_8A, 'Ayaan Suri',     'ayaan.s@student.ir',   '8A-29', 'overdue'),
  (v_school_id, id_8A, 'Ayushi Dube',    'ayushi.d@student.ir',  '8A-30', 'paid')
ON CONFLICT DO NOTHING;

-- Class 8B (30 students)
INSERT INTO public.students (school_id, class_id, name, email, roll_number, fees_status) VALUES
  (v_school_id, id_8B, 'Bhanu Pratap',   'bhanu.p@student.ir',   '8B-01', 'paid'),
  (v_school_id, id_8B, 'Chanchal Kaur',  'chanchal.k@student.ir','8B-02', 'paid'),
  (v_school_id, id_8B, 'Darshan Nair',   'darshan.n@student.ir', '8B-03', 'pending'),
  (v_school_id, id_8B, 'Devansh Vats',   'devansh.v@student.ir', '8B-04', 'paid'),
  (v_school_id, id_8B, 'Diksha Rawat',   'diksha.r@student.ir',  '8B-05', 'paid'),
  (v_school_id, id_8B, 'Dinesh Sehgal',  'dinesh.s@student.ir',  '8B-06', 'overdue'),
  (v_school_id, id_8B, 'Divyam Tripathi','divyam.t@student.ir',  '8B-07', 'paid'),
  (v_school_id, id_8B, 'Diya Menon',     'diya.m@student.ir',    '8B-08', 'paid'),
  (v_school_id, id_8B, 'Ekta Sethi',     'ekta.s@student.ir',    '8B-09', 'paid'),
  (v_school_id, id_8B, 'Gaurangi Shah',  'gaurangi.s@student.ir','8B-10', 'pending'),
  (v_school_id, id_8B, 'Geetika Sharma', 'geetika.s@student.ir', '8B-11', 'paid'),
  (v_school_id, id_8B, 'Hemant Rathi',   'hemant.r@student.ir',  '8B-12', 'paid'),
  (v_school_id, id_8B, 'Hina Siddiqui',  'hina.s@student.ir',    '8B-13', 'paid'),
  (v_school_id, id_8B, 'Ishan Kumar',    'ishan.k@student.ir',   '8B-14', 'overdue'),
  (v_school_id, id_8B, 'Jatin Bhatia',   'jatin.b@student.ir',   '8B-15', 'paid'),
  (v_school_id, id_8B, 'Kanika Sobti',   'kanika.s@student.ir',  '8B-16', 'paid'),
  (v_school_id, id_8B, 'Karan Ahuja',    'karan.a@student.ir',   '8B-17', 'paid'),
  (v_school_id, id_8B, 'Khushi Sachdeva','khushi.s@student.ir',  '8B-18', 'pending'),
  (v_school_id, id_8B, 'Kirti Bhardwaj', 'kirti.b@student.ir',   '8B-19', 'paid'),
  (v_school_id, id_8B, 'Lokesh Verma',   'lokesh.v@student.ir',  '8B-20', 'paid'),
  (v_school_id, id_8B, 'Madhur Jain',    'madhur.j@student.ir',  '8B-21', 'paid'),
  (v_school_id, id_8B, 'Mahima Tyagi',   'mahima.t@student.ir',  '8B-22', 'overdue'),
  (v_school_id, id_8B, 'Manisha Sahai',  'manisha.s@student.ir', '8B-23', 'paid'),
  (v_school_id, id_8B, 'Mohit Luthra',   'mohit.l@student.ir',   '8B-24', 'paid'),
  (v_school_id, id_8B, 'Monu Taneja',    'monu.t@student.ir',    '8B-25', 'pending'),
  (v_school_id, id_8B, 'Mugdha Prasad',  'mugdha.p@student.ir',  '8B-26', 'paid'),
  (v_school_id, id_8B, 'Muskan Mehrotra','muskan.m@student.ir',  '8B-27', 'paid'),
  (v_school_id, id_8B, 'Nakul Setia',    'nakul.s@student.ir',   '8B-28', 'paid'),
  (v_school_id, id_8B, 'Namrata Pal',    'namrata.p@student.ir', '8B-29', 'overdue'),
  (v_school_id, id_8B, 'Neeraj Chopra',  'neeraj.c@student.ir',  '8B-30', 'paid')
ON CONFLICT DO NOTHING;

-- Class 9A (30 students)
INSERT INTO public.students (school_id, class_id, name, email, roll_number, fees_status) VALUES
  (v_school_id, id_9A, 'Nidhi Rangi',    'nidhi.r@student.ir',   '9A-01', 'paid'),
  (v_school_id, id_9A, 'Niharika Dutta', 'niharika.d@student.ir','9A-02', 'paid'),
  (v_school_id, id_9A, 'Nilesh Sinha',   'nilesh.s@student.ir',  '9A-03', 'pending'),
  (v_school_id, id_9A, 'Nimisha Ghosh',  'nimisha.g@student.ir', '9A-04', 'paid'),
  (v_school_id, id_9A, 'Nishant Tomar',  'nishant.t@student.ir', '9A-05', 'paid'),
  (v_school_id, id_9A, 'Nitu Yadav',     'nitu.y@student.ir',    '9A-06', 'overdue'),
  (v_school_id, id_9A, 'Parag Mishra',   'parag.m@student.ir',   '9A-07', 'paid'),
  (v_school_id, id_9A, 'Parinita Bose',  'parinita.b@student.ir','9A-08', 'paid'),
  (v_school_id, id_9A, 'Piyush Asthana', 'piyush.a@student.ir',  '9A-09', 'paid'),
  (v_school_id, id_9A, 'Pragya Goyal',   'pragya.g@student.ir',  '9A-10', 'pending'),
  (v_school_id, id_9A, 'Praveen Nath',   'praveen.n@student.ir', '9A-11', 'paid'),
  (v_school_id, id_9A, 'Preethi Mani',   'preethi.m@student.ir', '9A-12', 'paid'),
  (v_school_id, id_9A, 'Rachna Bhatt',   'rachna.b@student.ir',  '9A-13', 'paid'),
  (v_school_id, id_9A, 'Raghav Bansal',  'raghav.b@student.ir',  '9A-14', 'overdue'),
  (v_school_id, id_9A, 'Rajat Khare',    'rajat.k@student.ir',   '9A-15', 'paid'),
  (v_school_id, id_9A, 'Rakesh Goel',    'rakesh.g@student.ir',  '9A-16', 'paid'),
  (v_school_id, id_9A, 'Raman Soni',     'raman.s@student.ir',   '9A-17', 'paid'),
  (v_school_id, id_9A, 'Ramona Pillai',  'ramona.p@student.ir',  '9A-18', 'pending'),
  (v_school_id, id_9A, 'Rashi Kapoor',   'rashi.k@student.ir',   '9A-19', 'paid'),
  (v_school_id, id_9A, 'Raveena Reddy',  'raveena.r@student.ir', '9A-20', 'paid'),
  (v_school_id, id_9A, 'Reena Shah',     'reena.s@student.ir',   '9A-21', 'paid'),
  (v_school_id, id_9A, 'Rishi Mehra',    'rishi.m@student.ir',   '9A-22', 'overdue'),
  (v_school_id, id_9A, 'Rohini Dubey',   'rohini.d@student.ir',  '9A-23', 'paid'),
  (v_school_id, id_9A, 'Rudra Sharma',   'rudra.s@student.ir',   '9A-24', 'paid'),
  (v_school_id, id_9A, 'Rushali Patil',  'rushali.p@student.ir', '9A-25', 'paid'),
  (v_school_id, id_9A, 'Sahil Waqar',    'sahilw.w@student.ir',  '9A-26', 'pending'),
  (v_school_id, id_9A, 'Saket Dixit',    'saket.d@student.ir',   '9A-27', 'paid'),
  (v_school_id, id_9A, 'Saloni Bajwa',   'saloni.b@student.ir',  '9A-28', 'paid'),
  (v_school_id, id_9A, 'Samridhi Gupta', 'samridhi.g@student.ir','9A-29', 'paid'),
  (v_school_id, id_9A, 'Sanjay Kumar',   'sanjay.k@student.ir',  '9A-30', 'overdue')
ON CONFLICT DO NOTHING;

-- Class 9B (30 students)
INSERT INTO public.students (school_id, class_id, name, email, roll_number, fees_status) VALUES
  (v_school_id, id_9B, 'Sanjana Watts',  'sanjana.w@student.ir', '9B-01', 'paid'),
  (v_school_id, id_9B, 'Santosh Puri',   'santosh.p@student.ir', '9B-02', 'paid'),
  (v_school_id, id_9B, 'Sapna Lal',      'sapna.l@student.ir',   '9B-03', 'pending'),
  (v_school_id, id_9B, 'Saurabh Grover', 'saurabh.g@student.ir', '9B-04', 'paid'),
  (v_school_id, id_9B, 'Saurav Das',     'saurav.d@student.ir',  '9B-05', 'paid'),
  (v_school_id, id_9B, 'Seema Chauhan',  'seema.c@student.ir',   '9B-06', 'overdue'),
  (v_school_id, id_9B, 'Shailesh Tiwari','shailesh.t@student.ir','9B-07', 'paid'),
  (v_school_id, id_9B, 'Shaini Kaur',    'shaini.k@student.ir',  '9B-08', 'paid'),
  (v_school_id, id_9B, 'Shashank Rajput','shashank.r@student.ir','9B-09', 'paid'),
  (v_school_id, id_9B, 'Shilpa Kulkarni','shilpa.k@student.ir',  '9B-10', 'pending'),
  (v_school_id, id_9B, 'Shivangi Nag',   'shivangi.n@student.ir','9B-11', 'paid'),
  (v_school_id, id_9B, 'Shivani Joshi',  'shivani.j@student.ir', '9B-12', 'paid'),
  (v_school_id, id_9B, 'Shrey Agarwal',  'shrey.a@student.ir',   '9B-13', 'paid'),
  (v_school_id, id_9B, 'Soumya Menon',   'soumya.m@student.ir',  '9B-14', 'overdue'),
  (v_school_id, id_9B, 'Srijan Rao',     'srijan.r@student.ir',  '9B-15', 'paid'),
  (v_school_id, id_9B, 'Subhash Verma',  'subhash.v@student.ir', '9B-16', 'paid'),
  (v_school_id, id_9B, 'Sumedha Saxena', 'sumedha.s@student.ir', '9B-17', 'paid'),
  (v_school_id, id_9B, 'Sunidhi Thakkar','sunidhi.t@student.ir', '9B-18', 'pending'),
  (v_school_id, id_9B, 'Supriya Bendre', 'supriya.b@student.ir', '9B-19', 'paid'),
  (v_school_id, id_9B, 'Surya Pillai',   'surya.p@student.ir',   '9B-20', 'paid'),
  (v_school_id, id_9B, 'Swapnil Gore',   'swapnil.g@student.ir', '9B-21', 'paid'),
  (v_school_id, id_9B, 'Swara Joshi',    'swara.j@student.ir',   '9B-22', 'overdue'),
  (v_school_id, id_9B, 'Tanu Mittal',    'tanu.m@student.ir',    '9B-23', 'paid'),
  (v_school_id, id_9B, 'Tapan Ghosh',    'tapan.g@student.ir',   '9B-24', 'paid'),
  (v_school_id, id_9B, 'Tara Narayanan', 'tara.n@student.ir',    '9B-25', 'pending'),
  (v_school_id, id_9B, 'Tejas Nair',     'tejas.n@student.ir',   '9B-26', 'paid'),
  (v_school_id, id_9B, 'Trideep Bose',   'trideep.b@student.ir', '9B-27', 'paid'),
  (v_school_id, id_9B, 'Tushar Manoj',   'tushar.m@student.ir',  '9B-28', 'paid'),
  (v_school_id, id_9B, 'Urvi Choudhary', 'urvi.c@student.ir',    '9B-29', 'overdue'),
  (v_school_id, id_9B, 'Varun Mathur',   'varun.m@student.ir',   '9B-30', 'paid')
ON CONFLICT DO NOTHING;

RAISE NOTICE 'Students seeded: 240 students across 8 classes under school %', v_school_id;

END $$;  -- end student seed


-- ─────────────────────────────────────────────
-- 5. PERMISSIONS columns (idempotent)
-- ─────────────────────────────────────────────
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';


-- ─────────────────────────────────────────────
-- 6. DUMMY TEACHERS (with real Supabase Auth accounts)
-- Login password for all 6: InspireRise@2025
-- ─────────────────────────────────────────────
DO $teachers$
DECLARE
  v_school_id UUID;
  t1 UUID; t2 UUID; t3 UUID; t4 UUID; t5 UUID; t6 UUID;
BEGIN
  SELECT id INTO v_school_id FROM public.schools LIMIT 1;
  IF v_school_id IS NULL THEN RAISE EXCEPTION 'Run student seed block first.'; END IF;

  -- Generate UUIDs for new teachers
  t1 := gen_random_uuid(); t2 := gen_random_uuid();
  t3 := gen_random_uuid(); t4 := gen_random_uuid();
  t5 := gen_random_uuid(); t6 := gen_random_uuid();

  -- Create auth.users (skip if email already exists)
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, aud, role,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  SELECT v.id, '00000000-0000-0000-0000-000000000000'::uuid, v.email,
    crypt('InspireRise@2025', gen_salt('bf')),
    now(), 'authenticated', 'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()
  FROM (VALUES
    (t1, 'ramesh.pillai@inspirise.in'),
    (t2, 'sunita.menon@inspirise.in'),
    (t3, 'arvind.sharma@inspirise.in'),
    (t4, 'priya.iyer@inspirise.in'),
    (t5, 'geeta.yadav@inspirise.in'),
    (t6, 'karan.mehta@inspirise.in')
  ) AS v(id, email)
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.email = v.email);

  -- Re-resolve IDs (in case emails already existed before)
  SELECT id INTO t1 FROM auth.users WHERE email = 'ramesh.pillai@inspirise.in';
  SELECT id INTO t2 FROM auth.users WHERE email = 'sunita.menon@inspirise.in';
  SELECT id INTO t3 FROM auth.users WHERE email = 'arvind.sharma@inspirise.in';
  SELECT id INTO t4 FROM auth.users WHERE email = 'priya.iyer@inspirise.in';
  SELECT id INTO t5 FROM auth.users WHERE email = 'geeta.yadav@inspirise.in';
  SELECT id INTO t6 FROM auth.users WHERE email = 'karan.mehta@inspirise.in';

  -- Create auth.identities (needed for email/password login)
  INSERT INTO auth.identities (id, user_id, provider, identity_data, provider_id, created_at, updated_at)
  SELECT gen_random_uuid(), v.uid, 'email',
    jsonb_build_object('sub', v.uid::text, 'email', v.em),
    v.uid::text, now(), now()
  FROM (VALUES
    (t1, 'ramesh.pillai@inspirise.in'),
    (t2, 'sunita.menon@inspirise.in'),
    (t3, 'arvind.sharma@inspirise.in'),
    (t4, 'priya.iyer@inspirise.in'),
    (t5, 'geeta.yadav@inspirise.in'),
    (t6, 'karan.mehta@inspirise.in')
  ) AS v(uid, em)
  WHERE NOT EXISTS (SELECT 1 FROM auth.identities i WHERE i.provider_id = v.uid::text);

  -- Insert teacher records
  INSERT INTO public.teachers (id, school_id, name, email, role, subjects, class_teacher_of, permissions)
  VALUES
    (t1, v_school_id, 'Mr. Ramesh Pillai', 'ramesh.pillai@inspirise.in', 'teacher', ARRAY['Mathematics','Science'],        'Class 6 A', '{}'),
    (t2, v_school_id, 'Ms. Sunita Menon',  'sunita.menon@inspirise.in',  'teacher', ARRAY['English','Social Studies'],      'Class 7 A', '{}'),
    (t3, v_school_id, 'Mr. Arvind Sharma', 'arvind.sharma@inspirise.in', 'teacher', ARRAY['Mathematics','Hindi'],           'Class 8 A', '{}'),
    (t4, v_school_id, 'Ms. Priya Iyer',    'priya.iyer@inspirise.in',    'teacher', ARRAY['Science','Computer Science'],    'Class 9 A', '{}'),
    (t5, v_school_id, 'Ms. Geeta Yadav',   'geeta.yadav@inspirise.in',   'teacher', ARRAY['Hindi'],                         NULL,        '{}'),
    (t6, v_school_id, 'Mr. Karan Mehta',   'karan.mehta@inspirise.in',   'teacher', ARRAY['Computer Science'],              NULL,        '{}')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Teachers seeded: 6 teachers under school %', v_school_id;
END $teachers$;


-- ============================================================
-- TEACHER LOGINS (after running this seed)
-- ─────────────────────────────────────────
-- Email                         | Password
-- ramesh.pillai@inspirise.in    | InspireRise@2025  (Math, Science · Class 6A)
-- sunita.menon@inspirise.in     | InspireRise@2025  (English, Social Studies · Class 7A)
-- arvind.sharma@inspirise.in    | InspireRise@2025  (Math, Hindi · Class 8A)
-- priya.iyer@inspirise.in       | InspireRise@2025  (Science, CS · Class 9A)
-- geeta.yadav@inspirise.in      | InspireRise@2025  (Hindi)
-- karan.mehta@inspirise.in      | InspireRise@2025  (Computer Science)
-- ============================================================
