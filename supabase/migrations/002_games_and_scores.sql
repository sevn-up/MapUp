-- Daily challenges table (referenced by game_sessions)
CREATE TABLE public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE UNIQUE NOT NULL,
  game_mode TEXT NOT NULL,
  seed TEXT NOT NULL,
  target_country TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_daily_date ON public.daily_challenges(challenge_date DESC);

-- Game sessions table
CREATE TABLE public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_mode TEXT NOT NULL CHECK (game_mode IN ('country_shape', 'name_all', 'worldle', 'street_view')),
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER,
  time_seconds INTEGER,
  correct_count INTEGER DEFAULT 0 NOT NULL,
  total_count INTEGER DEFAULT 0 NOT NULL,
  xp_earned INTEGER DEFAULT 0 NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_daily BOOLEAN DEFAULT false NOT NULL,
  daily_challenge_id UUID REFERENCES public.daily_challenges(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_game_sessions_user ON public.game_sessions(user_id, created_at DESC);
CREATE INDEX idx_game_sessions_mode ON public.game_sessions(game_mode, score DESC);
CREATE INDEX idx_game_sessions_daily ON public.game_sessions(daily_challenge_id) WHERE is_daily = true;

-- RLS
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily challenges are viewable by everyone"
  ON public.daily_challenges FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own game sessions"
  ON public.game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own game sessions"
  ON public.game_sessions FOR SELECT
  USING (auth.uid() = user_id);
