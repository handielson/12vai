# 🌐 VAI.li - Configuração de Domínio

## Domínio de Produção

**Domínio Principal:** `vaiencurta.com.br`

### Configuração DNS (Futuro)

Quando o domínio estiver registrado, configurar:

```
# Frontend (Vercel)
A     @           76.76.21.21
CNAME www         cname.vercel-dns.com

# Edge Function (Supabase)
CNAME api         [supabase-edge-function-url]
```

### URLs do Sistema

- **Frontend:** `https://vaiencurta.com.br`
- **Dashboard:** `https://vaiencurta.com.br/dashboard`
- **Links Curtos:** `https://vaiencurta.com.br/[slug]`
- **API:** `https://api.vaiencurta.com.br` (Edge Functions)

### Branding

O domínio `vaiencurta.com.br` mantém a identidade "VAI" do projeto:
- **VAI** = Gatilho mental de ação imediata
- **encurta** = Descrição clara do serviço
- **.com.br** = Credibilidade no mercado brasileiro

### Próximos Passos

1. [ ] Registrar domínio `vaiencurta.com.br`
2. [ ] Configurar DNS no Registro.br
3. [ ] Apontar para Vercel (frontend)
4. [ ] Configurar Edge Function com domínio customizado
5. [ ] Ativar SSL (automático via Vercel)
6. [ ] Configurar Cloudflare (opcional, para WAF e DDoS protection)

### Alternativas Consideradas

- `vai.li` - Domínio internacional curto (custo alto, ~$2000/ano)
- `vaili.com.br` - Sem separação clara
- ✅ `vaiencurta.com.br` - **ESCOLHIDO** - Claro, brasileiro, acessível

---

**Status:** Domínio reservado para uso futuro
**Data:** 2026-01-12
