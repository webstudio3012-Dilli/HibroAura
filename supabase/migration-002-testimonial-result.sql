-- HibroAura — migration 002: add the "Result" field to customer testimonials.
-- Supabase → SQL Editor → paste → Run. Safe to run more than once. Existing testimonials are kept.
alter table public.testimonials
  add column if not exists result text check (result is null or char_length(result) <= 80);