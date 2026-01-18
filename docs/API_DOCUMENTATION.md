# 🔌 API Pública VaiEncurta - Documentação Completa

## 📖 Visão Geral

A API REST do VaiEncurta permite que você integre nosso encurtador de URLs em suas aplicações, sites e serviços. Com autenticação via API Key e rate limiting baseado em plano, você pode criar, gerenciar e rastrear links encurtados programaticamente.

**Base URL:** `https://12vai.com/api/v1`

---

## 🔐 Autenticação

Todas as requisições à API requerem autenticação via API Key no header `Authorization`.

### Obter sua API Key

1. Acesse o [Portal Admin](https://12vai.com/admin)
2. Navegue até a aba **"API"**
3. Clique em **"Criar Nova Chave"**
4. Dê um nome descritivo (ex: "Meu App - Produção")
5. Escolha o ambiente (live ou test)
6. Copie a chave gerada (ela será exibida apenas UMA vez)

### Formato da API Key

```
vai_live_1234567890abcdef1234567890abcdef  # Produção
vai_test_1234567890abcdef1234567890abcdef  # Teste
```

### Header de Autenticação

```http
Authorization: Bearer vai_live_xxxxxxxxxxxxx
```

---

## ⏱️ Rate Limiting

Limites de requisições por hora baseados no seu plano:

| Plano | Requisições/Hora |
|-------|------------------|
| Free | 100 |
| Pro | 1.000 |
| Business | 10.000 |
| White Label | Ilimitado |

### Headers de Resposta

Toda resposta inclui headers de rate limit:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 2026-01-18T17:00:00Z
```

### Erro de Rate Limit

```json
{
  "error": "Rate limit exceeded",
  "message": "Você excedeu o limite de 1000 requisições por hora",
  "reset_at": "2026-01-18T17:00:00Z"
}
```

---

## 📡 Endpoints

### POST /api/v1/urls
Criar URL encurtada

**Request:**
```json
{
  "url": "https://example.com/very-long-url",
  "custom_slug": "my-link",  // opcional
  "title": "My Link",         // opcional
  "expires_at": "2026-12-31T23:59:59Z"  // opcional
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "short_url": "https://12vai.com/my-link",
  "original_url": "https://example.com/very-long-url",
  "slug": "my-link",
  "title": "My Link",
  "created_at": "2026-01-18T16:30:00Z",
  "expires_at": "2026-12-31T23:59:59Z",
  "clicks": 0
}
```

---

### GET /api/v1/urls
Listar URLs do usuário

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `search` (busca por título/slug)

**Request:**
```http
GET /api/v1/urls?page=1&limit=20&search=example
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "short_url": "https://12vai.com/my-link",
      "original_url": "https://example.com/very-long-url",
      "slug": "my-link",
      "title": "My Link",
      "created_at": "2026-01-18T16:30:00Z",
      "clicks": 42
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

### GET /api/v1/urls/:id
Obter detalhes de uma URL

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "short_url": "https://12vai.com/my-link",
  "original_url": "https://example.com/very-long-url",
  "slug": "my-link",
  "title": "My Link",
  "created_at": "2026-01-18T16:30:00Z",
  "expires_at": null,
  "clicks": 42,
  "qr_code_url": "https://12vai.com/qr/my-link"
}
```

---

### PUT /api/v1/urls/:id
Atualizar URL

**Request:**
```json
{
  "title": "Updated Title",
  "original_url": "https://example.com/new-destination"
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "short_url": "https://12vai.com/my-link",
  "original_url": "https://example.com/new-destination",
  "title": "Updated Title",
  "updated_at": "2026-01-18T17:00:00Z"
}
```

---

### DELETE /api/v1/urls/:id
Deletar URL

**Response (204 No Content)**

---

### GET /api/v1/urls/:id/stats
Obter estatísticas de cliques

**Response (200 OK):**
```json
{
  "total_clicks": 1234,
  "unique_clicks": 890,
  "clicks_by_date": [
    {
      "date": "2026-01-18",
      "clicks": 42
    }
  ],
  "clicks_by_country": [
    {
      "country": "BR",
      "clicks": 800
    },
    {
      "country": "US",
      "clicks": 200
    }
  ],
  "clicks_by_device": [
    {
      "device": "mobile",
      "clicks": 700
    },
    {
      "device": "desktop",
      "clicks": 534
    }
  ]
}
```

---

### GET /api/v1/me
Informações do usuário autenticado

**Response (200 OK):**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "plan_type": "pro",
  "created_at": "2026-01-01T00:00:00Z",
  "rate_limit": {
    "limit_per_hour": 1000,
    "current_count": 42,
    "reset_at": "2026-01-18T17:00:00Z"
  }
}
```

---

## 💻 Exemplos de Código

### cURL

```bash
# Criar URL
curl -X POST https://12vai.com/api/v1/urls \
  -H "Authorization: Bearer vai_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/long-url",
    "custom_slug": "my-link",
    "title": "My Link"
  }'

# Listar URLs
curl -X GET "https://12vai.com/api/v1/urls?page=1&limit=20" \
  -H "Authorization: Bearer vai_live_xxxxx"

# Obter estatísticas
curl -X GET https://12vai.com/api/v1/urls/550e8400-e29b-41d4-a716-446655440000/stats \
  -H "Authorization: Bearer vai_live_xxxxx"
```

