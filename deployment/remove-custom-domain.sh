#!/bin/bash

# ============================================
# Script para remover domínio personalizado
# Usage: ./remove-custom-domain.sh parivahansewa.com
# ============================================

set -e

DOMAIN=$1
DATA_PATH="./data/certbot"
NGINX_CUSTOM_DIR="./data/nginx/custom-domains"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ Erro: Domínio não informado${NC}"
    echo "Usage: ./remove-custom-domain.sh <dominio>"
    exit 1
fi

echo -e "${YELLOW}🗑️  Removendo domínio: $DOMAIN${NC}"

# Remover certificado do Certbot
if [ -d "$DATA_PATH/conf/live/$DOMAIN" ]; then
    echo -e "${YELLOW}🔒 Removendo certificado SSL...${NC}"
    
    docker compose run --rm --entrypoint certbot certbot \
        delete \
        --cert-name "$DOMAIN" \
        --non-interactive \
        --quiet || true
    
    # Remover arquivos manualmente se ainda existirem
    if [ -d "$DATA_PATH/conf/live/$DOMAIN" ]; then
        rm -rf "$DATA_PATH/conf/live/$DOMAIN"
        rm -rf "$DATA_PATH/conf/archive/$DOMAIN" 2>/dev/null || true
        rm -f "$DATA_PATH/conf/renewal/$DOMAIN.conf" 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ Certificado removido${NC}"
else
    echo -e "${YELLOW}⚠️  Certificado não encontrado${NC}"
fi

# Recarregar Nginx
CONF_FILE="$NGINX_CUSTOM_DIR/$DOMAIN.conf"
if [ -f "$CONF_FILE" ]; then
    rm -f "$CONF_FILE"
    echo -e "${GREEN}🧹 VHost removido: $CONF_FILE${NC}"
fi

echo -e "${GREEN}🔄 Recarregando Nginx...${NC}"
docker compose exec nginx nginx -t >/dev/null 2>&1 || {
    echo -e "${RED}❌ Configuração Nginx inválida. Abortando reload.${NC}"
    exit 1
}
docker compose exec nginx nginx -s reload 2>/dev/null || true

echo -e "${GREEN}✅ Domínio $DOMAIN removido com sucesso!${NC}"
