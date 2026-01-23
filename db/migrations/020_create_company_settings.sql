-- Migration: Create company_settings table and storage bucket
-- Description: Stores company branding information (logo, favicon, company name)

-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL DEFAULT '12Vai',
    logo_url TEXT,
    favicon_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create storage bucket for company assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for company-assets bucket
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload company assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-assets');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update company assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'company-assets');

-- Allow public read access
CREATE POLICY "Public can view company assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-assets');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete company assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'company-assets');

-- Insert default company settings
INSERT INTO company_settings (company_name)
VALUES ('12Vai')
ON CONFLICT DO NOTHING;

-- Add RLS policies
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Allow public to read company settings
CREATE POLICY "Public can read company settings"
ON company_settings FOR SELECT
TO public
USING (true);

-- Only admins can update company settings
CREATE POLICY "Admins can update company settings"
ON company_settings FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_admin = true
    )
);

-- Only admins can insert company settings
CREATE POLICY "Admins can insert company settings"
ON company_settings FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_admin = true
    )
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_company_settings_updated_at ON company_settings(updated_at DESC);

-- Add comment
COMMENT ON TABLE company_settings IS 'Stores company branding and identity information';
COMMENT ON COLUMN company_settings.company_name IS 'Name of the company';
COMMENT ON COLUMN company_settings.logo_url IS 'URL to the company logo image';
COMMENT ON COLUMN company_settings.favicon_url IS 'URL to the company favicon image';
