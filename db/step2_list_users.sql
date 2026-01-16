-- ============================================
-- ETAPA 2: LISTAR USUÁRIOS DO AUTH
-- ============================================
-- Cole este bloco no SQL Editor do Supabase e clique em RUN
-- Isso vai mostrar os usuários que você precisa deletar manualmente

SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- ✅ Veja a lista de usuários
-- ⏭️ Próximo passo: Vá para Authentication → Users e delete cada um clicando nos 3 pontinhos (...)
