-- Add mood and energy tracking columns to check_ins table
ALTER TABLE check_ins 
ADD COLUMN mood_selected text,
ADD COLUMN energy_selected text,
ADD COLUMN reflection_text text;

-- Add mood and energy tracking columns to quest_completions table if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quest_completions' AND column_name = 'mood_selected') THEN
        ALTER TABLE quest_completions ADD COLUMN mood_selected text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quest_completions' AND column_name = 'energy_selected') THEN
        ALTER TABLE quest_completions ADD COLUMN energy_selected text;
    END IF;
END $$;