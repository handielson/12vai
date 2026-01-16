-- ============================================
-- ETAPA 4: VERIFICAR SE TUDO FUNCIONOU
-- ============================================
-- Cole este bloco no SQL Editor do Supabase e clique em RUN

SELECT 
  email,
  plan,
  CASE plan
    WHEN 'free' THEN '🆓 Free'
    WHEN 'pro' THEN '💎 Pro'
    WHEN 'business' THEN '🏢 Business'
    WHEN 'white_label' THEN '🎨 White Label'
  END as plano,
  created_at
FROM users
WHERE email LIKE '%@vaili.test'
ORDER BY 
  CASE plan
    WHEN 'free' THEN 1
    WHEN 'pro' THEN 2
    WHEN 'business' THEN 3
    WHEN 'white_label' THEN 4
  END;

-- ✅ Resultado esperado:
-- | email                  | plan        | plano           |
-- |------------------------|-------------|-----------------|
-- | free@vaili.test        | free        | 🆓 Free         |
-- | pro@vaili.test         | pro         | 💎 Pro          |
-- | business@vaili.test    | business    | 🏢 Business     |
-- | whitelabel@vaili.test  | white_label | 🎨 White Label  |

-- ✅ Se você vê esta tabela, está tudo pronto!
-- 🎉 Agora você pode fazer login com qualquer um dos 4 usuários (senha: 123456)
