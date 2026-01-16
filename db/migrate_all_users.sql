-- =====================================================
-- MIGRAR TODOS OS USUÁRIOS DE auth.users PARA public.users
-- =====================================================

-- Este script copia TODOS os usuários que estão em auth.users
-- mas não estão em public.users

-- Passo 1: Ver quantos usuários existem em cada tabela
SELECT 'auth.users' as tabela, COUNT(*) as total FROM auth.users
UNION ALL
SELECT 'public.users' as tabela, COUNT(*) as total FROM public.users;

-- Passo 2: Ver quais usuários estão APENAS em auth.users
SELECT 
    au.id,
    au.email,
    au.created_at,
    'Precisa migrar' as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;

-- Passo 3: MIGRAR todos os usuários que faltam
INSERT INTO public.users (id, email, plan, is_admin)
SELECT 
    au.id,
    au.email,
    'free' as plan,
    false as is_admin
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Passo 4: Verificar se todos foram migrados
SELECT 
    'auth.users' as tabela, 
    COUNT(*) as total 
FROM auth.users
UNION ALL
SELECT 
    'public.users' as tabela, 
    COUNT(*) as total 
FROM public.users;

-- Passo 5: Ver todos os usuários agora
SELECT 
    email,
    is_admin,
    plan,
    created_at
FROM public.users
ORDER BY created_at DESC;

-- =====================================================
-- OPCIONAL: Tornar um usuário específico admin
-- =====================================================
-- Descomente e substitua o email:
-- UPDATE public.users 
-- SET is_admin = true 
-- WHERE email = 'handielson@gmail.com';
