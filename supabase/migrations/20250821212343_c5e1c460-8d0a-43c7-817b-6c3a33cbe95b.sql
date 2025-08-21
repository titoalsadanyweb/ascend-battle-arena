-- Drop and recreate enhanced find_potential_allies function
DROP FUNCTION IF EXISTS public.find_potential_allies(uuid, integer);

-- Create enhanced matching function with intelligent compatibility scoring
CREATE OR REPLACE FUNCTION public.find_potential_allies(p_user_id uuid, p_limit integer DEFAULT 10)
RETURNS TABLE(user_id uuid, username text, language text, secondary_language text, religion text, bio text, current_streak integer, best_streak integer, timezone text, match_score integer, country text, interests text[], age_group text, trust_score integer, compatibility_reasons text[])
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_profile profiles%ROWTYPE;
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
        ARRAY_REMOVE(ARRAY[
            CASE WHEN p.language = user_profile.language THEN 'Same primary language' ELSE NULL END,
            CASE WHEN p.religion = user_profile.religion THEN 'Shared beliefs' ELSE NULL END,
            CASE WHEN ABS(p.current_streak - user_profile.current_streak) <= 5 THEN 'Similar streak levels' ELSE NULL END,
            CASE WHEN p.age_group = user_profile.age_group THEN 'Same age group' ELSE NULL END,
            CASE WHEN p.trust_score >= 90 THEN 'High trust score' ELSE NULL END
        ], NULL)::text[] as compatibility_reasons
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