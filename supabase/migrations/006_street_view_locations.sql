CREATE TABLE public.street_view_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  mapillary_image_id TEXT NOT NULL,
  country_code TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[] DEFAULT '{}',
  verified BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_svl_country ON public.street_view_locations(country_code);
CREATE INDEX idx_svl_difficulty ON public.street_view_locations(difficulty);

-- RLS
ALTER TABLE public.street_view_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Street view locations are viewable by authenticated users"
  ON public.street_view_locations FOR SELECT
  USING (auth.role() = 'authenticated');
