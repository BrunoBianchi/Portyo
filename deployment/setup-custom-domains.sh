#!/bin/bash

# ============================================
# Script de setup inicial para domínios personalizados
# Executar uma vez ao configurar o servidor
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Configurando suporte a domínios personalizados...${NC}"
echo ""

# 1. Criar diretórios necessários
echo -e "${GREEN}📁 Criando diretórios...${NC}"
mkdir -p ./data/certbot/conf
mkdir -p ./data/certbot/www
chmod 777 ./data/certbot/www
echo -e "${GREEN}✅ Diretórios criados${NC}"

# 2. Baixar parâmetros TLS se não existirem
echo -e "${GREEN}📥 Configurando parâmetros TLS...${NC}"
if [ ! -e "./data/certbot/conf/options-ssl-nginx.conf" ]; then
    echo "Baixando configurações TLS da Let's Encrypt..."
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "./data/certbot/conf/options-ssl-nginx.conf"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "./data/certbot/conf/ssl-dhparams.pem"
    echo -e "${GREEN}✅ Parâmetros TLS baixados${NC}"
else
    echo -e "${YELLOW}ℹ️  Parâmetros TLS já existem${NC}"
fi

# 3. Verificar se há certificados existentes
echo ""
echo -e "${BLUE}📋 Verificando certificados existentes...${NC}"
if [ -d "./data/certbot/conf/live/portyo.me" ]; then
    echo -e "${GREEN}✅ Certificado principal (portyo.me) encontrado${NC}"
else
    echo -e "${YELLOW}⚠️  Certificado principal não encontrado${NC}"
    echo "Execute o script init-letsencrypt.sh primeiro para configurar o certificado principal"
fi

# 4. Tornar scripts executáveis
echo ""
echo -e "${GREEN}🔧 Configurando permissões...${NC}"
chmod +x add-custom-domain.sh 2>/dev/null || true
chmod +x remove-custom-domain.sh 2>/dev/null || true
chmod +x list-custom-domains.sh 2>/dev/null || true
chmod +x renew-all-certificates.sh 2>/dev/null || true
echo -e "${GREEN}✅ Scripts configurados${NC}"

# 5. Verificar Docker Compose
echo ""
echo -e "${GREEN}🐳 Verificando Docker Compose...${NC}"
if ! docker compose version > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker Compose não encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose OK${NC}"

echo ""
echo -e "${GREEN}✅ Setup concluído!${NC}"
echo ""
echo -e "${BLUE}📖 Comandos disponíveis:${NC}"
echo "  ./add-custom-domain.sh <dominio>     - Adicionar novo domínio"
echo "  ./remove-custom-domain.sh <dominio>  - Remover domínio"
echo "  ./list-custom-domains.sh             - Listar certificados"
echo "  ./renew-all-certificates.sh          - Renovar certificados"
echo ""
echo -e "${BLUE}💡 Para adicionar um domínio personalizado:${NC}"
echo "  1. Peça ao cliente para configurar o DNS (A ou CNAME) apontando para este servidor"
echo "  2. Execute: ./add-custom-domain.sh parivahansewa.com"
echo "  3. O SSL será gerado automaticamente"
echo ""
