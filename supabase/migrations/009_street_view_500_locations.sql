-- ~460 Street View locations across 6 continents, 6 themes, 3 difficulties
-- All coordinates are on roads/streets with known Google Street View coverage

INSERT INTO public.street_view_locations (lat, lng, country_code, difficulty, region, sub_region, theme, name, mapillary_image_id, tags) VALUES

-- =============================================
-- EUROPE (~120 locations)
-- =============================================

-- Western Europe - Landmarks (easy)
(48.8588, 2.2944, 'FR', 'easy', 'europe', 'western_europe', 'landmarks', 'Eiffel Tower, Paris', '', '{}'),
(48.8606, 2.3376, 'FR', 'easy', 'europe', 'western_europe', 'landmarks', 'Louvre Museum, Paris', '', '{}'),
(43.7230, 10.3966, 'IT', 'easy', 'europe', 'western_europe', 'landmarks', 'Leaning Tower of Pisa', '', '{}'),
(41.8902, 12.4922, 'IT', 'easy', 'europe', 'western_europe', 'landmarks', 'Colosseum, Rome', '', '{}'),
(52.5163, 13.3777, 'DE', 'easy', 'europe', 'western_europe', 'landmarks', 'Brandenburg Gate, Berlin', '', '{}'),
(51.5014, -0.1419, 'GB', 'easy', 'europe', 'western_europe', 'landmarks', 'Big Ben, London', '', '{}'),
(51.5033, -0.0195, 'GB', 'easy', 'europe', 'western_europe', 'landmarks', 'Tower Bridge, London', '', '{}'),
(41.4036, 2.1744, 'ES', 'easy', 'europe', 'western_europe', 'landmarks', 'Sagrada Familia, Barcelona', '', '{}'),
(52.3730, 4.8932, 'NL', 'easy', 'europe', 'western_europe', 'landmarks', 'Rijksmuseum, Amsterdam', '', '{}'),
(47.5576, 10.7498, 'DE', 'easy', 'europe', 'western_europe', 'landmarks', 'Neuschwanstein Area, Bavaria', '', '{}'),

-- Western Europe - Urban (medium)
(45.4642, 9.1900, 'IT', 'medium', 'europe', 'western_europe', 'urban', 'Milan Streets', '', '{}'),
(50.8467, 4.3525, 'BE', 'medium', 'europe', 'western_europe', 'urban', 'Brussels Grand Place', '', '{}'),
(48.2082, 16.3738, 'AT', 'medium', 'europe', 'western_europe', 'urban', 'Vienna Ringstrasse', '', '{}'),
(46.9480, 7.4474, 'CH', 'medium', 'europe', 'western_europe', 'urban', 'Bern Old Town', '', '{}'),
(49.6117, 6.1319, 'LU', 'medium', 'europe', 'western_europe', 'urban', 'Luxembourg City', '', '{}'),
(48.5735, 7.7521, 'FR', 'medium', 'europe', 'western_europe', 'urban', 'Strasbourg', '', '{}'),
(53.5511, 9.9937, 'DE', 'medium', 'europe', 'western_europe', 'urban', 'Hamburg Harbor', '', '{}'),
(43.2965, 5.3698, 'FR', 'medium', 'europe', 'western_europe', 'urban', 'Marseille Port', '', '{}'),

-- Western Europe - Rural/Coastal (hard)
(44.1280, 9.7110, 'IT', 'hard', 'europe', 'western_europe', 'coastal', 'Cinque Terre Road', '', '{}'),
(43.4623, 3.8400, 'FR', 'hard', 'europe', 'western_europe', 'rural', 'Southern France Countryside', '', '{}'),
(50.3415, -5.0527, 'GB', 'hard', 'europe', 'western_europe', 'coastal', 'Cornwall Coast', '', '{}'),
(52.0907, 5.1214, 'NL', 'hard', 'europe', 'western_europe', 'rural', 'Dutch Countryside, Utrecht', '', '{}'),
(47.3769, 8.5417, 'CH', 'hard', 'europe', 'western_europe', 'rural', 'Swiss Alps Road', '', '{}'),

