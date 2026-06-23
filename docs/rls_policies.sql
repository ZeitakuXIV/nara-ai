-- NARA AI: Supabase Row Level Security (UU PDP Art. 20)
-- Run these in Supabase Dashboard > SQL Editor

-- 1. Enable RLS on tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- 2. Users can only read/update their own profile
CREATE POLICY "user_profiles_owner_access" ON user_profiles
  FOR ALL
  USING (email = current_setting('request.jwt.claims')::json->>'email');

-- 3. Users can only read/update their own meal plans
CREATE POLICY "meal_plans_owner_access" ON meal_plans
  FOR ALL
  USING (user_id = current_setting('request.jwt.claims')::json->>'sub');

-- 4. Service role bypass (for server-side operations)
CREATE POLICY "service_role_all_access" ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_meal_plans" ON meal_plans
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
