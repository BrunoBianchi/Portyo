# 🌐 Guia de Domínios Personalizados - Portyo.me

Este guia explica como configurar e gerenciar domínios personalizados para seus clientes no Portyo.me.

## 📋 Índice

1. [Arquitetura](#arquitetura)
2. [Configuração Inicial](#configuração-inicial)
3. [Adicionando um Domínio](#adicionando-um-domínio)
4. [API Endpoints](#api-endpoints)
5. [Scripts de Gerenciamento](#scripts-de-gerenciamento)
6. [Frontend](#frontend)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ parivahansewa.com│────▶│  Nginx          │────▶│  Backend        │
│ (Domínio Cliente)│     │  (default_server)│     │  (Node.js)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │                         │
                               ▼                         ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │  Certbot        │     │  PostgreSQL     │
                        │  (SSL auto)     │     │  (CustomDomain) │
                        └─────────────────┘     └─────────────────┘
```

### Fluxo de uma Requisição

1. **Cliente acessa** `https://parivahansewa.com`
2. **Nginx** (server block `default_server`) recebe a requisição
3. **Nginx** proxy para o backend mantendo o header `Host: parivahansewa.com`
4. **Backend** detecta o domínio via `customDomainMiddleware`
5. **Backend** busca o domínio no banco e identifica o bio correto
6. **Backend** serve o conteúdo do bio mantendo a URL original

---

## ⚙️ Configuração Inicial

### 1. Setup Inicial (Execute uma vez)

```bash
cd deployment
./setup-custom-domains.sh
```

Este script:
- Cria diretórios necessários
- Baixa parâmetros TLS da Let's Encrypt
- Configura permissões dos scripts

### 2. Verifique se o Nginx está configurado

O arquivo `deployment/nginx.conf` já deve conter:

```nginx
server {
    listen 443 ssl default_server;
    server_name _;
    # ... configuração de SSL e proxy
}
```

### 3. Reinicie os containers

```bash
docker compose down
docker compose up -d
```

---

## 📝 Adicionando um Domínio

### Método 1: Via Script (Rápido)

```bash
cd deployment
./add-custom-domain.sh parivahansewa.com
```

### Método 2: Via API (Recomendado)

1. **Cliente configura DNS primeiro:**
   - Registro A: `parivahansewa.com` → `SEU_SERVIDOR_IP`
   - Ou CNAME: `www` → `portyo.me`

2. **Chame a API para adicionar:**

```bash
curl -X POST https://api.portyo.me/api/custom-domains \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "parivahansewa.com",
    "bioId": "uuid-do-bio"
  }'
```

3. **Verifique o status:**

```bash
curl https://api.portyo.me/api/custom-domains \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 🔌 API Endpoints

### Listar Domínios do Usuário
```http
GET /api/custom-domains
Authorization: Bearer {token}
```

### Adicionar Domínio (Requer Pro)
```http
POST /api/custom-domains
Authorization: Bearer {token}
Content-Type: application/json

{
  "domain": "parivahansewa.com",
  "bioId": "uuid-do-bio"
}
```

### Verificar Status de Domínio (Público)
```http
GET /api/custom-domains/check?domain=parivahansewa.com
```

### Obter Detalhes
```http
GET /api/custom-domains/:id
Authorization: Bearer {token}
```

### Forçar Re-verificação
```http
POST /api/custom-domains/:id/verify
Authorization: Bearer {token}
```

### Remover Domínio
```http
DELETE /api/custom-domains/:id
Authorization: Bearer {token}
```

---

## 🛠️ Scripts de Gerenciamento

Todos os scripts estão em `deployment/`:

| Script | Descrição |
|--------|-----------|
| `setup-custom-domains.sh` | Configuração inicial |
| `add-custom-domain.sh <domínio>` | Adiciona novo domínio + SSL |
| `remove-custom-domain.sh <domínio>` | Remove domínio e certificado |
| `list-custom-domains.sh` | Lista todos os certificados |
| `renew-all-certificates.sh` | Renova certificados expirando |

---

## 💻 Frontend

### Detectando Domínios Personalizados no Frontend

O backend adiciona headers quando é um domínio personalizado:

```javascript
// React/Vue/Angular
const isCustomDomain = document.querySelector('meta[name="custom-domain"]')?.content === 'true';
const bioSlug = document.querySelector('meta[name="bio-slug"]')?.content;

// Ou via API
fetch('/api/user/me')
  .then(r => r.json())
  .then(data => {
    if (data.bio.customDomain) {
      // Renderiza sem mostrar o slug na URL
    }
  });
```

### Página de Configuração para Usuários

```jsx
// Exemplo de componente React
function CustomDomainSettings() {
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState(null);

  const addDomain = async () => {
    const res = await fetch('/api/custom-domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, bioId: currentBioId })
    });
    
    const data = await res.json();
    setStatus(data);
  };

  return (
    <div>
      <h2>Domínio Personalizado</h2>
      <input 
        value={domain} 
        onChange={e => setDomain(e.target.value)}
        placeholder="seudominio.com"
      />
      <button onClick={addDomain}>Adicionar</button>
      
      {status?.domain?.status === 'pending' && (
        <div className="alert">
          <p>Configure o DNS do seu domínio:</p>
          <code>Tipo A: {domain} → {SERVER_IP}</code>
        </div>
      )}
    </div>
  );
}
```

---

## 🔧 Troubleshooting

### "Domínio não encontrado"

1. Verifique se o DNS está propagado:
   ```bash
   nslookup parivahansewa.com
   ```

2. Verifique no backend:
   ```bash
   curl https://api.portyo.me/api/custom-domains/check?domain=parivahansewa.com
   ```

### "Certificado SSL não gerado"

1. Verifique logs do certbot:
   ```bash
   docker compose logs certbot
   ```

2. Tente gerar manualmente:
   ```bash
   ./add-custom-domain.sh parivahansewa.com
   ```

3. Verifique se o domínio resolve para o servidor:
   ```bash
   dig +short parivahansewa.com
   ```

### "Domínio aponta para IP errado"

O cliente precisa configurar o DNS corretamente:
- **Registro A**: `parivahansewa.com` → `SEU_IP_SERVIDOR`
- **CNAME**: `www.parivahansewa.com` → `portyo.me`

### Rate Limit Let's Encrypt

Se atingir o limite (50 certificados/semana):

```bash
# Verifique quantos certificados já existem
./list-custom-domains.sh

# Aguarde a renovação automática (a cada 12h)
```

---

## 📊 Estrutura de Dados

### CustomDomainEntity

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único |
| `domain` | string | Domínio personalizado (ex: parivahansewa.com) |
| `bioId` | UUID | ID do bio vinculado |
| `userId` | UUID | ID do proprietário |
| `status` | enum | pending, verifying_dns, active, failed |
| `sslActive` | boolean | Certificado SSL está ativo |
| `sslExpiresAt` | Date | Data de expiração do SSL |
| `dnsVerifiedAt` | Date | Quando o DNS foi verificado |
| `isHealthy` | boolean | Última verificação de saúde |

---

## 🔒 Segurança

- Domínios personalizados **requerem plano Pro**
- SSL/TLS é **obrigatório** (forçado pelo Nginx)
- Headers de segurança são preservados do Helmet
- Rate limiting se aplica a domínios personalizados

---

## 📝 Checklist para Novos Domínios

- [ ] Cliente configurou DNS (A ou CNAME)
- [ ] DNS propagado (verificar com `nslookup`)
- [ ] Domínio adicionado via API ou script
- [ ] Certificado SSL gerado com sucesso
- [ ] Status do domínio é "active"
- [ ] Teste de acesso via HTTPS funciona
- [ ] SEO/Canonical URLs configurados

---

## 🚀 Próximos Passos

1. Implementar página no frontend para usuários configurarem domínios
2. Adicionar verificação automática de saúde dos domínios (cron job)
3. Notificações por email quando certificados estiverem próximos do vencimento
4. Suporte a redirects (www → non-www)
5. Analytics específicos por domínio personalizado