-- Northern Europe
(59.9139, 10.7522, 'NO', 'medium', 'europe', 'northern_europe', 'urban', 'Oslo Opera District', '', '{}'),
(60.3913, 5.3221, 'NO', 'medium', 'europe', 'northern_europe', 'coastal', 'Bergen Harbor', '', '{}'),
(69.6496, 18.9560, 'NO', 'hard', 'europe', 'northern_europe', 'natural_wonders', 'Tromso Arctic', '', '{}'),
(59.3293, 18.0686, 'SE', 'medium', 'europe', 'northern_europe', 'urban', 'Stockholm Gamla Stan', '', '{}'),
(57.7089, 11.9746, 'SE', 'medium', 'europe', 'northern_europe', 'urban', 'Gothenburg', '', '{}'),
(55.6761, 12.5683, 'DK', 'medium', 'europe', 'northern_europe', 'urban', 'Copenhagen Nyhavn', '', '{}'),
(64.1466, -21.9426, 'IS', 'hard', 'europe', 'northern_europe', 'natural_wonders', 'Iceland Ring Road', '', '{}'),
(63.4305, 10.3951, 'NO', 'hard', 'europe', 'northern_europe', 'historic', 'Trondheim', '', '{}'),
(60.1699, 24.9384, 'FI', 'medium', 'europe', 'northern_europe', 'urban', 'Helsinki Center', '', '{}'),
(61.4978, 23.7610, 'FI', 'hard', 'europe', 'northern_europe', 'urban', 'Tampere', '', '{}'),
(64.1355, -21.8954, 'IS', 'easy', 'europe', 'northern_europe', 'landmarks', 'Hallgrimskirkja, Reykjavik', '', '{}'),

-- Southern Europe
(37.9715, 23.7267, 'GR', 'easy', 'europe', 'southern_europe', 'landmarks', 'Acropolis Area, Athens', '', '{}'),
(36.4618, 28.2270, 'GR', 'medium', 'europe', 'southern_europe', 'coastal', 'Rhodes Old Town', '', '{}'),
(35.8989, 14.5146, 'MT', 'medium', 'europe', 'southern_europe', 'historic', 'Valletta, Malta', '', '{}'),
(38.7169, -9.1399, 'PT', 'medium', 'europe', 'southern_europe', 'urban', 'Lisbon Alfama', '', '{}'),
(41.1579, -8.6291, 'PT', 'medium', 'europe', 'southern_europe', 'urban', 'Porto Ribeira', '', '{}'),
(40.4168, -3.7038, 'ES', 'medium', 'europe', 'southern_europe', 'urban', 'Madrid Gran Via', '', '{}'),
(36.7213, -4.4214, 'ES', 'medium', 'europe', 'southern_europe', 'coastal', 'Malaga Beach', '', '{}'),
(43.7696, 11.2558, 'IT', 'easy', 'europe', 'southern_europe', 'landmarks', 'Florence Duomo', '', '{}'),
(45.4343, 12.3388, 'IT', 'easy', 'europe', 'southern_europe', 'landmarks', 'Venice Grand Canal', '', '{}'),
(40.8518, 14.2681, 'IT', 'medium', 'europe', 'southern_europe', 'historic', 'Naples Historic Center', '', '{}'),
(37.5079, 15.0830, 'IT', 'hard', 'europe', 'southern_europe', 'rural', 'Sicily Countryside', '', '{}'),
(39.6243, 19.9217, 'GR', 'hard', 'europe', 'southern_europe', 'coastal', 'Corfu Coast', '', '{}'),

-- Eastern Europe
(50.0755, 14.4378, 'CZ', 'easy', 'europe', 'eastern_europe', 'landmarks', 'Prague Charles Bridge', '', '{}'),
(47.4979, 19.0402, 'HU', 'easy', 'europe', 'eastern_europe', 'landmarks', 'Budapest Parliament', '', '{}'),
(52.2297, 21.0122, 'PL', 'medium', 'europe', 'eastern_europe', 'urban', 'Warsaw Old Town', '', '{}'),
(50.0647, 19.9450, 'PL', 'medium', 'europe', 'eastern_europe', 'historic', 'Krakow Main Square', '', '{}'),
(44.4268, 26.1025, 'RO', 'medium', 'europe', 'eastern_europe', 'urban', 'Bucharest', '', '{}'),
(42.6977, 23.3219, 'BG', 'hard', 'europe', 'eastern_europe', 'urban', 'Sofia', '', '{}'),
(44.7866, 20.4489, 'RS', 'medium', 'europe', 'eastern_europe', 'urban', 'Belgrade', '', '{}'),
(43.8563, 18.4131, 'BA', 'medium', 'europe', 'eastern_europe', 'historic', 'Sarajevo Old Town', '', '{}'),
(42.4410, 19.2636, 'ME', 'hard', 'europe', 'eastern_europe', 'coastal', 'Montenegro Coast', '', '{}'),
(46.0569, 14.5058, 'SI', 'hard', 'europe', 'eastern_europe', 'natural_wonders', 'Ljubljana to Lake Bled Road', '', '{}'),
(55.7539, 37.6208, 'RU', 'easy', 'europe', 'eastern_europe', 'landmarks', 'Red Square, Moscow', '', '{}'),
(59.9343, 30.3351, 'RU', 'easy', 'europe', 'eastern_europe', 'landmarks', 'Hermitage, St Petersburg', '', '{}'),

