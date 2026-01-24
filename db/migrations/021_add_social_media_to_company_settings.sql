-- Migration: Add social media fields to company_settings
-- Description: Adds Instagram, Facebook, and YouTube URL fields to company settings

-- Add social media columns
ALTER TABLE company_settings
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Add comments
COMMENT ON COLUMN company_settings.instagram_url IS 'URL to the company Instagram profile';
COMMENT ON COLUMN company_settings.facebook_url IS 'URL to the company Facebook page';
COMMENT ON COLUMN company_settings.youtube_url IS 'URL to the company YouTube channel';
