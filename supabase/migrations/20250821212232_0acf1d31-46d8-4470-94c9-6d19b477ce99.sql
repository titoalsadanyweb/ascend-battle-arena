-- Phase 1: Enhanced Ally System Foundation

-- Add enhanced profile fields for better matching
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS commitment_preferences jsonb DEFAULT '{"preferred_duration": [7, 14], "max_stake": 1000, "preferred_time": "evening"}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS activity_level text DEFAULT 'moderate' CHECK (activity_level IN ('low', 'moderate', 'high'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age_group text DEFAULT 'young_adult' CHECK (age_group IN ('teen', 'young_adult', 'adult', 'senior'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trust_score integer DEFAULT 100 CHECK (trust_score >= 0 AND trust_score <= 100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS response_rate decimal DEFAULT 0.9 CHECK (response_rate >= 0 AND response_rate <= 1);

-- Create enhanced matching function with intelligent compatibility scoring
CREATE OR REPLACE FUNCTION public.find_potential_allies(p_user_id uuid, p_limit integer DEFAULT 10)
RETURNS TABLE(user_id uuid, username text, language text, secondary_language text, religion text, bio text, current_streak integer, best_streak integer, timezone text, match_score integer, country text, interests text[], age_group text, trust_score integer, compatibility_reasons text[])
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_profile profiles%ROWTYPE;
    user_timezone_offset interval;
    target_timezone_offset interval;
BEGIN
    -- Get current user's profile
    SELECT * INTO user_profile FROM profiles WHERE id = p_user_id;
    
    RETURN QUERY
    SELECT 
        p.id,
        p.username,
        COALESCE(p.language, 'English') as language,
        p.secondary_language,
        p.religion,
        p.bio,
        p.current_streak,
        p.best_streak,
        p.timezone,
        -- Enhanced compatibility scoring
        (
            -- Language compatibility (30 points)
            CASE 
                WHEN p.language = user_profile.language THEN 30
                WHEN p.secondary_language = user_profile.language OR p.language = user_profile.secondary_language THEN 20
                ELSE 10
            END +
            -- Streak similarity (25 points)
            CASE 
                WHEN ABS(p.current_streak - user_profile.current_streak) <= 5 THEN 25
                WHEN ABS(p.current_streak - user_profile.current_streak) <= 15 THEN 15
                ELSE 5
            END +
            -- Religion compatibility (15 points)
            CASE 
                WHEN p.religion IS NOT NULL AND p.religion = user_profile.religion THEN 15
                WHEN p.religion IS NULL AND user_profile.religion IS NULL THEN 10
                ELSE 0
            END +
            -- Age group compatibility (10 points)
            CASE 
                WHEN p.age_group = user_profile.age_group THEN 10
                WHEN (p.age_group = 'teen' AND user_profile.age_group = 'young_adult') OR
                     (p.age_group = 'young_adult' AND user_profile.age_group = 'teen') OR
                     (p.age_group = 'young_adult' AND user_profile.age_group = 'adult') OR
                     (p.age_group = 'adult' AND user_profile.age_group = 'young_adult') THEN 7
                ELSE 3
            END +
            -- Trust score factor (10 points)
            CASE 
                WHEN p.trust_score >= 90 THEN 10
                WHEN p.trust_score >= 70 THEN 7
                ELSE 3
            END +
            -- Activity level compatibility (5 points)
            CASE 
                WHEN p.activity_level = user_profile.activity_level THEN 5
                ELSE 2
            END +
            -- Country preference bonus (5 points)
            CASE 
                WHEN p.country IS NOT NULL AND user_profile.country IS NOT NULL AND p.country = user_profile.country THEN 5
                WHEN user_profile.nationality_preference = 'no_preference' THEN 3
                ELSE 1
            END
        )::integer as match_score,
        p.country,
        p.interests,
        p.age_group,
        p.trust_score,
        -- Compatibility reasons
        ARRAY[
            CASE WHEN p.language = user_profile.language THEN 'Same primary language' ELSE NULL END,
            CASE WHEN p.religion = user_profile.religion THEN 'Shared beliefs' ELSE NULL END,
            CASE WHEN ABS(p.current_streak - user_profile.current_streak) <= 5 THEN 'Similar streak levels' ELSE NULL END,
            CASE WHEN p.age_group = user_profile.age_group THEN 'Same age group' ELSE NULL END,
            CASE WHEN p.trust_score >= 90 THEN 'High trust score' ELSE NULL END
        ]::text[] as compatibility_reasons
    FROM profiles p
    WHERE p.id != p_user_id 
        AND p.looking_for_ally = true
        AND p.id NOT IN (
            -- Exclude users already connected as allies
            SELECT ally_id FROM allies WHERE user_id = p_user_id AND status IN ('active', 'pending')
            UNION
            SELECT user_id FROM allies WHERE ally_id = p_user_id AND status IN ('active', 'pending')
        )
    ORDER BY match_score DESC, p.trust_score DESC, p.current_streak DESC
    LIMIT p_limit;