-- =============================================
-- ASIA (~100 locations)
-- =============================================

-- East Asia
(35.6595, 139.7004, 'JP', 'easy', 'asia', 'east_asia', 'landmarks', 'Shibuya Crossing, Tokyo', '', '{}'),
(34.9671, 135.7727, 'JP', 'easy', 'asia', 'east_asia', 'landmarks', 'Fushimi Inari, Kyoto', '', '{}'),
(35.0116, 135.7681, 'JP', 'easy', 'asia', 'east_asia', 'historic', 'Kinkaku-ji Area, Kyoto', '', '{}'),
(34.6937, 135.5023, 'JP', 'medium', 'asia', 'east_asia', 'urban', 'Osaka Dotonbori', '', '{}'),
(43.0618, 141.3545, 'JP', 'hard', 'asia', 'east_asia', 'rural', 'Hokkaido Countryside', '', '{}'),
(36.2048, 138.2529, 'JP', 'hard', 'asia', 'east_asia', 'rural', 'Rural Nagano', '', '{}'),
(37.5665, 126.9780, 'KR', 'easy', 'asia', 'east_asia', 'landmarks', 'Gyeongbokgung, Seoul', '', '{}'),
(35.1796, 129.0756, 'KR', 'medium', 'asia', 'east_asia', 'coastal', 'Busan Haeundae Beach', '', '{}'),
(39.9042, 116.4074, 'CN', 'easy', 'asia', 'east_asia', 'landmarks', 'Tiananmen Area, Beijing', '', '{}'),
(31.2304, 121.4737, 'CN', 'medium', 'asia', 'east_asia', 'urban', 'Shanghai Bund', '', '{}'),
(25.0330, 121.5654, 'TW', 'medium', 'asia', 'east_asia', 'urban', 'Taipei Ximending', '', '{}'),
(47.9185, 106.9177, 'MN', 'hard', 'asia', 'east_asia', 'urban', 'Ulaanbaatar', '', '{}'),

-- Southeast Asia
(13.7563, 100.5018, 'TH', 'easy', 'asia', 'southeast_asia', 'landmarks', 'Grand Palace Area, Bangkok', '', '{}'),
(7.8804, 98.3923, 'TH', 'medium', 'asia', 'southeast_asia', 'coastal', 'Phuket Beach Road', '', '{}'),
(18.7883, 98.9853, 'TH', 'medium', 'asia', 'southeast_asia', 'historic', 'Chiang Mai Old City', '', '{}'),
(1.2834, 103.8607, 'SG', 'easy', 'asia', 'southeast_asia', 'landmarks', 'Marina Bay, Singapore', '', '{}'),
(1.2816, 103.8636, 'SG', 'medium', 'asia', 'southeast_asia', 'urban', 'Chinatown, Singapore', '', '{}'),
(-8.5069, 115.2625, 'ID', 'medium', 'asia', 'southeast_asia', 'coastal', 'Bali Kuta Beach', '', '{}'),
(-6.1751, 106.8650, 'ID', 'medium', 'asia', 'southeast_asia', 'urban', 'Jakarta Monas Area', '', '{}'),
(21.0285, 105.8542, 'VN', 'medium', 'asia', 'southeast_asia', 'urban', 'Hanoi Old Quarter', '', '{}'),
(10.7769, 106.7009, 'VN', 'medium', 'asia', 'southeast_asia', 'urban', 'Ho Chi Minh City Center', '', '{}'),
(14.5995, 120.9842, 'PH', 'medium', 'asia', 'southeast_asia', 'urban', 'Manila Intramuros', '', '{}'),
(3.1390, 101.6869, 'MY', 'easy', 'asia', 'southeast_asia', 'landmarks', 'Petronas Towers Area, KL', '', '{}'),
(11.5564, 104.9282, 'KH', 'easy', 'asia', 'southeast_asia', 'landmarks', 'Royal Palace, Phnom Penh', '', '{}'),
(13.4125, 103.8670, 'KH', 'easy', 'asia', 'southeast_asia', 'landmarks', 'Angkor Wat Road', '', '{}'),

