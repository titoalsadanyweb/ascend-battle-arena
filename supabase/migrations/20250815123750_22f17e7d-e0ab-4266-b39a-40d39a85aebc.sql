-- Create store items table
CREATE TABLE public.store_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  cost INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('avatar', 'theme', 'badge', 'special', 'armor', 'weapon')),
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  icon_name TEXT,
  requirements JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user purchases table
CREATE TABLE public.user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  store_item_id UUID NOT NULL REFERENCES store_items(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, store_item_id)
);

-- Enable RLS
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for store_items (everyone can view active items)
CREATE POLICY "Active store items are viewable by authenticated users"
ON public.store_items
FOR SELECT
USING (auth.role() = 'authenticated' AND is_active = true);

-- RLS policies for user_purchases
CREATE POLICY "Users can view their own purchases"
ON public.user_purchases
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases"
ON public.user_purchases
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert some warrior-themed store items
INSERT INTO public.store_items (name, description, cost, category, rarity, icon_name, requirements) VALUES
-- Avatar Themes
('Warrior Theme', 'Classic warrior avatar with armor and sword', 50, 'avatar', 'common', 'shield', '{}'),
('Champion Theme', 'Golden champion avatar with crown', 150, 'avatar', 'rare', 'crown', '{"streak": 7}'),
('Legend Theme', 'Legendary avatar with special effects', 500, 'avatar', 'legendary', 'star', '{"streak": 30}'),
('Berserker Theme', 'Fierce berserker with battle scars', 200, 'avatar', 'epic', 'zap', '{"streak": 14}'),
('Paladin Theme', 'Holy warrior with divine protection', 300, 'avatar', 'epic', 'heart', '{"streak": 21}'),

-- Armor
('Iron Armor', 'Basic iron armor for protection', 75, 'armor', 'common', 'shield', '{}'),
('Steel Plate Armor', 'Reinforced steel plates', 200, 'armor', 'rare', 'shield', '{"streak": 10}'),
('Dragon Scale Armor', 'Legendary armor made from dragon scales', 600, 'armor', 'legendary', 'shield', '{"streak": 50}'),
('Mithril Chainmail', 'Lightweight but incredibly strong', 400, 'armor', 'epic', 'shield', '{"streak": 25}'),

-- Weapons
('Iron Sword', 'Basic warrior sword', 60, 'weapon', 'common', 'sword', '{}'),
('Flaming Blade', 'Sword imbued with fire magic', 250, 'weapon', 'rare', 'sword', '{"streak": 15}'),
('Excalibur', 'The legendary sword of kings', 800, 'weapon', 'legendary', 'sword', '{"streak": 60}'),
('Battle Axe', 'Heavy two-handed axe', 180, 'weapon', 'rare', 'axe', '{"streak": 12}'),

-- Special Items
('Streak Protection', 'One-time protection against streak loss', 100, 'special', 'rare', 'shield', '{}'),
('Double XP Boost', '24-hour double token earning', 80, 'special', 'common', 'zap', '{}'),
('Meditation Crystal', 'Enhances quest rewards for a week', 150, 'special', 'rare', 'gem', '{"streak": 5}'),
('Phoenix Feather', 'Revive a lost streak once', 300, 'special', 'epic', 'feather', '{"streak": 20}'),

-- Themes
('Dark Knight Theme', 'Sleek dark dashboard theme', 25, 'theme', 'common', 'palette', '{}'),
('Golden Glory Theme', 'Luxury golden dashboard theme', 200, 'theme', 'epic', 'palette', '{"streak": 14}'),
('Dragon Lord Theme', 'Epic dragon-themed interface', 400, 'theme', 'legendary', 'palette', '{"streak": 40}'),

-- Badges
('First Victory Badge', 'Commemorates your first check-in', 30, 'badge', 'common', 'award', '{}'),
('Week Warrior Badge', '7-day streak achievement', 100, 'badge', 'rare', 'award', '{"streak": 7}'),
('Month Master Badge', '30-day streak achievement', 300, 'badge', 'epic', 'award', '{"streak": 30}'),
('Century Champion Badge', '100-day streak achievement', 1000, 'badge', 'legendary', 'award', '{"streak": 100}');

-- Create function to handle purchases
CREATE OR REPLACE FUNCTION public.purchase_store_item(p_item_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
    current_user_id UUID;
    item_record store_items%ROWTYPE;
    user_balance BIGINT;
    user_streak INTEGER;
    result JSONB;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object('error', 'User not authenticated');
    END IF;
    
    -- Get item details
    SELECT * INTO item_record FROM store_items WHERE id = p_item_id AND is_active = true;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Item not found or not available');
    END IF;
    
    -- Check if already owned
    IF EXISTS (SELECT 1 FROM user_purchases WHERE user_id = current_user_id AND store_item_id = p_item_id) THEN
        RETURN jsonb_build_object('error', 'Item already owned');
    END IF;
    
    -- Get user profile
    SELECT token_balance, current_streak INTO user_balance, user_streak 
    FROM profiles WHERE id = current_user_id;
    
    -- Check balance
    IF user_balance < item_record.cost THEN
        RETURN jsonb_build_object('error', 'Insufficient balance');
    END IF;
    
    -- Check streak requirement
    IF item_record.requirements ? 'streak' THEN
        IF user_streak < (item_record.requirements->>'streak')::INTEGER THEN
            RETURN jsonb_build_object('error', 'Streak requirement not met');
        END IF;
    END IF;
    
    -- Perform purchase (atomic transaction)
    BEGIN
        -- Deduct tokens
        UPDATE profiles 
        SET token_balance = token_balance - item_record.cost,
            updated_at = NOW()
        WHERE id = current_user_id;
        
        -- Add purchase record
        INSERT INTO user_purchases (user_id, store_item_id)
        VALUES (current_user_id, p_item_id);
        
        -- Log transaction
        INSERT INTO token_transactions (user_id, type, amount, created_at)
        VALUES (current_user_id, 'store_purchase', -item_record.cost, NOW());
        
        RETURN jsonb_build_object(
            'success', true,
            'item_name', item_record.name,
            'cost', item_record.cost,
            'new_balance', user_balance - item_record.cost
        );
    EXCEPTION
        WHEN OTHERS THEN
            RETURN jsonb_build_object('error', 'Purchase failed: ' || SQLERRM);
    END;
END;
$$;