END;
$$;

-- Create demo profiles for testing
INSERT INTO profiles (
    id, username, timezone, language, secondary_language, religion, bio, 
    current_streak, best_streak, token_balance, country, age_group, 
    activity_level, interests, trust_score, looking_for_ally
) VALUES 
-- High compatibility profiles
(gen_random_uuid(), 'WarriorSeeker', 'America/New_York', 'English', 'Spanish', 'Christian', 
 'On a journey of self-improvement and faith. Looking for accountability partner.', 
 12, 25, 500, 'United States', 'young_adult', 'high', 
 '{"fitness", "meditation", "reading", "faith"}', 95, true),

(gen_random_uuid(), 'MindfulFighter', 'America/Los_Angeles', 'English', NULL, NULL, 
 'Focused on building discipline through mindfulness and consistent action.', 
 8, 15, 350, 'United States', 'young_adult', 'moderate', 
 '{"mindfulness", "productivity", "self-help"}', 88, true),

(gen_random_uuid(), 'SteadyProgress', 'Europe/London', 'English', 'French', 'Muslim', 
 'Consistency over perfection. Small steps, big changes.', 
 6, 18, 420, 'United Kingdom', 'adult', 'moderate', 
 '{"journaling", "habit-building", "fitness"}', 92, true),

(gen_random_uuid(), 'DisciplinedMind', 'Asia/Tokyo', 'Japanese', 'English', 'Buddhist', 
 'Seeking balance through discipline and inner peace.', 
 15, 30, 750, 'Japan', 'adult', 'high', 
 '{"meditation", "martial-arts", "philosophy"}', 97, true),

(gen_random_uuid(), 'FocusedGrowth', 'America/Chicago', 'English', NULL, 'Christian', 
 'Building character one day at a time. Faith and discipline go hand in hand.', 
 20, 35, 950, 'United States', 'young_adult', 'high', 
 '{"faith", "fitness", "leadership", "reading"}', 94, true),

-- Medium compatibility profiles
(gen_random_uuid(), 'StrongWilled', 'Europe/Berlin', 'German', 'English', NULL, 
 'Determined to break free from bad habits and build a better life.', 
 4, 12, 200, 'Germany', 'adult', 'moderate', 
 '{"fitness", "music", "travel"}', 85, true),

(gen_random_uuid(), 'RisingPhoenix', 'Australia/Sydney', 'English', NULL, 'Christian', 
 'Every setback is a setup for a comeback. Looking for supportive allies.', 
 2, 8, 150, 'Australia', 'young_adult', 'low', 
 '{"recovery", "faith", "writing"}', 78, true),

(gen_random_uuid(), 'PathSeeker', 'America/Denver', 'English', 'Portuguese', 'Hindu', 
 'Exploring spiritual growth and self-mastery through ancient wisdom.', 
 18, 22, 680, 'United States', 'adult', 'moderate', 
 '{"spirituality", "yoga", "philosophy", "meditation"}', 91, true),

-- Lower compatibility but diverse profiles
(gen_random_uuid(), 'TechWarrior', 'Asia/Singapore', 'Chinese', 'English', NULL, 
 'Coding by day, self-improvement by night. Seeking digital minimalism.', 
 7, 14, 400, 'Singapore', 'young_adult', 'high', 
 '{"technology", "programming", "minimalism"}', 89, true),

(gen_random_uuid(), 'ArtisticSoul', 'Europe/Paris', 'French', 'Italian', 'Catholic', 
 'Expressing creativity while building discipline. Art and growth together.', 
 11, 19, 520, 'France', 'adult', 'moderate', 
 '{"art", "creativity", "culture", "faith"}', 93, true),

