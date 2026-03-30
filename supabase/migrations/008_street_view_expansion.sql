-- Street View expansion: add region, sub_region, theme, name columns

ALTER TABLE public.street_view_locations
  ADD COLUMN IF NOT EXISTS region TEXT CHECK (region IN (
    'europe', 'asia', 'africa', 'north_america', 'south_america', 'oceania'
  ));

ALTER TABLE public.street_view_locations
  ADD COLUMN IF NOT EXISTS sub_region TEXT;

ALTER TABLE public.street_view_locations
  ADD COLUMN IF NOT EXISTS theme TEXT CHECK (theme IN (
    'landmarks', 'natural_wonders', 'historic', 'coastal', 'urban', 'rural'
  ));

ALTER TABLE public.street_view_locations
  ADD COLUMN IF NOT EXISTS name TEXT;

-- Indexes for filtered queries
CREATE INDEX IF NOT EXISTS idx_svl_region ON public.street_view_locations(region);
CREATE INDEX IF NOT EXISTS idx_svl_sub_region ON public.street_view_locations(sub_region);
CREATE INDEX IF NOT EXISTS idx_svl_theme ON public.street_view_locations(theme);
CREATE INDEX IF NOT EXISTS idx_svl_region_difficulty ON public.street_view_locations(region, difficulty);

-- Backfill existing 40 locations based on their tags
UPDATE public.street_view_locations SET region = 'europe' WHERE tags @> '{europe}' AND region IS NULL;
UPDATE public.street_view_locations SET region = 'asia' WHERE tags @> '{asia}' AND region IS NULL;
UPDATE public.street_view_locations SET region = 'africa' WHERE tags @> '{africa}' AND region IS NULL;
UPDATE public.street_view_locations SET region = 'north_america' WHERE tags @> '{north_america}' AND region IS NULL;
UPDATE public.street_view_locations SET region = 'south_america' WHERE tags @> '{south_america}' AND region IS NULL;
UPDATE public.street_view_locations SET region = 'oceania' WHERE tags @> '{oceania}' AND region IS NULL;
UPDATE public.street_view_locations SET theme = 'landmarks' WHERE tags @> '{landmark}' AND theme IS NULL;
UPDATE public.street_view_locations SET theme = 'urban' WHERE tags @> '{urban}' AND theme IS NULL;
UPDATE public.street_view_locations SET theme = 'rural' WHERE tags @> '{rural}' AND theme IS NULL;
