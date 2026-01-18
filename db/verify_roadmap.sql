-- Verificar se os dados do roadmap foram inseridos corretamente

-- 1. Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'project_documentation'
) as table_exists;

-- 2. Verificar todos os registros
SELECT 
    section,
    updated_at,
    CASE 
        WHEN jsonb_typeof(content) = 'array' THEN jsonb_array_length(content)
        ELSE 0
    END as total_items
FROM project_documentation
ORDER BY section;

-- 3. Ver estrutura da tabela
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'project_documentation'
ORDER BY ordinal_position;

