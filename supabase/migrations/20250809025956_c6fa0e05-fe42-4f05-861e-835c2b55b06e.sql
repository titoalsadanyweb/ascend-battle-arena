-- Phase 1: Critical DB hardening
-- 1) Enable RLS on reflection_prompts and allow authenticated users to read active prompts
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'reflection_prompts'
  ) THEN
    EXECUTE 'ALTER TABLE public.reflection_prompts ENABLE ROW LEVEL SECURITY';
    -- Create policy only if it does not exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename = 'reflection_prompts' 
        AND policyname = 'Authenticated can view active prompts'
    ) THEN
      EXECUTE $$
      CREATE POLICY "Authenticated can view active prompts"
      ON public.reflection_prompts
      FOR SELECT
      USING (auth.role() = 'authenticated'::text AND is_active = true);
      $$;
    END IF;
  END IF;
END$$;

-- 2) Add WITH CHECK protections on UPDATE to ensure ownership is preserved
-- Posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'posts' 
      AND policyname = 'Users must retain ownership on update - posts'
  ) THEN
    CREATE POLICY "Users must retain ownership on update - posts"
    ON public.posts
    FOR UPDATE
    WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- Check-ins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'check_ins' 
      AND policyname = 'Users must retain ownership on update - check_ins'
  ) THEN
    CREATE POLICY "Users must retain ownership on update - check_ins"
    ON public.check_ins
    FOR UPDATE
    WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- Commitments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'commitments' 
      AND policyname = 'Users must retain ownership on update - commitments'
  ) THEN
    CREATE POLICY "Users must retain ownership on update - commitments"
    ON public.commitments
    FOR UPDATE
    WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- Quest Sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'quest_sessions' 
      AND policyname = 'Users must retain ownership on update - quest_sessions'
  ) THEN
    CREATE POLICY "Users must retain ownership on update - quest_sessions"
    ON public.quest_sessions
    FOR UPDATE
    WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- Allies (updates must keep either side as owner)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'allies' 
      AND policyname = 'Users must retain ownership on update - allies'
  ) THEN
    CREATE POLICY "Users must retain ownership on update - allies"
    ON public.allies
    FOR UPDATE
    WITH CHECK ((auth.uid() = user_id) OR (auth.uid() = ally_id));
  END IF;
END$$;

-- 3) Positive amount constraint for bets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'chk_bet_amount_positive'
  ) THEN
    ALTER TABLE public.bets
      ADD CONSTRAINT chk_bet_amount_positive CHECK (amount > 0);
  END IF;
END$$;

-- 4) Secure SECURITY DEFINER functions: set search_path and verify caller identity where applicable
-- Helper note: we re-create functions with auth checks and fixed search_path.

