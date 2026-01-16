-- ============================================
-- ETAPA 3: ATUALIZAR PLANOS DOS USUÁRIOS
-- ============================================
-- IMPORTANTE: Execute SOMENTE DEPOIS de criar os 4 usuários via Dashboard!
-- 
-- Vá para: Supabase Dashboard → Authentication → Users → Add user
-- Crie os 4 usuários:
--   1. free@vaili.test / 123456 (marque Auto Confirm User)
--   2. pro@vaili.test / 123456 (marque Auto Confirm User)
--   3. business@vaili.test / 123456 (marque Auto Confirm User)
--   4. whitelabel@vaili.test / 123456 (marque Auto Confirm User)
--
-- Depois de criar os 4 usuários, cole este bloco no SQL Editor e clique em RUN:

UPDATE users SET plan = 'pro' WHERE email = 'pro@vaili.test';
UPDATE users SET plan = 'business' WHERE email = 'business@vaili.test';
UPDATE users SET plan = 'white_label' WHERE email = 'whitelabel@vaili.test';

-- ✅ Planos atualizados!
-- ⏭️ Próximo passo: Execute step4_verify.sql para verificar
