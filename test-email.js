// Script de teste para sistema de emails
// Execute no console do navegador (F12)

async function testarSistemaEmail() {
    console.log('🧪 Iniciando teste do sistema de email...\n');

    try {
        // 1. Verificar variáveis de ambiente
        console.log('1️⃣ Verificando configuração...');
        const apiKey = import.meta.env.VITE_RESEND_API_KEY;
        const fromEmail = import.meta.env.VITE_RESEND_FROM_EMAIL;

        if (!apiKey) {
            console.error('❌ VITE_RESEND_API_KEY não configurada!');
            return;
        }

        console.log('✅ API Key configurada:', apiKey.substring(0, 10) + '...');
        console.log('✅ From Email:', fromEmail);
        console.log('');

        // 2. Importar serviço
        console.log('2️⃣ Importando emailService...');
        const { emailService } = await import('/src/services/emailService.ts');
        console.log('✅ Serviço importado com sucesso\n');

        // 3. Enviar email de teste
        console.log('3️⃣ Enviando email de boas-vindas...');
        const seuEmail = prompt('Digite seu email para receber o teste:');

        if (!seuEmail) {
            console.log('❌ Email não fornecido. Teste cancelado.');
            return;
        }

        const resultado = await emailService.sendWelcomeEmail(
            seuEmail,
            'Teste',
            'user-teste-' + Date.now()
        );

        if (resultado) {
            console.log('✅ Email enviado com sucesso!');
            console.log('📧 Verifique sua caixa de entrada:', seuEmail);
            console.log('⚠️ Pode estar na pasta de spam');
            console.log('');
            console.log('🔍 Verifique também:');
            console.log('   - Dashboard Resend: https://resend.com/emails');
            console.log('   - Logs no Supabase (tabela email_logs)');
        } else {
            console.error('❌ Falha ao enviar email');
            console.log('Verifique:');
            console.log('   - Migration 007 foi executada?');
            console.log('   - API key está correta?');
            console.log('   - Console tem erros?');
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
        console.log('\n📋 Checklist de troubleshooting:');
        console.log('   1. Migration 007 executada no Supabase?');
        console.log('   2. Variáveis de ambiente configuradas?');
        console.log('   3. Dev server reiniciado após adicionar env vars?');
    }
}

// Executar teste
console.log('🎯 Script de teste carregado!');
console.log('Execute: testarSistemaEmail()');
console.log('');

// Auto-executar se quiser
// testarSistemaEmail();