-- cancel_commitment
CREATE OR REPLACE FUNCTION public.cancel_commitment(p_commitment_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL OR v_uid <> p_user_id THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  UPDATE commitments 
  SET status = 'cancelled',
      updated_at = NOW()
  WHERE id = p_commitment_id AND user_id = p_user_id AND status = 'active';
END;
$$;

-- create_commitment_with_ally_stake
CREATE OR REPLACE FUNCTION public.create_commitment_with_ally_stake(p_user_id uuid, p_ally_id uuid, p_duration integer, p_user_stake bigint, p_ally_stake bigint DEFAULT 0)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
    commitment_id uuid;
    user_balance bigint;
    ally_balance bigint;
BEGIN
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'forbidden';
    END IF;

    SELECT token_balance INTO user_balance FROM profiles WHERE id = p_user_id;
    IF user_balance < p_user_stake THEN
        RETURN jsonb_build_object('error', 'Insufficient user balance');
    END IF;

    IF p_ally_stake > 0 AND p_ally_id IS NOT NULL THEN
        SELECT token_balance INTO ally_balance FROM profiles WHERE id = p_ally_id;
        IF ally_balance < p_ally_stake THEN
            RETURN jsonb_build_object('error', 'Insufficient ally balance');
        END IF;
    END IF;

    INSERT INTO commitments (
        user_id, ally_id, start_date, end_date, duration_days, stake_amount, matched_stake_amount, status
    ) VALUES (
        p_user_id, p_ally_id, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day' * p_duration, p_duration, p_user_stake, p_ally_stake, 'active'
    ) RETURNING id INTO commitment_id;

    UPDATE profiles 
    SET token_balance = token_balance - p_user_stake,
        updated_at = NOW()
    WHERE id = p_user_id;

    IF p_ally_stake > 0 AND p_ally_id IS NOT NULL THEN
        UPDATE profiles 
        SET token_balance = token_balance - p_ally_stake,
            updated_at = NOW()
        WHERE id = p_ally_id;
    END IF;

    INSERT INTO token_transactions (user_id, type, amount, related_commitment_id)
    VALUES (p_user_id, 'commitment_stake', -p_user_stake, commitment_id);

    IF p_ally_stake > 0 AND p_ally_id IS NOT NULL THEN
        INSERT INTO token_transactions (user_id, type, amount, related_commitment_id)
        VALUES (p_ally_id, 'commitment_stake', -p_ally_stake, commitment_id);
    END IF;

    IF p_ally_id IS NOT NULL THEN
        INSERT INTO ally_feed (user_id, ally_id, event_type, details, metadata)
        VALUES (
            p_user_id, p_ally_id, 'contract_start',
            'Started a ' || p_duration || '-day battle contract',
            jsonb_build_object('commitment_id', commitment_id, 'duration', p_duration, 'user_stake', p_user_stake, 'ally_stake', p_ally_stake)
        );
    END IF;

    RETURN jsonb_build_object('id', commitment_id, 'message', 'Battle contract created successfully');
END;
$$;

-- create_commitment
CREATE OR REPLACE FUNCTION public.create_commitment(p_user_id uuid, p_ally_id uuid, p_duration integer, p_stake_amount bigint)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
    commitment_id uuid;
BEGIN
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'forbidden';
    END IF;

    INSERT INTO commitments (
        user_id, ally_id, start_date, end_date, duration_days, stake_amount, status
    ) VALUES (
        p_user_id, p_ally_id, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day' * p_duration, p_duration, p_stake_amount, 'active'
    ) RETURNING id INTO commitment_id;

    UPDATE profiles 
    SET token_balance = token_balance - p_stake_amount,
        updated_at = NOW()
    WHERE id = p_user_id;

    INSERT INTO token_transactions (user_id, type, amount, related_commitment_id)
    VALUES (p_user_id, 'commitment_stake', -p_stake_amount, commitment_id);

    RETURN jsonb_build_object('id', commitment_id, 'message', 'Commitment created successfully');
END;
$$;

-- get_user_token_balance
CREATE OR REPLACE FUNCTION public.get_user_token_balance(p_user_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
    v_uid uuid := auth.uid();
    balance BIGINT;
BEGIN
    IF v_uid IS NULL OR v_uid <> p_user_id THEN
        RAISE EXCEPTION 'forbidden';
    END IF;
    SELECT token_balance INTO balance FROM profiles WHERE id = p_user_id;
    RETURN COALESCE(balance, 0);
END;
$$;

-- get_user_commitments
CREATE OR REPLACE FUNCTION public.get_user_commitments(p_user_id uuid)
RETURNS TABLE(id uuid, user_id uuid, ally_id uuid, start_date date, end_date date, duration_days integer, stake_amount bigint, status text, created_at timestamp with time zone, description text, failure_count integer, success_streak integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'forbidden';
    END IF;
    RETURN QUERY
    SELECT 
        c.id, c.user_id, c.ally_id, c.start_date, c.end_date, c.duration_days, c.stake_amount,
        c.status, c.created_at, c.description, c.failure_count, c.success_streak
    FROM commitments c
    WHERE c.user_id = p_user_id
    ORDER BY c.created_at DESC;
END;
$$;

-- get_active_commitments
CREATE OR REPLACE FUNCTION public.get_active_commitments(p_user_id uuid)
RETURNS TABLE(id uuid, user_id uuid, ally_id uuid, start_date date, end_date date, duration_days integer, stake_amount bigint, status text, created_at timestamp with time zone, description text, failure_count integer, success_streak integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'forbidden';
    END IF;
    RETURN QUERY
    SELECT 
        c.id, c.user_id, c.ally_id, c.start_date, c.end_date, c.duration_days, c.stake_amount,
        c.status, c.created_at, c.description, c.failure_count, c.success_streak
    FROM commitments c
    WHERE c.user_id = p_user_id AND c.status = 'active'
    ORDER BY c.created_at DESC;
END;
$$;

-- handle_quest_completion
CREATE OR REPLACE FUNCTION public.handle_quest_completion(p_user_id uuid, p_quest_id uuid, p_date_local date, p_submission_text text, p_tokens_awarded bigint, p_shared_with_ally boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'forbidden';
    END IF;

    INSERT INTO quest_completions (
        user_id, quest_id, date_local, submission_text, tokens_awarded, shared_with_ally
    ) VALUES (
        p_user_id, p_quest_id, p_date_local, p_submission_text, p_tokens_awarded, p_shared_with_ally
    );

    UPDATE profiles 
    SET token_balance = token_balance + p_tokens_awarded,
        updated_at = NOW()
    WHERE id = p_user_id;

    INSERT INTO token_transactions (user_id, type, amount, related_quest_id)
    VALUES (p_user_id, 'quest_reward', p_tokens_awarded, p_quest_id);

    IF p_shared_with_ally THEN
        INSERT INTO ally_feed (user_id, ally_id, event_type, details, metadata)
        SELECT p_user_id, a.ally_id, 'quest_complete', 'Completed daily quest and shared reflection',
               jsonb_build_object('quest_id', p_quest_id, 'submission_text', p_submission_text)
        FROM allies a 
        WHERE a.user_id = p_user_id AND a.status = 'active'
        LIMIT 1;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in handle_quest_completion: %', SQLERRM;
        IF SQLSTATE NOT LIKE '42P01' THEN
            RAISE;
        END IF;
END;
$$;

-- handle_checkin_with_rls (add auth check)
CREATE OR REPLACE FUNCTION public.handle_checkin_with_rls(p_user_id uuid, p_date_local date, p_status text, p_tokens_awarded bigint, p_is_edit boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
    checkin_id uuid;
    existing_checkin_id uuid;
    current_profile profiles%ROWTYPE;
    new_streak integer;
    new_best_streak integer;
    token_balance_after bigint;
BEGIN
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'forbidden';
    END IF;

    SELECT * INTO current_profile FROM profiles WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Profile not found');
    END IF;

    SELECT id INTO existing_checkin_id 
    FROM check_ins 
    WHERE user_id = p_user_id AND date_local = p_date_local;

    IF p_status = 'victory' THEN
        IF existing_checkin_id IS NOT NULL AND p_is_edit THEN
            new_streak := current_profile.current_streak;
        ELSE
            new_streak := current_profile.current_streak + 1;
        END IF;
    ELSE
        new_streak := 0;
    END IF;

    new_best_streak := GREATEST(current_profile.best_streak, new_streak);

    IF existing_checkin_id IS NOT NULL AND p_is_edit THEN
        UPDATE check_ins 
        SET status = p_status, 
            tokens_awarded = p_tokens_awarded,
            is_edited = true
        WHERE id = existing_checkin_id
        RETURNING id INTO checkin_id;
    ELSE
        INSERT INTO check_ins (user_id, date_local, status, tokens_awarded, is_edited)
        VALUES (p_user_id, p_date_local, p_status, p_tokens_awarded, COALESCE(p_is_edit, false))
        RETURNING id INTO checkin_id;
    END IF;

    token_balance_after := current_profile.token_balance + p_tokens_awarded;
    UPDATE profiles 
    SET current_streak = new_streak,
        best_streak = new_best_streak,
        token_balance = token_balance_after,
        last_check_in_date = p_date_local,
        updated_at = NOW()
    WHERE id = p_user_id;

    IF p_tokens_awarded > 0 THEN
        INSERT INTO token_transactions (user_id, type, amount, related_checkin_id)
        VALUES (p_user_id, 'checkin_reward', p_tokens_awarded, checkin_id);
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'current_streak', new_streak,
        'best_streak', new_best_streak,
        'token_balance', token_balance_after,
        'tokens_awarded', p_tokens_awarded,
        'status', p_status,
        'has_checked_in_today', true
    );
END;
$$;

-- update_token_balance
CREATE OR REPLACE FUNCTION public.update_token_balance(p_user_id uuid, p_amount bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'forbidden';
    END IF;
    UPDATE profiles 
    SET token_balance = token_balance + p_amount,
        updated_at = NOW()
    WHERE id = p_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found: %', p_user_id;
    END IF;
END;
$$;

-- check_completed_14_day_contract
CREATE OR REPLACE FUNCTION public.check_completed_14_day_contract(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE has_completed boolean := false;
BEGIN
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'forbidden';
    END IF;
    SELECT EXISTS(
        SELECT 1 FROM commitments 
        WHERE user_id = p_user_id AND duration_days = 14 AND status = 'succeeded'
    ) INTO has_completed;
    RETURN has_completed;
END;
$$;

-- check_completed_7_day_contract
CREATE OR REPLACE FUNCTION public.check_completed_7_day_contract(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE has_completed boolean := false;
BEGIN
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'forbidden';
    END IF;
    SELECT EXISTS(
        SELECT 1 FROM commitments 
        WHERE user_id = p_user_id AND duration_days = 7 AND status = 'succeeded'
    ) INTO has_completed;
    RETURN has_completed;
END;
$$;

-- check_daily_swap_limit
CREATE OR REPLACE FUNCTION public.check_daily_swap_limit(p_user_id uuid, p_date_local date)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE swap_count INTEGER;
BEGIN
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'forbidden';
    END IF;
    SELECT COUNT(*) INTO swap_count
    FROM quest_swaps
    WHERE user_id = p_user_id AND date_local = p_date_local;
    RETURN swap_count < 1;
END;
$$;

-- find_potential_allies
CREATE OR REPLACE FUNCTION public.find_potential_allies(p_user_id uuid, p_limit integer DEFAULT 10)
RETURNS TABLE(user_id uuid, username text, language text, secondary_language text, religion text, bio text, current_streak integer, best_streak integer, timezone text, match_score integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'forbidden';
    END IF;
    RETURN QUERY
    SELECT 
        p.id, p.username, COALESCE(p.language, 'English') as language, p.secondary_language, p.religion,
        p.bio, p.current_streak, p.best_streak, p.timezone,
        50 + (RANDOM() * 45)::INTEGER as match_score
    FROM profiles p
    WHERE p.id != p_user_id 
      AND p.id NOT IN (
        SELECT ally_id FROM allies WHERE user_id = p_user_id AND status = 'active'
        UNION
        SELECT user_id FROM allies WHERE ally_id = p_user_id AND status = 'active'
      )
    ORDER BY RANDOM()
    LIMIT p_limit;
END;
$$;

-- handle_quest_session
CREATE OR REPLACE FUNCTION public.handle_quest_session(p_user_id uuid, p_quest_id uuid, p_date_local date, p_action text DEFAULT 'get_or_create')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE session_record quest_sessions%ROWTYPE; result jsonb;
BEGIN
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'forbidden';
    END IF;
    SELECT * INTO session_record FROM quest_sessions WHERE user_id = p_user_id AND date_local = p_date_local;
    IF NOT FOUND AND p_action = 'get_or_create' THEN
        INSERT INTO quest_sessions (user_id, quest_id, date_local, status)
        VALUES (p_user_id, p_quest_id, p_date_local, 'started')
        RETURNING * INTO session_record;
    END IF;
    IF session_record.id IS NOT NULL THEN
        result := jsonb_build_object(
            'id', session_record.id,
            'quest_id', session_record.quest_id,
            'status', session_record.status,
            'started_at', session_record.started_at,
            'completed_at', session_record.completed_at,
            'progress_data', session_record.progress_data
        );
    ELSE
        result := jsonb_build_object('error', 'No session found');
    END IF;
    RETURN result;
END;
$$;

-- handle_quest_completion_with_session
CREATE OR REPLACE FUNCTION public.handle_quest_completion_with_session(p_user_id uuid, p_quest_id uuid, p_date_local date, p_submission_text text, p_tokens_awarded bigint, p_shared_with_ally boolean, p_mood_selected text DEFAULT NULL, p_energy_selected text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE session_record quest_sessions%ROWTYPE; completion_id UUID; result jsonb;
BEGIN
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'forbidden';
    END IF;

    SELECT * INTO session_record FROM quest_sessions WHERE user_id = p_user_id AND date_local = p_date_local;
    IF NOT FOUND THEN
        INSERT INTO quest_sessions (user_id, quest_id, date_local, status)
        VALUES (p_user_id, p_quest_id, p_date_local, 'started')
        RETURNING * INTO session_record;
    END IF;

    IF session_record.status = 'completed' THEN
        RETURN jsonb_build_object('error', 'Quest already completed');
    END IF;

    UPDATE quest_sessions
    SET status = 'completed', completed_at = NOW(),
        progress_data = jsonb_build_object('mood_selected', p_mood_selected, 'energy_selected', p_energy_selected),
        updated_at = NOW()
    WHERE id = session_record.id;

    INSERT INTO quest_completions (
        user_id, quest_id, date_local, submission_text, tokens_awarded, shared_with_ally, mood_selected, energy_selected
    ) VALUES (
        p_user_id, p_quest_id, p_date_local, p_submission_text, p_tokens_awarded, p_shared_with_ally, p_mood_selected, p_energy_selected
    ) RETURNING id INTO completion_id;

    UPDATE profiles 
    SET token_balance = token_balance + p_tokens_awarded,
        updated_at = NOW()
    WHERE id = p_user_id;

    INSERT INTO token_transactions (user_id, type, amount, related_quest_id)
    VALUES (p_user_id, 'quest_reward', p_tokens_awarded, p_quest_id);

    IF p_shared_with_ally THEN
        INSERT INTO ally_feed (user_id, ally_id, event_type, details, metadata)
        SELECT p_user_id, a.ally_id, 'quest_complete', 'Completed daily quest and shared reflection',
               jsonb_build_object('quest_id', p_quest_id, 'submission_text', p_submission_text, 'mood_selected', p_mood_selected, 'energy_selected', p_energy_selected)
        FROM allies a 
        WHERE a.user_id = p_user_id AND a.status = 'active'
        LIMIT 1;
    END IF;

    RETURN jsonb_build_object('success', true, 'completion_id', completion_id, 'session_id', session_record.id, 'tokens_awarded', p_tokens_awarded);
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in handle_quest_completion_with_session: %', SQLERRM;
        RETURN jsonb_build_object('error', 'Failed to complete quest: ' || SQLERRM);
END;
$$;

-- complete_regroup_mission
CREATE OR REPLACE FUNCTION public.complete_regroup_mission(p_user_id uuid, p_mission_id uuid, p_reflection_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE mission_record quest_completions%ROWTYPE; recovery_tokens bigint;
BEGIN
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'forbidden';
    END IF;
    SELECT * INTO mission_record FROM quest_completions WHERE id = p_mission_id AND user_id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Regroup mission not found');
    END IF;
    IF mission_record.submission_text IS NOT NULL THEN
        RETURN jsonb_build_object('error', 'Mission already completed');
    END IF;
    recovery_tokens := mission_record.tokens_awarded;
    UPDATE quest_completions SET submission_text = p_reflection_text, completed_at = NOW() WHERE id = p_mission_id;
    UPDATE profiles SET token_balance = token_balance + recovery_tokens, updated_at = NOW() WHERE id = p_user_id;
    INSERT INTO token_transactions (user_id, type, amount, related_quest_id)
    VALUES (p_user_id, 'recovery_reward', recovery_tokens, mission_record.quest_id);
    RETURN jsonb_build_object('success', true, 'recovery_tokens', recovery_tokens, 'message', 'Regroup mission completed. Partial honor restored!');
END;
$$;

-- create_regroup_mission
CREATE OR REPLACE FUNCTION public.create_regroup_mission(p_user_id uuid, p_failed_commitment_id uuid, p_lost_tokens bigint)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE mission_id uuid; recovery_percentage integer := 30; recovery_amount bigint;
BEGIN
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'forbidden';
    END IF;
    recovery_amount := (p_lost_tokens * recovery_percentage) / 100;
    INSERT INTO quest_completions (
        user_id, quest_id, date_local, submission_text, tokens_awarded, shared_with_ally
    ) VALUES (
        p_user_id, gen_random_uuid(), CURRENT_DATE,
        'Regroup Mission: Reflect on what led to the contract failure and write one lesson learned and one action for today.',
        recovery_amount, false
    ) RETURNING id INTO mission_id;
    RETURN jsonb_build_object('mission_id', mission_id, 'recovery_amount', recovery_amount, 'recovery_percentage', recovery_percentage);
END;
$$;

-- 5) Restrict internal-only functions to service_role
DO $$
BEGIN
  -- List of internal functions to restrict
  PERFORM 1;
  -- auto_resolve_expired_commitments()
  REVOKE EXECUTE ON FUNCTION public.auto_resolve_expired_commitments() FROM PUBLIC, anon, authenticated;
  GRANT EXECUTE ON FUNCTION public.auto_resolve_expired_commitments() TO service_role;

  -- calculate_penalty_percentage(integer)
  REVOKE EXECUTE ON FUNCTION public.calculate_penalty_percentage(integer) FROM PUBLIC, anon, authenticated;
  GRANT EXECUTE ON FUNCTION public.calculate_penalty_percentage(integer) TO service_role;

  -- reward_successful_commitment(uuid)
  REVOKE EXECUTE ON FUNCTION public.reward_successful_commitment(uuid) FROM PUBLIC, anon, authenticated;
  GRANT EXECUTE ON FUNCTION public.reward_successful_commitment(uuid) TO service_role;

  -- handle_checkin_transaction(uuid, date, integer, bigint, integer)
  REVOKE EXECUTE ON FUNCTION public.handle_checkin_transaction(uuid, date, integer, bigint, integer) FROM PUBLIC, anon, authenticated;
  GRANT EXECUTE ON FUNCTION public.handle_checkin_transaction(uuid, date, integer, bigint, integer) TO service_role;

  -- process_commitment_checkins()
  REVOKE EXECUTE ON FUNCTION public.process_commitment_checkins() FROM PUBLIC, anon, authenticated;
  GRANT EXECUTE ON FUNCTION public.process_commitment_checkins() TO service_role;

  -- resolve_commitment_with_penalty_escalation(uuid)
  REVOKE EXECUTE ON FUNCTION public.resolve_commitment_with_penalty_escalation(uuid) FROM PUBLIC, anon, authenticated;
  GRANT EXECUTE ON FUNCTION public.resolve_commitment_with_penalty_escalation(uuid) TO service_role;
END$$;