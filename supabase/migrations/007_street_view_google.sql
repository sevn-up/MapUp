-- Make mapillary_image_id optional (we're using Google Street View which finds panos from lat/lng)
ALTER TABLE public.street_view_locations ALTER COLUMN mapillary_image_id DROP NOT NULL;
ALTER TABLE public.street_view_locations ALTER COLUMN mapillary_image_id SET DEFAULT '';

-- Seed 40 curated Street View locations across the world
-- Easy: famous landmarks, clear signage, recognizable cities
-- Medium: suburban areas, some clues available
-- Hard: rural areas, minimal distinguishing features

INSERT INTO public.street_view_locations (lat, lng, country_code, difficulty, mapillary_image_id, tags) VALUES
-- EASY (well-known landmarks / cities with obvious signs)
(48.8584, 2.2945, 'FR', 'easy', '', '{landmark,europe}'),          -- Paris, Eiffel Tower area
(40.7580, -73.9855, 'US', 'easy', '', '{landmark,north_america}'), -- Times Square, NYC
(51.5007, -0.1246, 'GB', 'easy', '', '{landmark,europe}'),         -- Big Ben, London
(35.6762, 139.6503, 'JP', 'easy', '', '{landmark,asia}'),          -- Shibuya, Tokyo
(-33.8568, 151.2153, 'AU', 'easy', '', '{landmark,oceania}'),      -- Sydney Opera House
(41.9029, 12.4534, 'IT', 'easy', '', '{landmark,europe}'),         -- Vatican area, Rome
(55.7539, 37.6208, 'RU', 'easy', '', '{landmark,europe}'),         -- Red Square, Moscow
(-22.9519, -43.2105, 'BR', 'easy', '', '{landmark,south_america}'),-- Christ the Redeemer area, Rio
(37.9715, 23.7267, 'GR', 'easy', '', '{landmark,europe}'),         -- Acropolis area, Athens
(1.2834, 103.8607, 'SG', 'easy', '', '{landmark,asia}'),           -- Marina Bay, Singapore
(30.0444, 31.2357, 'EG', 'easy', '', '{landmark,africa}'),         -- Cairo, near pyramids road
(52.5200, 13.4050, 'DE', 'easy', '', '{landmark,europe}'),         -- Berlin, Alexanderplatz
(40.4168, -3.7038, 'ES', 'easy', '', '{landmark,europe}'),         -- Madrid, Gran Via

-- MEDIUM (cities/towns with some identifiable clues)
(59.3293, 18.0686, 'SE', 'medium', '', '{urban,europe}'),          -- Stockholm
(-34.6037, -58.3816, 'AR', 'medium', '', '{urban,south_america}'), -- Buenos Aires
(14.5995, 120.9842, 'PH', 'medium', '', '{urban,asia}'),           -- Manila
(6.5244, 3.3792, 'NG', 'medium', '', '{urban,africa}'),            -- Lagos
(-1.2921, 36.8219, 'KE', 'medium', '', '{urban,africa}'),          -- Nairobi
(13.7563, 100.5018, 'TH', 'medium', '', '{urban,asia}'),           -- Bangkok
(41.0082, 28.9784, 'TR', 'medium', '', '{urban,asia}'),            -- Istanbul
(-6.2088, 106.8456, 'ID', 'medium', '', '{urban,asia}'),           -- Jakarta
(33.8688, 151.2093, 'AU', 'medium', '', '{suburban,oceania}'),     -- Sydney suburbs
(19.0760, 72.8777, 'IN', 'medium', '', '{urban,asia}'),            -- Mumbai
(50.0755, 14.4378, 'CZ', 'medium', '', '{urban,europe}'),          -- Prague
(4.7110, -74.0721, 'CO', 'medium', '', '{urban,south_america}'),   -- Bogota
(-33.9249, 18.4241, 'ZA', 'medium', '', '{urban,africa}'),         -- Cape Town

-- HARD (rural, remote, or less distinguishable areas)
(64.1466, -21.9426, 'IS', 'hard', '', '{rural,europe}'),           -- Iceland countryside
(-41.2865, 174.7762, 'NZ', 'hard', '', '{rural,oceania}'),         -- New Zealand
(61.5240, 105.3188, 'RU', 'hard', '', '{rural,asia}'),             -- Siberia
(-15.4167, 28.2833, 'ZM', 'hard', '', '{rural,africa}'),           -- Zambia
(47.5162, 14.5501, 'AT', 'hard', '', '{rural,europe}'),            -- Austrian Alps road
(-23.5505, -46.6333, 'BR', 'hard', '', '{suburban,south_america}'),-- Sao Paulo outskirts
(36.2048, 138.2529, 'JP', 'hard', '', '{rural,asia}'),             -- Rural Japan
(7.8731, 80.7718, 'LK', 'hard', '', '{rural,asia}'),               -- Sri Lanka
(56.1304, -106.3468, 'CA', 'hard', '', '{rural,north_america}'),   -- Saskatchewan, Canada
(60.1699, 24.9384, 'FI', 'hard', '', '{suburban,europe}'),         -- Helsinki outskirts
(-13.1631, -72.5450, 'PE', 'hard', '', '{rural,south_america}'),   -- Near Machu Picchu road
(12.9716, 77.5946, 'IN', 'hard', '', '{suburban,asia}'),           -- Bangalore outskirts
(31.7917, -7.0926, 'MA', 'hard', '', '{rural,africa}'),            -- Morocco interior
(23.6345, -102.5528, 'MX', 'hard', '', '{rural,north_america}');   -- Rural Mexico