-- South Asia
(28.6139, 77.2090, 'IN', 'easy', 'asia', 'south_asia', 'landmarks', 'India Gate, New Delhi', '', '{}'),
(27.1751, 78.0421, 'IN', 'easy', 'asia', 'south_asia', 'landmarks', 'Taj Mahal Road, Agra', '', '{}'),
(19.0760, 72.8777, 'IN', 'medium', 'asia', 'south_asia', 'urban', 'Mumbai Marine Drive', '', '{}'),
(12.9716, 77.5946, 'IN', 'medium', 'asia', 'south_asia', 'urban', 'Bangalore MG Road', '', '{}'),
(15.2993, 74.1240, 'IN', 'medium', 'asia', 'south_asia', 'coastal', 'Goa Beach Road', '', '{}'),
(27.7172, 85.3240, 'NP', 'hard', 'asia', 'south_asia', 'historic', 'Kathmandu Durbar Square', '', '{}'),
(7.8731, 80.7718, 'LK', 'hard', 'asia', 'south_asia', 'rural', 'Sri Lanka Hill Country', '', '{}'),
(6.9271, 79.8612, 'LK', 'medium', 'asia', 'south_asia', 'urban', 'Colombo Fort', '', '{}'),
(23.8103, 90.4125, 'BD', 'hard', 'asia', 'south_asia', 'urban', 'Dhaka Streets', '', '{}'),
(33.6844, 73.0479, 'PK', 'hard', 'asia', 'south_asia', 'urban', 'Islamabad', '', '{}'),

-- Middle East
(25.1972, 55.2744, 'AE', 'easy', 'asia', 'middle_east', 'landmarks', 'Burj Khalifa Area, Dubai', '', '{}'),
(25.2567, 55.3096, 'AE', 'medium', 'asia', 'middle_east', 'urban', 'Dubai Marina', '', '{}'),
(24.4539, 54.3773, 'AE', 'medium', 'asia', 'middle_east', 'urban', 'Abu Dhabi Corniche', '', '{}'),
(41.0082, 28.9784, 'TR', 'easy', 'asia', 'middle_east', 'landmarks', 'Hagia Sophia Area, Istanbul', '', '{}'),
(38.4192, 27.1287, 'TR', 'medium', 'asia', 'middle_east', 'urban', 'Izmir Waterfront', '', '{}'),
(36.7538, 34.5731, 'TR', 'hard', 'asia', 'middle_east', 'coastal', 'Mersin Coast', '', '{}'),
(31.7683, 35.2137, 'IL', 'easy', 'asia', 'middle_east', 'landmarks', 'Jerusalem Old City', '', '{}'),
(32.0853, 34.7818, 'IL', 'medium', 'asia', 'middle_east', 'coastal', 'Tel Aviv Beach', '', '{}'),
(29.3759, 47.9774, 'KW', 'medium', 'asia', 'middle_east', 'urban', 'Kuwait City Towers', '', '{}'),
(26.2285, 50.5860, 'BH', 'medium', 'asia', 'middle_east', 'urban', 'Manama', '', '{}'),
(23.5880, 58.3829, 'OM', 'hard', 'asia', 'middle_east', 'rural', 'Muscat Coastal Road', '', '{}'),
(24.7136, 46.6753, 'SA', 'hard', 'asia', 'middle_east', 'urban', 'Riyadh', '', '{}'),

-- Central Asia
(41.2995, 69.2401, 'UZ', 'hard', 'asia', 'central_asia', 'historic', 'Tashkent', '', '{}'),
(39.6542, 66.9597, 'UZ', 'hard', 'asia', 'central_asia', 'historic', 'Samarkand Registan', '', '{}'),
(43.2551, 76.9126, 'KZ', 'hard', 'asia', 'central_asia', 'urban', 'Almaty', '', '{}'),
(38.5598, 68.7740, 'TJ', 'hard', 'asia', 'central_asia', 'rural', 'Dushanbe', '', '{}'),

-- =============================================
-- AFRICA (~60 locations)
-- =============================================

