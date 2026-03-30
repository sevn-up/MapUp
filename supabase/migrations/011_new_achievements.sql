-- Achievements for Capitals Quiz, Flag Quiz, and Population Challenge

INSERT INTO public.achievements (id, name, description, icon, category, xp_reward, requirement) VALUES
-- Capitals Quiz
('capitals_perfect', 'Capital Expert', 'Score 10/10 on Capitals Quiz', '🏛️', 'capitals', 150,
  '{"type": "perfect_score", "mode": "capitals"}'),
('capitals_50', 'Capital Knowledge', 'Correctly name 50 different capitals', '📚', 'capitals', 200,
  '{"type": "unique_correct", "mode": "capitals", "value": 50}'),
('capitals_100', 'Capital Master', 'Correctly name 100 different capitals', '🎓', 'capitals', 500,
  '{"type": "unique_correct", "mode": "capitals", "value": 100}'),
('capitals_all', 'Capital Genius', 'Correctly name all 197 capitals', '🏅', 'capitals', 2000,
  '{"type": "unique_correct", "mode": "capitals", "value": 197}'),

-- Flag Quiz
('flag_perfect', 'Flag Expert', 'Score 10/10 on Flag Quiz', '🚩', 'flag_quiz', 150,
  '{"type": "perfect_score", "mode": "flag_quiz"}'),
('flag_50', 'Vexillologist', 'Identify 50 different flags', '🏴', 'flag_quiz', 200,
  '{"type": "unique_correct", "mode": "flag_quiz", "value": 50}'),
('flag_streak', 'Flag Streak', 'Get 20 flags correct in a row', '🔥', 'flag_quiz', 300,
  '{"type": "score_threshold", "mode": "flag_quiz", "value": 20}'),
('flag_speed', 'Quick Draw', 'Complete a 10-round flag quiz in under 30 seconds', '⚡', 'flag_quiz', 500,
  '{"type": "speed_threshold", "mode": "flag_quiz", "rounds": 10, "seconds": 30}'),

-- Population Challenge
('pop_streak_5', 'Number Cruncher', 'Reach a population streak of 5', '📊', 'population', 100,
  '{"type": "pop_streak", "value": 5}'),
('pop_streak_10', 'Demographer', 'Reach a population streak of 10', '📈', 'population', 250,
  '{"type": "pop_streak", "value": 10}'),
('pop_streak_20', 'Census Expert', 'Reach a population streak of 20', '🧮', 'population', 500,
  '{"type": "pop_streak", "value": 20}'),
('pop_streak_50', 'Population Oracle', 'Reach a population streak of 50', '👁️', 'population', 2000,
  '{"type": "pop_streak", "value": 50}');
