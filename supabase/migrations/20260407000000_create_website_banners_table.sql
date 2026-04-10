-- Create website_banners table for admin panel banner management

-- First, create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS public.website_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  title VARCHAR(60) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  image_alt_text VARCHAR(200),
  link_url TEXT NOT NULL,
  link_type VARCHAR(20) NOT NULL CHECK (link_type IN ('category', 'menu_item', 'promotion', 'external')),
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  background_color VARCHAR(7) DEFAULT '#FFFFFF',
  text_color VARCHAR(7) DEFAULT '#000000',
  cta_button_text VARCHAR(30) DEFAULT 'Learn More',
  cta_button_color VARCHAR(7) DEFAULT '#FF0000',
  display_on_mobile BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.website_banners ENABLE ROW LEVEL SECURITY;

-- Create policies for website_banners
CREATE POLICY "Allow authenticated users to read website banners"
  ON public.website_banners
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert website banners"
  ON public.website_banners
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update website banners"
  ON public.website_banners
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete website banners"
  ON public.website_banners
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_website_banners_updated_at
BEFORE UPDATE ON public.website_banners
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_website_banners_branch_id ON public.website_banners(branch_id);
CREATE INDEX idx_website_banners_is_active ON public.website_banners(is_active);
CREATE INDEX idx_website_banners_position ON public.website_banners(position);
CREATE INDEX idx_website_banners_link_type ON public.website_banners(link_type);