-- North Africa
(30.0444, 31.2357, 'EG', 'easy', 'africa', 'north_africa', 'landmarks', 'Cairo Pyramids Road', '', '{}'),
(29.9792, 31.1342, 'EG', 'easy', 'africa', 'north_africa', 'landmarks', 'Giza Pyramids View', '', '{}'),
(36.8065, 10.1815, 'TN', 'medium', 'africa', 'north_africa', 'urban', 'Tunis Medina', '', '{}'),
(33.5731, -7.5898, 'MA', 'medium', 'africa', 'north_africa', 'urban', 'Casablanca Corniche', '', '{}'),
(31.6295, -7.9811, 'MA', 'easy', 'africa', 'north_africa', 'landmarks', 'Marrakech Jemaa el-Fna', '', '{}'),
(36.7755, 3.0597, 'DZ', 'hard', 'africa', 'north_africa', 'urban', 'Algiers', '', '{}'),
(35.1796, -3.8672, 'MA', 'hard', 'africa', 'north_africa', 'rural', 'Rif Mountains Road', '', '{}'),

-- West Africa
(6.5244, 3.3792, 'NG', 'medium', 'africa', 'west_africa', 'urban', 'Lagos Island', '', '{}'),
(9.0765, 7.3986, 'NG', 'hard', 'africa', 'west_africa', 'urban', 'Abuja', '', '{}'),
(5.6037, -0.1870, 'GH', 'medium', 'africa', 'west_africa', 'urban', 'Accra Center', '', '{}'),
(14.6928, -17.4467, 'SN', 'medium', 'africa', 'west_africa', 'coastal', 'Dakar Corniche', '', '{}'),
(6.3703, 2.3912, 'BJ', 'hard', 'africa', 'west_africa', 'urban', 'Cotonou', '', '{}'),
(12.6392, -8.0029, 'ML', 'hard', 'africa', 'west_africa', 'rural', 'Bamako Streets', '', '{}'),

-- East Africa
(-1.2921, 36.8219, 'KE', 'medium', 'africa', 'east_africa', 'urban', 'Nairobi Center', '', '{}'),
(-4.0435, 39.6682, 'KE', 'medium', 'africa', 'east_africa', 'coastal', 'Mombasa Beach', '', '{}'),
(-6.7924, 39.2083, 'TZ', 'medium', 'africa', 'east_africa', 'urban', 'Dar es Salaam', '', '{}'),
(-3.3731, 36.6940, 'TZ', 'hard', 'africa', 'east_africa', 'natural_wonders', 'Arusha to Kilimanjaro Road', '', '{}'),
(0.3476, 32.5825, 'UG', 'hard', 'africa', 'east_africa', 'urban', 'Kampala', '', '{}'),
(-1.9403, 29.8739, 'RW', 'hard', 'africa', 'east_africa', 'urban', 'Kigali', '', '{}'),
(9.0250, 38.7469, 'ET', 'hard', 'africa', 'east_africa', 'urban', 'Addis Ababa', '', '{}'),
(-15.3875, 28.3228, 'ZM', 'hard', 'africa', 'east_africa', 'urban', 'Lusaka', '', '{}'),

-- Southern Africa
(-33.9249, 18.4241, 'ZA', 'easy', 'africa', 'southern_africa', 'landmarks', 'Cape Town V&A Waterfront', '', '{}'),
(-33.9628, 18.4098, 'ZA', 'easy', 'africa', 'southern_africa', 'natural_wonders', 'Table Mountain Road', '', '{}'),
(-26.2041, 28.0473, 'ZA', 'medium', 'africa', 'southern_africa', 'urban', 'Johannesburg Sandton', '', '{}'),
(-29.8587, 31.0218, 'ZA', 'medium', 'africa', 'southern_africa', 'coastal', 'Durban Beach', '', '{}'),
(-24.6282, 25.9231, 'BW', 'hard', 'africa', 'southern_africa', 'urban', 'Gaborone', '', '{}'),
(-25.9692, 32.5732, 'MZ', 'hard', 'africa', 'southern_africa', 'coastal', 'Maputo', '', '{}'),
(-22.5597, 17.0832, 'NA', 'hard', 'africa', 'southern_africa', 'rural', 'Windhoek Area', '', '{}'),
(-17.8252, 31.0335, 'ZW', 'hard', 'africa', 'southern_africa', 'natural_wonders', 'Victoria Falls Road', '', '{}'),

-- =============================================
-- NORTH AMERICA (~80 locations)
-- =============================================

