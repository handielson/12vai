-- =====================================================
-- CORREÇÃO URGENTE: increment_url_clicks
-- =====================================================
-- Execute APENAS este script se increment_url_clicks
-- ainda estiver com erro de search_path
-- =====================================================

-- PASSO 1: Dropar a função antiga
DROP FUNCTION IF EXISTS public.increment_url_clicks() CASCADE;

-- PASSO 2: Criar a função corrigida
CREATE FUNCTION public.increment_url_clicks()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.urls 
  SET clicks_count = clicks_count + 1 
  WHERE id = NEW.url_id;
  RETURN NEW;
END;
$$;

-- PASSO 3: Recriar o trigger
CREATE TRIGGER increment_clicks_on_insert
  AFTER INSERT ON public.clicks
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_url_clicks();

-- PASSO 4: Verificar
SELECT 
    'RESULTADO:' as status,
    proname as funcao,
    CASE 
        WHEN proconfig IS NOT NULL AND EXISTS (
            SELECT 1 FROM unnest(proconfig) AS cfg WHERE cfg LIKE 'search_path=%'
        ) THEN '✅ CORRIGIDO - search_path configurado'
        ELSE '❌ AINDA COM PROBLEMA'
    END as resultado
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
    AND proname = 'increment_url_clicks';

-- =====================================================
-- DEVE MOSTRAR: ✅ CORRIGIDO - search_path configurado
-- =====================================================
