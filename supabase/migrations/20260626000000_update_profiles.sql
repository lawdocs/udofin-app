-- Migration: Update profiles table with new columns for app features
-- Adds: full_name, secondary_phone, language, theme, biometrics_enabled, notification prefs

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS secondary_phone TEXT,
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'English',
  ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS biometrics_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notifications_push BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notifications_email BOOLEAN NOT NULL DEFAULT false;

-- Update the existing trigger to also populate full_name from auth metadata (if available via Google OAuth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, mobile, full_name)
  VALUES (
    new.id,
    new.email,
    new.phone,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