(gen_random_uuid(), 'NatureSeeker', 'America/Portland', 'English', NULL, NULL, 
 'Finding strength in nature and simplicity. Outdoor adventures and inner growth.', 
 13, 21, 610, 'United States', 'young_adult', 'high', 
 '{"hiking", "environment", "photography", "mindfulness"}', 87, true),

(gen_random_uuid(), 'HealthyMind', 'Canada/Toronto', 'English', 'French', NULL, 
 'Mental health advocate focused on breaking cycles and building resilience.', 
 5, 16, 300, 'Canada', 'adult', 'moderate', 
 '{"mental-health", "fitness", "nutrition", "therapy"}', 90, true)

ON CONFLICT (id) DO NOTHING;

-- Create ally trial system table
CREATE TABLE IF NOT EXISTS ally_trials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    ally_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    start_date date NOT NULL DEFAULT CURRENT_DATE,
    end_date date NOT NULL DEFAULT CURRENT_DATE + INTERVAL '7 days',
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'upgraded')),
    compatibility_score integer DEFAULT 0,
    interaction_count integer DEFAULT 0,
    shared_activities integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, ally_id)
);

-- Enable RLS on ally_trials
ALTER TABLE ally_trials ENABLE ROW LEVEL SECURITY;

-- RLS policies for ally_trials
CREATE POLICY "Users can view their own trials" ON ally_trials
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = ally_id);

CREATE POLICY "Users can create their own trials" ON ally_trials
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trials" ON ally_trials
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = ally_id);

-- Create shared activities tracking
CREATE TABLE IF NOT EXISTS shared_activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ally_trial_id uuid REFERENCES ally_trials(id) ON DELETE CASCADE,
    activity_type text NOT NULL CHECK (activity_type IN ('check_in', 'quest', 'commitment', 'chat', 'encouragement')),
    user_id uuid NOT NULL REFERENCES profiles(id),
    ally_id uuid NOT NULL REFERENCES profiles(id),
    activity_data jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on shared_activities
ALTER TABLE shared_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their shared activities" ON shared_activities
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = ally_id);

CREATE POLICY "Users can create shared activities" ON shared_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to start ally trial period
CREATE OR REPLACE FUNCTION public.start_ally_trial(p_user_id uuid, p_ally_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    trial_id uuid;
    compatibility_score integer;
BEGIN
    -- Calculate initial compatibility score
    SELECT match_score INTO compatibility_score
    FROM find_potential_allies(p_user_id, 1)
    WHERE user_id = p_ally_id;
    
    -- Create trial period
    INSERT INTO ally_trials (user_id, ally_id, compatibility_score)
    VALUES (p_user_id, p_ally_id, COALESCE(compatibility_score, 50))
    RETURNING id INTO trial_id;
    
    -- Create reciprocal trial
    INSERT INTO ally_trials (user_id, ally_id, compatibility_score)
    VALUES (p_ally_id, p_user_id, COALESCE(compatibility_score, 50))
    ON CONFLICT (user_id, ally_id) DO NOTHING;
    
    RETURN jsonb_build_object(
        'trial_id', trial_id,
        'message', '7-day ally trial started! Get to know each other.',
        'compatibility_score', compatibility_score
    );
END;
$$;

-- Function to upgrade trial to full ally relationship
CREATE OR REPLACE FUNCTION public.upgrade_trial_to_ally(p_trial_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    trial_record ally_trials%ROWTYPE;
BEGIN
    -- Get trial details
    SELECT * INTO trial_record FROM ally_trials WHERE id = p_trial_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Trial not found');
    END IF;
    
    -- Update trial status
    UPDATE ally_trials SET status = 'upgraded', updated_at = now()
    WHERE id = p_trial_id;
    
    -- Create full ally relationship
    INSERT INTO allies (user_id, ally_id, status, paired_at)
    VALUES (trial_record.user_id, trial_record.ally_id, 'active', now())
    ON CONFLICT (user_id, ally_id) DO UPDATE SET status = 'active', paired_at = now();
    
    -- Create reciprocal relationship
    INSERT INTO allies (user_id, ally_id, status, paired_at)
    VALUES (trial_record.ally_id, trial_record.user_id, 'active', now())
    ON CONFLICT (user_id, ally_id) DO UPDATE SET status = 'active', paired_at = now();
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Trial upgraded to full ally relationship!'
    );
END;
$$;