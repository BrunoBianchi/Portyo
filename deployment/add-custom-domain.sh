#!/bin/bash

# ============================================
# Script para adicionar domínio personalizado
# Usage: ./add-custom-domain.sh parivahansewa.com [email]
# ============================================

set -e

DOMAIN=$1
EMAIL=${2:-"${CUSTOM_DOMAIN_CERTBOT_EMAIL:-admin@portyo.me}"}
DATA_PATH="./data/certbot"
NGINX_CUSTOM_DIR="./data/nginx/custom-domains"
RSA_KEY_SIZE=4096

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ Erro: Domínio não informado${NC}"
    echo "Usage: ./add-custom-domain.sh <dominio> [email]"
    echo "Exemplo: ./add-custom-domain.sh parivahansewa.com"
    exit 1
fi

echo -e "${GREEN}🔧 Configurando domínio personalizado: $DOMAIN${NC}"

mkdir -p "$NGINX_CUSTOM_DIR"

# Verificar se o Docker Compose está rodando
if ! docker compose ps --services --filter "status=running" | grep -q "^nginx$"; then
    echo -e "${YELLOW}⚠️  Aviso: Containers Docker não estão rodando${NC}"
    echo "Iniciando containers..."
    docker compose up -d nginx certbot
    sleep 5
fi

# Garantir Nginx recarregado com config atual
docker compose exec nginx nginx -s reload >/dev/null 2>&1 || true

# Verificar se o diretório do certbot existe
if [ ! -d "$DATA_PATH/conf/live" ]; then
    echo -e "${YELLOW}📁 Criando diretórios do certbot...${NC}"
    mkdir -p "$DATA_PATH/conf/live"
    mkdir -p "$DATA_PATH/www"
    mkdir -p "$DATA_PATH/www/.well-known/acme-challenge"
    chmod 777 "$DATA_PATH/www"
fi

mkdir -p "$DATA_PATH/www/.well-known/acme-challenge"

# Validação prévia do challenge HTTP
echo -e "${GREEN}🧪 Validando endpoint ACME challenge...${NC}"
PROBE_TOKEN="portyo-probe-$(date +%s)"
PROBE_FILE="$DATA_PATH/www/.well-known/acme-challenge/$PROBE_TOKEN"
echo "$PROBE_TOKEN" > "$PROBE_FILE"

HTTP_PROBE_URL="http://$DOMAIN/.well-known/acme-challenge/$PROBE_TOKEN"
HTTP_PROBE_RESPONSE=$(curl -sL --max-time 12 "$HTTP_PROBE_URL" || true)

if [ "$HTTP_PROBE_RESPONSE" != "$PROBE_TOKEN" ]; then
    echo -e "${RED}❌ Falha no challenge HTTP antes de solicitar certificado${NC}"
    echo "URL testada: $HTTP_PROBE_URL"
    echo "Resposta obtida: ${HTTP_PROBE_RESPONSE:-<vazia>}"
    echo "Confira se o domínio aponta para este servidor e se o Nginx está expondo /var/www/certbot/.well-known/acme-challenge/."
    rm -f "$PROBE_FILE"
    exit 1
fi

rm -f "$PROBE_FILE"
echo -e "${GREEN}✅ Endpoint ACME acessível${NC}"

CERT_READY=0

# Verificar se o certificado já existe
if [ -d "$DATA_PATH/conf/live/$DOMAIN" ]; then
    echo -e "${YELLOW}⚠️  Certificado já existe para $DOMAIN${NC}"
    echo "Verificando validade..."

    if openssl x509 -checkend 86400 -noout -in "$DATA_PATH/conf/live/$DOMAIN/fullchain.pem" 2>/dev/null; then
        echo -e "${GREEN}✅ Certificado ainda é válido${NC}"
        CERT_READY=1
    else
        echo -e "${YELLOW}⚠️  Certificado expirado, renovando...${NC}"
    fi
fi

if [ "$CERT_READY" -eq 0 ]; then
    echo -e "${GREEN}🔒 Gerando certificado SSL para $DOMAIN...${NC}"

    docker compose run --rm --entrypoint certbot certbot \
        certonly \
        --webroot \
        -w /var/www/certbot \
        -d "$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos \
        --non-interactive \
        --rsa-key-size "$RSA_KEY_SIZE" \
        --force-renewal || true
fi

# Verificar se o certificado foi gerado
if [ -d "$DATA_PATH/conf/live/$DOMAIN" ]; then
    echo -e "${GREEN}✅ Certificado SSL gerado com sucesso!${NC}"
    
    # Mostrar informações do certificado
    echo -e "${GREEN}📄 Detalhes do certificado:${NC}"
    openssl x509 -in "$DATA_PATH/conf/live/$DOMAIN/fullchain.pem" -noout -subject -dates
else
    echo -e "${RED}❌ Falha ao gerar certificado${NC}"
    echo "Verificando logs..."
    
    # Tentar com modo verbose
    echo -e "${YELLOW}Tentando novamente com mais detalhes...${NC}"
    docker compose run --rm --entrypoint certbot certbot \
        certonly \
        --webroot \
        -w /var/www/certbot \
        -d "$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos \
        --non-interactive \
        --rsa-key-size "$RSA_KEY_SIZE" \
        -v || true
    
    exit 1
fi

# Criar/atualizar vhost dedicado para o domínio
CONF_FILE="$NGINX_CUSTOM_DIR/$DOMAIN.conf"
cat > "$CONF_FILE" <<EOF
server {
    listen 443 ssl;
    http2 on;
    server_name $DOMAIN;

    client_max_body_size 20m;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;

        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header Origin \$http_origin;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;

        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# Validar configuração do Nginx antes de recarregar
if ! docker compose exec nginx nginx -t >/dev/null 2>&1; then
    echo -e "${RED}❌ Configuração Nginx inválida após gerar vhost para $DOMAIN${NC}"
    rm -f "$CONF_FILE"
    exit 1
fi

echo -e "${GREEN}🔄 Recarregando Nginx...${NC}"
docker compose exec nginx nginx -s reload >/dev/null 2>&1 || true

echo -e "${GREEN}✅ Domínio $DOMAIN configurado com sucesso!${NC}"
echo ""
echo -e "${GREEN}📋 Resumo:${NC}"
echo "   Domínio: $DOMAIN"
echo "   Certificado: $DATA_PATH/conf/live/$DOMAIN/"
echo "   Expira em: $(openssl x509 -in "$DATA_PATH/conf/live/$DOMAIN/fullchain.pem" -noout -enddate | cut -d= -f2)"
echo ""