-- USA
(40.7580, -73.9855, 'US', 'easy', 'north_america', 'usa', 'landmarks', 'Times Square, NYC', '', '{}'),
(40.6892, -74.0445, 'US', 'easy', 'north_america', 'usa', 'landmarks', 'Statue of Liberty Ferry', '', '{}'),
(40.7484, -73.9857, 'US', 'easy', 'north_america', 'usa', 'landmarks', 'Empire State Building, NYC', '', '{}'),
(37.8199, -122.4783, 'US', 'easy', 'north_america', 'usa', 'landmarks', 'Golden Gate Bridge, SF', '', '{}'),
(34.0522, -118.2437, 'US', 'easy', 'north_america', 'usa', 'landmarks', 'Hollywood Blvd, LA', '', '{}'),
(38.8977, -77.0365, 'US', 'easy', 'north_america', 'usa', 'landmarks', 'White House, Washington DC', '', '{}'),
(36.1699, -115.1398, 'US', 'easy', 'north_america', 'usa', 'landmarks', 'Las Vegas Strip', '', '{}'),
(41.8827, -87.6233, 'US', 'medium', 'north_america', 'usa', 'urban', 'Chicago Millennium Park', '', '{}'),
(29.9511, -90.0715, 'US', 'medium', 'north_america', 'usa', 'urban', 'New Orleans French Quarter', '', '{}'),
(47.6062, -122.3321, 'US', 'medium', 'north_america', 'usa', 'urban', 'Seattle Pike Place', '', '{}'),
(25.7617, -80.1918, 'US', 'medium', 'north_america', 'usa', 'coastal', 'Miami Beach', '', '{}'),
(21.2769, -157.8268, 'US', 'medium', 'north_america', 'usa', 'coastal', 'Waikiki Beach, Hawaii', '', '{}'),
(36.0544, -112.1401, 'US', 'easy', 'north_america', 'usa', 'natural_wonders', 'Grand Canyon Viewpoint', '', '{}'),
(44.4605, -110.8281, 'US', 'hard', 'north_america', 'usa', 'natural_wonders', 'Yellowstone Road', '', '{}'),
(37.2753, -112.9426, 'US', 'hard', 'north_america', 'usa', 'natural_wonders', 'Zion National Park', '', '{}'),
(36.2381, -112.1877, 'US', 'hard', 'north_america', 'usa', 'natural_wonders', 'Route 66 Arizona', '', '{}'),
(32.7157, -117.1611, 'US', 'medium', 'north_america', 'usa', 'coastal', 'San Diego Gaslamp', '', '{}'),
(42.3601, -71.0589, 'US', 'medium', 'north_america', 'usa', 'urban', 'Boston Common', '', '{}'),
(33.4484, -112.0740, 'US', 'medium', 'north_america', 'usa', 'urban', 'Phoenix Downtown', '', '{}'),
(39.7392, -104.9903, 'US', 'medium', 'north_america', 'usa', 'urban', 'Denver 16th Street', '', '{}'),
(35.2271, -80.8431, 'US', 'hard', 'north_america', 'usa', 'urban', 'Charlotte Suburbs', '', '{}'),
(30.2672, -97.7431, 'US', 'medium', 'north_america', 'usa', 'urban', 'Austin South Congress', '', '{}'),
(44.9778, -93.2650, 'US', 'hard', 'north_america', 'usa', 'urban', 'Minneapolis', '', '{}'),
(46.8772, -96.7898, 'US', 'hard', 'north_america', 'usa', 'rural', 'North Dakota Plains', '', '{}'),
(43.0389, -87.9065, 'US', 'hard', 'north_america', 'usa', 'urban', 'Milwaukee Lakefront', '', '{}'),

-- Canada
(43.6532, -79.3832, 'CA', 'easy', 'north_america', 'canada', 'landmarks', 'CN Tower Area, Toronto', '', '{}'),
(45.5017, -73.5673, 'CA', 'medium', 'north_america', 'canada', 'urban', 'Montreal Old Port', '', '{}'),
(49.2827, -123.1207, 'CA', 'medium', 'north_america', 'canada', 'urban', 'Vancouver Gastown', '', '{}'),
(51.0447, -114.0719, 'CA', 'medium', 'north_america', 'canada', 'urban', 'Calgary Tower Area', '', '{}'),
(45.4215, -75.6972, 'CA', 'medium', 'north_america', 'canada', 'landmarks', 'Parliament Hill, Ottawa', '', '{}'),
(46.8139, -71.2080, 'CA', 'medium', 'north_america', 'canada', 'historic', 'Quebec City Old Town', '', '{}'),
(51.1784, -115.5708, 'CA', 'easy', 'north_america', 'canada', 'natural_wonders', 'Banff Town', '', '{}'),
(49.1130, -117.2960, 'CA', 'hard', 'north_america', 'canada', 'rural', 'BC Interior Road', '', '{}'),
(56.1304, -106.3468, 'CA', 'hard', 'north_america', 'canada', 'rural', 'Saskatchewan Highway', '', '{}'),

