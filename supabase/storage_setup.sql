-- =====================================================
-- Supabase Storage Setup for Agency Logos
-- =====================================================
-- This file contains SQL commands to set up the storage bucket
-- and policies for agency logo uploads.
-- Run these commands in Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Paste & Run
-- =====================================================

-- 1. Create storage bucket (if not already created via UI)
-- Note: You may have already created this via the Supabase Dashboard UI
-- If so, you can skip this step or it will just return an error that bucket exists

INSERT INTO storage.buckets (id, name, public)
VALUES ('agency-logos', 'agency-logos', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. Storage Policies for agency-logos bucket
-- =====================================================

-- Policy: Allow authenticated users to upload their own logos
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'agency-logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to update their own logos
CREATE POLICY "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'agency-logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to delete their own logos
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'agency-logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow public read access to all logos (since bucket is public)
CREATE POLICY "Allow public reads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'agency-logos');

-- =====================================================
-- 3. Verify Setup (Optional - for debugging)
-- =====================================================

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'agency-logos';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%agency%';

-- =====================================================
-- ALTERNATIVE: Simpler policies (if above doesn't work)
-- =====================================================
-- If the above policies are too restrictive, you can drop them
-- and use these simpler ones:

-- First, drop the policies if they exist:
-- DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;

-- Then create simpler policies:
-- CREATE POLICY "Allow all authenticated operations"
-- ON storage.objects
-- FOR ALL
-- TO authenticated
-- USING (bucket_id = 'agency-logos')
-- WITH CHECK (bucket_id = 'agency-logos');

-- CREATE POLICY "Allow public read access"
-- ON storage.objects
-- FOR SELECT
-- TO public
-- USING (bucket_id = 'agency-logos');
