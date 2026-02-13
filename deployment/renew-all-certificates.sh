#!/bin/bash

# ============================================
# Renova todos os certificados SSL
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔄 Renovando todos os certificados SSL...${NC}"

mkdir -p ./data/nginx/custom-domains

# Verificar se containers estão rodando
if ! docker compose ps | grep -q "certbot"; then
    echo -e "${YELLOW}⚠️  Container certbot não está rodando${NC}"
    echo "Iniciando containers..."
    docker compose up -d certbot
    sleep 2
fi

# Executar renovação
echo -e "${GREEN}📜 Executando certbot renew...${NC}"
docker compose run --rm --entrypoint certbot certbot \
    renew \
    --webroot \
    -w /var/www/certbot \
    --quiet \
    --no-random-sleep-on-renew

# Recarregar Nginx
echo -e "${GREEN}🔄 Recarregando Nginx...${NC}"
docker compose exec nginx nginx -t >/dev/null 2>&1 || {
    echo -e "${RED}❌ Configuração Nginx inválida. Abortando reload.${NC}"
    exit 1
}
docker compose exec nginx nginx -s reload

echo -e "${GREEN}✅ Renovação concluída!${NC}"

# Mostrar status atual
echo ""
./list-custom-domains.sh
