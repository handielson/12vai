-- =====================================================
-- DIAGNÓSTICO E CORREÇÃO: increment_url_clicks
-- =====================================================
-- Este script diagnostica e corrige o problema
-- =====================================================

-- PASSO 1: Ver o estado atual da função
SELECT 
    '1. ESTADO ATUAL' as etapa,
    proname as funcao,
    prosecdef as tem_security_definer,
    proconfig as configuracao_atual
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
    AND proname = 'increment_url_clicks';

-- PASSO 2: Listar todos os triggers que usam essa função
SELECT 
    '2. TRIGGERS EXISTENTES' as etapa,
    tgname as trigger_name,
    tgrelid::regclass as tabela
FROM pg_trigger
WHERE tgfoid = 'public.increment_url_clicks'::regproc;

-- PASSO 3: Dropar TODOS os triggers primeiro
DROP TRIGGER IF EXISTS increment_clicks_on_insert ON public.clicks;
DROP TRIGGER IF EXISTS increment_url_clicks_trigger ON public.clicks;

-- PASSO 4: Dropar a função com CASCADE
DROP FUNCTION IF EXISTS public.increment_url_clicks() CASCADE;

-- PASSO 5: Aguardar um momento (commit implícito)
SELECT pg_sleep(0.1);

-- PASSO 6: Criar a função NOVA com search_path
CREATE OR REPLACE FUNCTION public.increment_url_clicks()
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

-- PASSO 7: Criar o trigger
CREATE TRIGGER increment_clicks_on_insert
  AFTER INSERT ON public.clicks
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_url_clicks();

-- PASSO 8: Verificar o resultado final
SELECT 
    '3. RESULTADO FINAL' as etapa,
    proname as funcao,
    CASE 
        WHEN proconfig IS NOT NULL THEN '✅ TEM CONFIGURAÇÃO'
        ELSE '❌ SEM CONFIGURAÇÃO'
    END as status,
    proconfig as config
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
    AND proname = 'increment_url_clicks';

-- PASSO 9: Verificar se o trigger foi criado
SELECT 
    '4. TRIGGER VERIFICADO' as etapa,
    tgname as trigger_name,
    tgrelid::regclass as tabela,
    '✅ CRIADO' as status
FROM pg_trigger
WHERE tgfoid = 'public.increment_url_clicks'::regproc;

-- =====================================================
-- RESULTADO ESPERADO:
-- - ESTADO ATUAL: mostra configuração antiga (ou vazia)
-- - RESULTADO FINAL: deve mostrar "✅ TEM CONFIGURAÇÃO"
-- - config deve ser: {search_path=}
-- =====================================================
