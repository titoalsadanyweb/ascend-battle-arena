-- Fix all remaining security linter issues: add SET search_path TO public for all functions missing it

-- update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- reward_successful_commitment
CREATE OR REPLACE FUNCTION public.reward_successful_commitment(p_commitment_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
    commitment_record commitments%ROWTYPE;
    reward_amount bigint;
    bonus_percentage integer;
    result jsonb;
BEGIN
    SELECT * INTO commitment_record 
    FROM commitments 
    WHERE id = p_commitment_id AND status = 'succeeded';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Commitment not found or not succeeded');
    END IF;
    
    bonus_percentage := CASE commitment_record.duration_days
        WHEN 1 THEN 10
        WHEN 3 THEN 20
        WHEN 7 THEN 30
        WHEN 14 THEN 40
        WHEN 30 THEN 50
        ELSE 20
    END;
    
    reward_amount := commitment_record.stake_amount + (commitment_record.stake_amount * bonus_percentage / 100);
    
    UPDATE profiles 
    SET token_balance = token_balance + reward_amount,
        updated_at = NOW()
    WHERE id = commitment_record.user_id;
    
    INSERT INTO token_transactions (
        user_id,
        type,
        amount,
        related_commitment_id
    ) VALUES (
        commitment_record.user_id,
        'commitment_success',
        reward_amount,
        p_commitment_id
    );
    
    IF commitment_record.ally_id IS NOT NULL THEN
        INSERT INTO ally_feed (
            user_id,
            ally_id,
            event_type,
            details,
            metadata
        ) VALUES (
            commitment_record.user_id,
            commitment_record.ally_id,
            'commitment_success',
            'Successfully completed ' || commitment_record.duration_days || '-day battle contract',
            jsonb_build_object(
                'commitment_id', p_commitment_id,
                'duration_days', commitment_record.duration_days,
                'reward_amount', reward_amount
            )
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'reward_amount', reward_amount,
        'bonus_percentage', bonus_percentage
    );
END;
$$;

-- resolve_commitment_with_penalty_escalation
CREATE OR REPLACE FUNCTION public.resolve_commitment_with_penalty_escalation(p_commitment_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
    commitment_record commitments%ROWTYPE;
    check_in_count integer;
    required_days integer;
    success boolean := false;
    penalty_percentage integer;
    tokens_lost bigint;
    tokens_returned bigint;
    ally_bonus bigint := 0;
    result jsonb;
BEGIN
    SELECT * INTO commitment_record 
    FROM commitments 
    WHERE id = p_commitment_id AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Active commitment not found');
    END IF;
    
    SELECT COUNT(*) INTO check_in_count
    FROM check_ins 
    WHERE user_id = commitment_record.user_id 
    AND date_local BETWEEN commitment_record.start_date AND commitment_record.end_date
    AND status = 'success';
    
    required_days := commitment_record.duration_days;
    success := (check_in_count = required_days);
    
    IF success THEN
        tokens_returned := commitment_record.stake_amount + (commitment_record.stake_amount * 20 / 100);
        
        UPDATE profiles 
        SET token_balance = token_balance + tokens_returned,
            updated_at = NOW()
        WHERE id = commitment_record.user_id;
        
        IF commitment_record.matched_stake_amount > 0 AND commitment_record.ally_id IS NOT NULL THEN
            ally_bonus := commitment_record.matched_stake_amount + (commitment_record.matched_stake_amount * 10 / 100);
            
            UPDATE profiles 
            SET token_balance = token_balance + ally_bonus,
                updated_at = NOW()
            WHERE id = commitment_record.ally_id;
        END IF;
        
        UPDATE commitments 
        SET status = 'succeeded',
            success_streak = success_streak + 1,
            updated_at = NOW()
        WHERE id = p_commitment_id;
        
        INSERT INTO token_transactions (user_id, type, amount, related_commitment_id)
        VALUES (commitment_record.user_id, 'commitment_success', tokens_returned, p_commitment_id);
        
        IF ally_bonus > 0 THEN
            INSERT INTO token_transactions (user_id, type, amount, related_commitment_id)
            VALUES (commitment_record.ally_id, 'commitment_ally_bonus', ally_bonus, p_commitment_id);
        END IF;
        
    ELSE
        penalty_percentage := calculate_penalty_percentage(commitment_record.failure_count);
        tokens_lost := (commitment_record.stake_amount * penalty_percentage) / 100;
        
        UPDATE commitments 
        SET status = 'failed',
            failure_count = failure_count + 1,
            success_streak = 0,
            updated_at = NOW()
        WHERE id = p_commitment_id;
        
        IF commitment_record.ally_id IS NOT NULL THEN
            UPDATE profiles 
            SET token_balance = token_balance + (tokens_lost / 2),
                updated_at = NOW()
            WHERE id = commitment_record.ally_id;
            
            INSERT INTO token_transactions (user_id, type, amount, related_commitment_id)
            VALUES (commitment_record.ally_id, 'commitment_ally_reward', tokens_lost / 2, p_commitment_id);
        END IF;
        
        INSERT INTO token_transactions (user_id, type, amount, related_commitment_id)
        VALUES (commitment_record.user_id, 'commitment_loss', -tokens_lost, p_commitment_id);
        
        PERFORM create_regroup_mission(commitment_record.user_id, p_commitment_id, tokens_lost);
    END IF;
    
    IF commitment_record.ally_id IS NOT NULL THEN
        INSERT INTO ally_feed (user_id, ally_id, event_type, details, metadata)
        VALUES (
            commitment_record.user_id,
            commitment_record.ally_id,
            CASE WHEN success THEN 'contract_success' ELSE 'contract_failure' END,
            CASE WHEN success 
                THEN 'Successfully completed ' || commitment_record.duration_days || '-day battle contract!'
                ELSE 'Failed ' || commitment_record.duration_days || '-day battle contract'
            END,
            jsonb_build_object(
                'commitment_id', p_commitment_id,
                'success', success,
                'tokens_affected', CASE WHEN success THEN tokens_returned ELSE tokens_lost END,
                'penalty_percentage', CASE WHEN NOT success THEN penalty_percentage ELSE NULL END
            )
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', success,
        'tokens_affected', CASE WHEN success THEN tokens_returned ELSE tokens_lost END,
        'penalty_percentage', CASE WHEN NOT success THEN penalty_percentage ELSE NULL END,
        'ally_bonus', ally_bonus
    );
END;
$$;

-- auto_resolve_expired_commitments
CREATE OR REPLACE FUNCTION public.auto_resolve_expired_commitments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
    expired_commitment RECORD;
BEGIN
    FOR expired_commitment IN 
        SELECT id FROM commitments 
        WHERE status = 'active' 
        AND end_date < CURRENT_DATE
    LOOP
        PERFORM resolve_commitment_with_penalty_escalation(expired_commitment.id);
    END LOOP;
END;
$$;

-- calculate_penalty_percentage
CREATE OR REPLACE FUNCTION public.calculate_penalty_percentage(failure_count integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
    CASE 
        WHEN failure_count = 0 THEN RETURN 100;
        WHEN failure_count = 1 THEN RETURN 50;
        WHEN failure_count = 2 THEN RETURN 25;
        ELSE RETURN 10;
    END CASE;
END;
$$;

-- handle_checkin_transaction
CREATE OR REPLACE FUNCTION public.handle_checkin_transaction(p_user_id uuid, p_date_local date, p_new_streak integer, p_tokens_awarded bigint, p_best_streak integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
    checkin_id UUID;
    result jsonb;
BEGIN
    INSERT INTO check_ins (
        user_id,
        date_local,
        status,
        tokens_awarded
    ) VALUES (
        p_user_id,
        p_date_local,
        'success',
        p_tokens_awarded
    ) RETURNING id INTO checkin_id;

    UPDATE profiles 
    SET current_streak = p_new_streak,
        best_streak = p_best_streak,
        token_balance = token_balance + p_tokens_awarded,
        last_check_in_date = p_date_local,
        updated_at = NOW()
    WHERE id = p_user_id;

    INSERT INTO token_transactions (
        user_id,
        type,
        amount,
        related_checkin_id
    ) VALUES (
        p_user_id,
        'checkin_reward',
        p_tokens_awarded,
        checkin_id
    );

    SELECT jsonb_build_object(
        'current_streak', current_streak,
        'best_streak', best_streak,
        'token_balance', token_balance,
        'tokens_awarded', p_tokens_awarded,
        'has_checked_in_today', true
    ) INTO result
    FROM profiles 
    WHERE id = p_user_id;

    RETURN result;
END;
$$;

-- process_commitment_checkins
CREATE OR REPLACE FUNCTION public.process_commitment_checkins()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
    UPDATE commitments 
    SET status = 'succeeded',
        updated_at = NOW()
    WHERE status = 'active' 
    AND end_date < CURRENT_DATE
    AND user_id IN (
        SELECT c.user_id 
        FROM commitments c
        WHERE c.status = 'active'
        AND c.end_date < CURRENT_DATE
        GROUP BY c.user_id, c.id, c.start_date, c.end_date
        HAVING COUNT(DISTINCT ci.date_local) = (c.end_date - c.start_date + 1)
        AND NOT EXISTS (
            SELECT 1 FROM check_ins ci2 
            WHERE ci2.user_id = c.user_id 
            AND ci2.date_local BETWEEN c.start_date AND c.end_date
            AND ci2.status != 'success'
        )
    );
    
    UPDATE commitments 
    SET status = 'failed',
        updated_at = NOW()
    WHERE status = 'active' 
    AND end_date < CURRENT_DATE
    AND status != 'succeeded';
END;
$$;