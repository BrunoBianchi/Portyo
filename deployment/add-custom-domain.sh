#!/bin/bash

# ============================================
# Script para adicionar domínio personalizado
# Usage: ./add-custom-domain.sh parivahansewa.com [email]
# ============================================

set -e

DOMAIN=$1
EMAIL=${2:-"admin@portyo.me"}
DATA_PATH="./data/certbot"
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

# Verificar se o Docker Compose está rodando
if ! docker compose ps | grep -q "nginx"; then
    echo -e "${YELLOW}⚠️  Aviso: Containers Docker não estão rodando${NC}"
    echo "Iniciando containers..."
    docker compose up -d nginx certbot
    sleep 5
fi

# Verificar se o diretório do certbot existe
if [ ! -d "$DATA_PATH/conf/live" ]; then
    echo -e "${YELLOW}📁 Criando diretórios do certbot...${NC}"
    mkdir -p "$DATA_PATH/conf/live"
    mkdir -p "$DATA_PATH/www"
    chmod 777 "$DATA_PATH/www"
fi

# Verificar se o certificado já existe
if [ -d "$DATA_PATH/conf/live/$DOMAIN" ]; then
    echo -e "${YELLOW}⚠️  Certificado já existe para $DOMAIN${NC}"
    echo "Verificando validade..."
    
    # Verificar se o certificado é válido
    if openssl x509 -checkend 86400 -noout -in "$DATA_PATH/conf/live/$DOMAIN/fullchain.pem" 2>/dev/null; then
        echo -e "${GREEN}✅ Certificado ainda é válido${NC}"
        
        # Recarregar nginx para garantir
        echo "🔄 Recarregando Nginx..."
        docker compose exec nginx nginx -s reload 2>/dev/null || true
        
        exit 0
    else
        echo -e "${YELLOW}⚠️  Certificado expirado, renovando...${NC}"
    fi
fi

# Gerar certificado usando Certbot
echo -e "${GREEN}🔒 Gerando certificado SSL para $DOMAIN...${NC}"

docker compose run --rm --entrypoint "\"
certbot certonly \\
    --webroot \\
    -w /var/www/certbot \\
    -d $DOMAIN \\
    --email $EMAIL \\
    --agree-tos \\
    --non-interactive \\
    --rsa-key-size $RSA_KEY_SIZE \\
    --force-renewal || true
\"" certbot

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
    docker compose run --rm --entrypoint "\"
certbot certonly \\
    --webroot \\
    -w /var/www/certbot \\
    -d $DOMAIN \\
    --email $EMAIL \\
    --agree-tos \\
    --non-interactive \\
    --rsa-key-size $RSA_KEY_SIZE \\
    -v
\"" certbot || true
    
    exit 1
fi

# Recarregar Nginx para usar o novo certificado
echo -e "${GREEN}🔄 Recarregando Nginx...${NC}"
docker compose exec nginx nginx -s reload

echo -e "${GREEN}✅ Domínio $DOMAIN configurado com sucesso!${NC}"
echo ""
echo -e "${GREEN}📋 Resumo:${NC}"
echo "   Domínio: $DOMAIN"
echo "   Certificado: $DATA_PATH/conf/live/$DOMAIN/"
echo "   Expira em: $(openssl x509 -in $DATA_PATH/conf/live/$DOMAIN/fullchain.pem -noout -enddate | cut -d= -f2)"
echo ""
