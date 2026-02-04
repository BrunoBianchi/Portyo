#!/bin/bash

# ============================================
# Lista todos os certificados SSL instalados
# ============================================

DATA_PATH="./data/certbot"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 Certificados SSL Instalados:${NC}"
echo ""

if [ ! -d "$DATA_PATH/conf/live" ]; then
    echo -e "${YELLOW}⚠️  Nenhum certificado encontrado${NC}"
    exit 0
fi

for cert_dir in $DATA_PATH/conf/live/*/; do
    if [ -d "$cert_dir" ]; then
        domain=$(basename "$cert_dir")
        
        # Pular README
        if [ "$domain" = "README" ]; then
            continue
        fi
        
        cert_file="$cert_dir/fullchain.pem"
        
        if [ -f "$cert_file" ]; then
            # Obter informações do certificado
            subject=$(openssl x509 -in "$cert_file" -noout -subject 2>/dev/null | sed 's/subject= //' || echo "N/A")
            start_date=$(openssl x509 -in "$cert_file" -noout -startdate 2>/dev/null | cut -d= -f2 || echo "N/A")
            end_date=$(openssl x509 -in "$cert_file" -noout -enddate 2>/dev/null | cut -d= -f2 || echo "N/A")
            
            # Verificar se está válido
            if openssl x509 -checkend 86400 -noout -in "$cert_file" 2>/dev/null; then
                status="${GREEN}✅ Válido${NC}"
            else
                status="${YELLOW}⚠️  Expirado${NC}"
            fi
            
            echo -e "${BLUE}┌─ $domain${NC} $status"
            echo -e "${BLUE}│${NC}   Subject: $subject"
            echo -e "${BLUE}│${NC}   Válido de: $start_date"
            echo -e "${BLUE}│${NC}   Até: $end_date"
            echo ""
        fi
    fi
done
