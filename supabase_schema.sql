-- Run this in the Supabase SQL Editor to set up the database schema.

-- Profiles table (auto-created via trigger on signup, but we can also insert manually)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Results table (one row per completed game)
CREATE TABLE IF NOT EXISTS public.results (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  yapdle_number INTEGER NOT NULL,
  guesses_count INTEGER NOT NULL,
  won BOOLEAN NOT NULL,
  played_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, yapdle_number)
);

-- Leaderboard view (materialized for performance)
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  p.username,
  COUNT(r.id) AS games_played,
  COUNT(r.id) FILTER (WHERE r.won) AS wins,
  COALESCE(
    (SELECT COUNT(*) FROM (
      SELECT r2.played_at::date AS d,
        r2.played_at::date - (ROW_NUMBER() OVER (ORDER BY r2.played_at::date DESC))::int AS grp
      FROM public.results r2
      WHERE r2.user_id = p.id
    ) sub
    WHERE d = (SELECT MAX(r3.played_at)::date FROM public.results r3 WHERE r3.user_id = p.id)),
    0
  ) AS current_streak,
  COALESCE(
    (SELECT MAX(cnt) FROM (
      SELECT COUNT(*) AS cnt FROM (
        SELECT r4.played_at::date AS d,
          r4.played_at::date - (ROW_NUMBER() OVER (ORDER BY r4.played_at::date))::int AS grp
        FROM public.results r4
        WHERE r4.user_id = p.id
      ) sub2
      GROUP BY grp
    ) sub3),
    0
  ) AS best_streak
FROM public.profiles p
LEFT JOIN public.results r ON r.user_id = p.id
GROUP BY p.id, p.username;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for results
CREATE POLICY "Results are viewable by everyone" ON public.results
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own results" ON public.results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
