CREATE TABLE public.leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_mode TEXT NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'alltime')),
  best_score INTEGER NOT NULL,
  total_games INTEGER DEFAULT 0 NOT NULL,
  rank INTEGER,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, game_mode, period)
);

CREATE INDEX idx_leaderboard ON public.leaderboard_cache(game_mode, period, rank ASC);

-- RLS
ALTER TABLE public.leaderboard_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboard is viewable by everyone"
  ON public.leaderboard_cache FOR SELECT
  USING (true);

-- Enable realtime for leaderboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard_cache;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
