-- Script para atualizar os textos de "Lesmas" para "Slugs" na tabela plan_settings

UPDATE plan_settings
SET features = ARRAY(
    SELECT REPLACE(unnest(features), 'Lesmas Personalizadas', 'Slugs Personalizados')
)
WHERE 'Lesmas Personalizadas' = ANY(features);

UPDATE plan_settings
SET features = ARRAY(
    SELECT REPLACE(unnest(features), 'Lesmas Premium', 'Slugs Premium')
)
WHERE 'Lesmas Premium' = ANY(features);

UPDATE plan_settings
SET features = ARRAY(
    SELECT REPLACE(unnest(features), 'Lesmas personalizadas', 'Slugs personalizados')
)
WHERE 'Lesmas personalizadas' = ANY(features);

UPDATE plan_settings
SET features = ARRAY(
    SELECT REPLACE(unnest(features), 'Lesmas premium', 'Slugs premium')
)
WHERE 'Lesmas premium' = ANY(features);

-- Verificar resultado
SELECT plan_name, features FROM plan_settings ORDER BY monthly_price;
