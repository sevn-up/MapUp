-- Allow new game modes in game_sessions table
ALTER TABLE public.game_sessions DROP CONSTRAINT game_sessions_game_mode_check;
ALTER TABLE public.game_sessions ADD CONSTRAINT game_sessions_game_mode_check
  CHECK (game_mode IN ('country_shape', 'name_all', 'worldle', 'street_view', 'capitals', 'flag_quiz', 'population'));
