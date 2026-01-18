# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [1.5.0] - 2026-01-18

### ✨ Adicionado
- **Sistema Completo de Cupons e Promoções**
  - Criação e gerenciamento de cupons de desconto
  - Suporte para desconto percentual, valor fixo e extensão de trial
  - Configuração flexível de aplicabilidade (upgrade, renovação ou ambos)
  - Limites de uso total e por usuário
  - Restrição a planos específicos
  - Dashboard de estatísticas em tempo real
  - Interface admin completa para gerenciamento
  - Campo de cupom no checkout com validação em tempo real

### 🗄️ Database
- Tabela `coupons` para armazenar cupons
- Tabela `coupon_usage` para histórico de uso
- Funções PostgreSQL: `validate_coupon`, `apply_coupon`, `calculate_discount`, `get_coupon_stats`
- RLS policies completas para segurança
- ENUM types para tipagem forte

### 💻 Componentes
- `CouponManagement.tsx` - Interface admin de gerenciamento
- `CouponField.tsx` - Campo de cupom para checkout
- `couponService.ts` - Serviço de integração com backend

### 🔒 Segurança
- Correção de `search_path` em funções do banco de dados
- Otimização de políticas RLS
- Validação de `user_id` em inserções

### 🎨 UI/UX
- Versão v1.5.0 visível em todos os rodapés
- Copyright atualizado para 2026
- Aba "Cupons" no Portal Admin

---

## [1.4.0] - 2026-01-15

### ✨ Adicionado
- Sistema de personalização de QR Codes
- Customização de cores, logos e estilos
- Integração com qr-code-styling

---

## [1.3.0] - 2026-01-13

### ✨ Adicionado
- Dashboard de Analytics avançado
- Gráficos de cliques por dispositivo e navegador
- Métricas de performance

---

## [1.2.0] - 2026-01-12

### ✨ Adicionado
- Portal Admin Standalone
- Modo de manutenção
- Gestão de usuários e planos

---

## [1.1.0] - 2025-12-30

### ✨ Adicionado
- Sistema de autenticação completo
- Gestão de planos (Free, Pro, Business)
- Limites de URLs por plano

---

## [1.0.0] - 2025-12-01

### ✨ Lançamento Inicial
- Encurtador de URLs básico
- Dashboard de links
- Relatórios de cliques
- Integração com Supabase