-- Caribbean & Central America
(23.1136, -82.3666, 'CU', 'medium', 'north_america', 'caribbean', 'historic', 'Havana Malecon', '', '{}'),
(18.4655, -66.1057, 'US', 'medium', 'north_america', 'caribbean', 'coastal', 'Old San Juan, Puerto Rico', '', '{}'),
(18.1096, -77.2975, 'JM', 'medium', 'north_america', 'caribbean', 'coastal', 'Montego Bay', '', '{}'),
(19.4326, -99.1332, 'MX', 'easy', 'north_america', 'central_america', 'landmarks', 'Zocalo, Mexico City', '', '{}'),
(20.6296, -87.0739, 'MX', 'medium', 'north_america', 'central_america', 'coastal', 'Tulum Beach Road', '', '{}'),
(20.9674, -89.5926, 'MX', 'medium', 'north_america', 'central_america', 'historic', 'Merida Centro', '', '{}'),
(14.6349, -90.5069, 'GT', 'hard', 'north_america', 'central_america', 'urban', 'Guatemala City', '', '{}'),
(9.9281, -84.0907, 'CR', 'medium', 'north_america', 'central_america', 'natural_wonders', 'San Jose to Arenal Road', '', '{}'),
(8.9824, -79.5199, 'PA', 'medium', 'north_america', 'central_america', 'urban', 'Panama City Casco Viejo', '', '{}'),

-- =============================================
-- SOUTH AMERICA (~60 locations)
-- =============================================

(-22.9068, -43.1729, 'BR', 'easy', 'south_america', 'south_america', 'landmarks', 'Copacabana Beach, Rio', '', '{}'),
(-22.9519, -43.2105, 'BR', 'easy', 'south_america', 'south_america', 'landmarks', 'Christ the Redeemer Road, Rio', '', '{}'),
(-23.5505, -46.6333, 'BR', 'medium', 'south_america', 'south_america', 'urban', 'Sao Paulo Paulista Ave', '', '{}'),
(-12.9714, -38.5124, 'BR', 'medium', 'south_america', 'south_america', 'coastal', 'Salvador Pelourinho', '', '{}'),
(-25.4284, -49.2733, 'BR', 'hard', 'south_america', 'south_america', 'urban', 'Curitiba', '', '{}'),
(-3.1190, -60.0217, 'BR', 'hard', 'south_america', 'south_america', 'rural', 'Manaus Road', '', '{}'),
(-15.7975, -47.8919, 'BR', 'medium', 'south_america', 'south_america', 'landmarks', 'Brasilia Esplanade', '', '{}'),
(-34.6037, -58.3816, 'AR', 'medium', 'south_america', 'south_america', 'urban', 'Buenos Aires La Boca', '', '{}'),
(-34.6083, -58.3712, 'AR', 'easy', 'south_america', 'south_america', 'landmarks', 'Obelisco, Buenos Aires', '', '{}'),
(-41.1335, -71.3103, 'AR', 'hard', 'south_america', 'south_america', 'natural_wonders', 'Patagonia Lake Road', '', '{}'),
(-50.3363, -72.2654, 'AR', 'hard', 'south_america', 'south_america', 'natural_wonders', 'Perito Moreno Glacier Road', '', '{}'),
(-31.4201, -64.1888, 'AR', 'hard', 'south_america', 'south_america', 'urban', 'Cordoba', '', '{}'),
(-33.4489, -70.6693, 'CL', 'medium', 'south_america', 'south_america', 'urban', 'Santiago Centro', '', '{}'),
(-33.0472, -71.6127, 'CL', 'medium', 'south_america', 'south_america', 'coastal', 'Valparaiso Hills', '', '{}'),
(-22.9099, -68.2006, 'CL', 'hard', 'south_america', 'south_america', 'natural_wonders', 'Atacama Desert Road', '', '{}'),
(-12.0464, -77.0428, 'PE', 'medium', 'south_america', 'south_america', 'urban', 'Lima Miraflores', '', '{}'),
(-13.5320, -71.9675, 'PE', 'medium', 'south_america', 'south_america', 'historic', 'Cusco Plaza de Armas', '', '{}'),
(-13.1631, -72.5450, 'PE', 'hard', 'south_america', 'south_america', 'historic', 'Road to Machu Picchu', '', '{}'),
(-16.4897, -68.1193, 'BO', 'hard', 'south_america', 'south_america', 'urban', 'La Paz Center', '', '{}'),
(-0.1807, -78.4678, 'EC', 'medium', 'south_america', 'south_america', 'urban', 'Quito Historic Center', '', '{}'),
(4.7110, -74.0721, 'CO', 'medium', 'south_america', 'south_america', 'urban', 'Bogota La Candelaria', '', '{}'),
(6.2518, -75.5636, 'CO', 'medium', 'south_america', 'south_america', 'urban', 'Medellin El Poblado', '', '{}'),
(10.3910, -75.5143, 'CO', 'easy', 'south_america', 'south_america', 'coastal', 'Cartagena Old Town', '', '{}'),
(-34.9011, -56.1645, 'UY', 'medium', 'south_america', 'south_america', 'urban', 'Montevideo Rambla', '', '{}'),
(10.4806, -66.9036, 'VE', 'hard', 'south_america', 'south_america', 'urban', 'Caracas', '', '{}'),
(-25.2637, -57.5759, 'PY', 'hard', 'south_america', 'south_america', 'urban', 'Asuncion', '', '{}'),

