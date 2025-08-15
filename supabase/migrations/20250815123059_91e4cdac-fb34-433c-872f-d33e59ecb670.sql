-- Fix: Enable RLS on reflection_prompts and add SELECT policy if missing
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'reflection_prompts'
  ) THEN
    -- Enable RLS
    BEGIN
      EXECUTE 'ALTER TABLE public.reflection_prompts ENABLE ROW LEVEL SECURITY';
    EXCEPTION WHEN others THEN
      -- ignore if already enabled
      NULL;
    END;

    -- Add policy only if not exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename = 'reflection_prompts' 
        AND policyname = 'Authenticated can view active prompts'
    ) THEN
      EXECUTE 'CREATE POLICY "Authenticated can view active prompts" ON public.reflection_prompts FOR SELECT USING (auth.role() = ''authenticated''::text AND is_active = true)';
    END IF;
  END IF;
END$$;