### JavaScript / Node.js

```javascript
const API_KEY = 'vai_live_xxxxx';
const BASE_URL = 'https://12vai.com/api/v1';

// Criar URL
async function createShortUrl(url, customSlug = null, title = null) {
  const response = await fetch(`${BASE_URL}/urls`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url,
      custom_slug: customSlug,
      title
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  return await response.json();
}

// Listar URLs
async function listUrls(page = 1, limit = 20) {
  const response = await fetch(`${BASE_URL}/urls?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  });

  return await response.json();
}

// Uso
(async () => {
  const shortUrl = await createShortUrl(
    'https://example.com/long-url',
    'my-link',
    'My Link'
  );
  console.log('URL criada:', shortUrl.short_url);

  const urls = await listUrls();
  console.log('Total de URLs:', urls.pagination.total);
})();
```

### Python

```python
import requests

API_KEY = 'vai_live_xxxxx'
BASE_URL = 'https://12vai.com/api/v1'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# Criar URL
def create_short_url(url, custom_slug=None, title=None):
    data = {'url': url}
    if custom_slug:
        data['custom_slug'] = custom_slug
    if title:
        data['title'] = title
    
    response = requests.post(
        f'{BASE_URL}/urls',
        headers=headers,
        json=data
    )
    response.raise_for_status()
    return response.json()

# Listar URLs
def list_urls(page=1, limit=20):
    response = requests.get(
        f'{BASE_URL}/urls',
        headers=headers,
        params={'page': page, 'limit': limit}
    )
    response.raise_for_status()
    return response.json()

# Obter estatísticas
def get_stats(url_id):
    response = requests.get(
        f'{BASE_URL}/urls/{url_id}/stats',
        headers=headers
    )
    response.raise_for_status()
    return response.json()

# Uso
if __name__ == '__main__':
    # Criar URL
    short_url = create_short_url(
        'https://example.com/long-url',
        custom_slug='my-link',
        title='My Link'
    )
    print(f"URL criada: {short_url['short_url']}")
    
    # Listar URLs
    urls = list_urls(page=1, limit=10)
    print(f"Total de URLs: {urls['pagination']['total']}")
    
    # Estatísticas
    stats = get_stats(short_url['id'])
    print(f"Total de cliques: {stats['total_clicks']}")
```

### PHP

```php
<?php

$apiKey = 'vai_live_xxxxx';
$baseUrl = 'https://12vai.com/api/v1';

// Criar URL
function createShortUrl($url, $customSlug = null, $title = null) {
    global $apiKey, $baseUrl;
    
    $data = ['url' => $url];
    if ($customSlug) $data['custom_slug'] = $customSlug;
    if ($title) $data['title'] = $title;
    
    $ch = curl_init("$baseUrl/urls");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $apiKey",
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 201) {
        throw new Exception("HTTP $httpCode: $response");
    }
    
    return json_decode($response, true);
}

// Listar URLs
function listUrls($page = 1, $limit = 20) {
    global $apiKey, $baseUrl;
    
    $ch = curl_init("$baseUrl/urls?page=$page&limit=$limit");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $apiKey"
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// Uso
$shortUrl = createShortUrl(
    'https://example.com/long-url',
    'my-link',
    'My Link'
);
echo "URL criada: " . $shortUrl['short_url'] . "\n";

$urls = listUrls();
echo "Total de URLs: " . $urls['pagination']['total'] . "\n";
?>
```

---

## ❌ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - API key inválida ou ausente |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Slug já existe |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Erro no servidor |

### Formato de Erro

```json
{
  "error": "invalid_request",
  "message": "O campo 'url' é obrigatório",
  "details": {
    "field": "url",
    "code": "required"
  }
}
```

---

## 🔒 Segurança

### Boas Práticas

1. **Nunca exponha sua API key** em código público ou repositórios
2. **Use variáveis de ambiente** para armazenar a chave
3. **Revogue chaves comprometidas** imediatamente
4. **Use chaves diferentes** para produção e desenvolvimento
5. **Monitore o uso** regularmente no painel admin
6. **Implemente retry logic** com backoff exponencial
7. **Valide respostas** antes de processar

### Rotação de Chaves

Recomendamos rotacionar suas API keys a cada 90 dias:

1. Crie uma nova chave no painel admin
2. Atualize sua aplicação com a nova chave
3. Teste em ambiente de staging
4. Deploy para produção
5. Revogue a chave antiga após confirmação

---

## 📞 Suporte

**Dúvidas sobre a API:**
- 📧 E-mail: api@12vai.com
- 📚 Documentação: https://12vai.com/docs/api
- 💬 Discord: https://discord.gg/vaiencurta

**Reportar bugs:**
- 🐛 GitHub Issues: https://github.com/vaiencurta/api/issues

**Tempo de resposta:** Até 24 horas úteis

---

## 📝 Changelog da API

### v1.0.0 (18/01/2026)
- ✅ Lançamento inicial da API
- ✅ Autenticação via API Key
- ✅ Rate limiting por plano
- ✅ Endpoints CRUD de URLs
- ✅ Estatísticas de cliques
- ✅ Documentação completa

---

**© 2026 VaiEncurta. Todos os direitos reservados.**
