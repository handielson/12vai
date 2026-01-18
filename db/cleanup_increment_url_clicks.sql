-- =====================================================
-- LIMPEZA COMPLETA: Remover TODAS as versões de increment_url_clicks
-- =====================================================

-- PASSO 1: Listar TODAS as funções increment_url_clicks
SELECT 
    'FUNÇÕES ENCONTRADAS:' as info,
    oid,
    proname,
    pg_get_function_identity_arguments(oid) as argumentos,
    proconfig
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
    AND proname = 'increment_url_clicks';

-- PASSO 2: Dropar TODAS as versões possíveis
-- Sem argumentos
DROP FUNCTION IF EXISTS public.increment_url_clicks() CASCADE;

-- Com possíveis argumentos (caso existam)
DROP FUNCTION IF EXISTS public.increment_url_clicks(text) CASCADE;
DROP FUNCTION IF EXISTS public.increment_url_clicks(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.increment_url_clicks(integer) CASCADE;

-- PASSO 3: Verificar se ainda existe alguma
SELECT 
    'APÓS LIMPEZA:' as info,
    COUNT(*) as total_funcoes
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
    AND proname = 'increment_url_clicks';
-- Deve retornar 0

-- PASSO 4: Criar a função CORRETA (única versão)
CREATE FUNCTION public.increment_url_clicks()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  UPDATE public.urls 
  SET clicks_count = clicks_count + 1 
  WHERE id = NEW.url_id;
  RETURN NEW;
END;
$$;

-- PASSO 5: Criar o trigger
DROP TRIGGER IF EXISTS increment_clicks_on_insert ON public.clicks;
CREATE TRIGGER increment_clicks_on_insert
  AFTER INSERT ON public.clicks
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_url_clicks();

-- PASSO 6: VERIFICAÇÃO FINAL
SELECT 
    '✅ VERIFICAÇÃO FINAL' as status,
    proname as funcao,
    pg_get_function_identity_arguments(oid) as argumentos,
    CASE 
        WHEN proconfig IS NOT NULL AND proconfig::text LIKE '%search_path%' 
        THEN '✅ search_path CONFIGURADO'
        ELSE '❌ SEM search_path'
    END as resultado,
    proconfig as configuracao
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
    AND proname = 'increment_url_clicks';

-- Deve retornar apenas 1 linha com "✅ search_path CONFIGURADO"

-- =====================================================
-- SUCESSO: Deve existir apenas 1 função com search_path configurado
-- =====================================================