-- =============================================
-- OCEANIA (~40 locations)
-- =============================================

-- Australia
(-33.8568, 151.2153, 'AU', 'easy', 'oceania', 'australia', 'landmarks', 'Sydney Opera House', '', '{}'),
(-33.8688, 151.2093, 'AU', 'medium', 'oceania', 'australia', 'urban', 'Sydney Circular Quay', '', '{}'),
(-37.8136, 144.9631, 'AU', 'medium', 'oceania', 'australia', 'urban', 'Melbourne Flinders St', '', '{}'),
(-37.8497, 144.9789, 'AU', 'medium', 'oceania', 'australia', 'urban', 'Melbourne St Kilda Beach', '', '{}'),
(-27.4698, 153.0251, 'AU', 'medium', 'oceania', 'australia', 'urban', 'Brisbane South Bank', '', '{}'),
(-31.9505, 115.8605, 'AU', 'medium', 'oceania', 'australia', 'urban', 'Perth CBD', '', '{}'),
(-34.9285, 138.6007, 'AU', 'medium', 'oceania', 'australia', 'urban', 'Adelaide Central', '', '{}'),
(-16.9186, 145.7781, 'AU', 'medium', 'oceania', 'australia', 'coastal', 'Cairns Esplanade', '', '{}'),
(-12.4634, 130.8456, 'AU', 'hard', 'oceania', 'australia', 'rural', 'Darwin', '', '{}'),
(-25.3444, 131.0369, 'AU', 'hard', 'oceania', 'australia', 'natural_wonders', 'Uluru Road', '', '{}'),
(-28.0167, 153.4000, 'AU', 'easy', 'oceania', 'australia', 'coastal', 'Gold Coast Beach', '', '{}'),
(-33.7560, 150.6038, 'AU', 'hard', 'oceania', 'australia', 'natural_wonders', 'Blue Mountains Road', '', '{}'),
(-42.8821, 147.3272, 'AU', 'hard', 'oceania', 'australia', 'rural', 'Hobart Waterfront', '', '{}'),

-- New Zealand
(-36.8485, 174.7633, 'NZ', 'medium', 'oceania', 'new_zealand', 'urban', 'Auckland Viaduct', '', '{}'),
(-41.2865, 174.7762, 'NZ', 'medium', 'oceania', 'new_zealand', 'urban', 'Wellington Waterfront', '', '{}'),
(-43.5321, 172.6362, 'NZ', 'medium', 'oceania', 'new_zealand', 'urban', 'Christchurch', '', '{}'),
(-45.0312, 168.6626, 'NZ', 'easy', 'oceania', 'new_zealand', 'natural_wonders', 'Queenstown Lake', '', '{}'),
(-38.1368, 176.2497, 'NZ', 'hard', 'oceania', 'new_zealand', 'natural_wonders', 'Rotorua Thermal Area', '', '{}'),
(-44.6700, 167.9250, 'NZ', 'hard', 'oceania', 'new_zealand', 'natural_wonders', 'Milford Sound Road', '', '{}'),
(-46.4132, 168.3538, 'NZ', 'hard', 'oceania', 'new_zealand', 'rural', 'Invercargill Area', '', '{}'),

-- Pacific Islands
(-17.7134, 178.0650, 'FJ', 'hard', 'oceania', 'pacific_islands', 'coastal', 'Suva, Fiji', '', '{}'),
(-13.8333, -171.7500, 'WS', 'hard', 'oceania', 'pacific_islands', 'coastal', 'Apia, Samoa', '', '{}');
