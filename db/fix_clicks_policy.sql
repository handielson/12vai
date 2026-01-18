-- =====================================================
-- DIAGNÓSTICO E CORREÇÃO: Política de Clicks
-- =====================================================

-- PASSO 1: Ver todas as políticas existentes na tabela clicks
SELECT 
    '1. POLÍTICAS ATUAIS EM CLICKS' as etapa,
    policyname,
    cmd as operacao,
    qual as tipo,
    with_check as with_check_expr
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'clicks'
ORDER BY policyname;

-- PASSO 2: Remover TODAS as políticas de INSERT em clicks
DROP POLICY IF EXISTS "Service role can insert clicks" ON public.clicks;
DROP POLICY IF EXISTS "Allow insert clicks for service role or own urls" ON public.clicks;
DROP POLICY IF EXISTS "Users can insert clicks" ON public.clicks;

-- PASSO 3: Criar a política correta com auth otimizado
CREATE POLICY "Allow insert clicks for service role or own urls"
  ON public.clicks FOR INSERT
  WITH CHECK (
    -- Service role pode inserir (otimizado)
    (SELECT auth.jwt()->>'role') = 'service_role'
    OR
    -- Ou se for URL do próprio usuário (otimizado)
    EXISTS (
      SELECT 1 FROM public.urls
      WHERE urls.id = url_id
      AND urls.user_id = (SELECT auth.uid())
    )
  );

-- PASSO 4: Verificar a política criada
SELECT 
    '2. POLÍTICA CRIADA' as etapa,
    policyname,
    cmd as operacao,
    with_check as expressao
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'clicks'
    AND cmd = 'INSERT';

-- PASSO 5: Verificar se a expressão contém SELECT
SELECT 
    '3. VERIFICAÇÃO DE OTIMIZAÇÃO' as etapa,
    policyname,
    CASE 
        WHEN with_check LIKE '%(SELECT auth.%' THEN '✅ OTIMIZADO'
        WHEN with_check LIKE '%auth.%' THEN '❌ NÃO OTIMIZADO'
        ELSE '⚠️ VERIFICAR MANUALMENTE'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'clicks'
    AND cmd = 'INSERT';

-- =====================================================
-- RESULTADO ESPERADO:
-- Status deve ser: ✅ OTIMIZADO
-- =====================================================
