#!/bin/bash

# ============================================
# Script para remover domínio personalizado
# Usage: ./remove-custom-domain.sh parivahansewa.com
# ============================================

set -e

DOMAIN=$1
DATA_PATH="./data/certbot"

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
    
    docker compose run --rm --entrypoint "\"
certbot delete \\
    --cert-name $DOMAIN \\
    --non-interactive \\
    --quiet
\"" certbot || true
    
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
echo -e "${GREEN}🔄 Recarregando Nginx...${NC}"
docker compose exec nginx nginx -s reload 2>/dev/null || true

echo -e "${GREEN}✅ Domínio $DOMAIN removido com sucesso!${NC}"
