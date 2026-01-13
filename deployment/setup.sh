#!/bin/bash

# Portyo VPS Setup Script

set -e

echo "=========================================="
echo "   Portyo VPS Deployment Script"
echo "=========================================="

# 1. Update System
echo "[1/7] Updating system packages..."
sudo apt-get update > /dev/null
# Avoiding full upgrade to prevent interactive prompts in some cases, or handle DEBIAN_FRONTEND=noninteractive
# sudo apt-get upgrade -y

# 2. Install Docker
if ! command -v docker &> /dev/null; then
    echo "[2/7] Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    echo "[2/7] Docker already installed."
fi

# 3. Install Docker Compose
echo "[3/7] Ensuring Docker Compose works..."
sudo apt-get install -y docker-compose-plugin > /dev/null 2>&1 || true

# 4. Install Git
echo "[4/7] Installing Git..."
sudo apt-get install -y git > /dev/null

# 5. Application Setup
APP_DIR="/var/www/portyo"
echo "[5/7] Setting up application in $APP_DIR..."

if [ -d "$APP_DIR" ]; then
    echo "Directory exists."
    read -p "Do you want to pull the latest changes? (y/n): " PULL_CONFIRM
    if [ "$PULL_CONFIRM" = "y" ]; then
        cd $APP_DIR
        git pull
    else
        cd $APP_DIR
    fi
else
    read -p "Enter your Git Repository URL: " REPO_URL
    # Check if we need to authenticate (simple check if SSH or HTTPS)
    # If the user provides an HTTPS URL effectively, they might need to input credentials if it's private.
    # To handle private repos, the user can use a token in the URL: https://oauth2:TOKEN@github.com/...
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# 6. Configuration
echo "[6/7] Configuring environment..."
cd deployment

if [ -f .env ]; then
    export $(cat .env | xargs)
    # Extract DOMAIN_NAME if needed or just rely on the env if the variable matches. 
    # However, our .env usually doesn't have DOMAIN_NAME explicit variable unless we put it there. 
    # We replaced portyo.me in the files. 
    # Let's try to verify if we can extract it or just rely on the user knowing it. 
    # Actually, the simplest way is to read it from the .env if we stored it, but we only did text replacement.
    # We can try to grep it from nginx.conf which is reliable.
    DOMAIN_NAME=$(grep "server_name" nginx.conf | head -n 1 | awk '{print $2}' | sed 's/portyo.me//' | sed 's/www.//' | sed 's/;//' | sed 's/ //g')
    # Use fallback if grep fails
    if [ -z "$DOMAIN_NAME" ]; then DOMAIN_NAME="portyo.me"; fi
fi

if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file."

    # Generate random secrets
    # DB Password
    DB_PASS=$(openssl rand -hex 12)
    sed -i "s/generated_secure_password/$DB_PASS/g" .env
    
    # Session Secret
    SESSION_SEC=$(openssl rand -hex 24)
    sed -i "s/change_me_to_something_random/$SESSION_SEC/g" .env
    
    # JWT Secret
    JWT_SEC=$(openssl rand -hex 32)
    sed -i "s/change_me_to_at_least_32_chars_random_string/$JWT_SEC/g" .env

    # Domain Name
    read -p "Enter your domain name (e.g. portyo.com): " DOMAIN_NAME
    
    # Update .env
    sed -i "s/portyo.me/$DOMAIN_NAME/g" .env
    
    # Update nginx.conf
    # We use a temp file to avoid issues with sed and specialized chars if any, but simple domain matching is safe
    sed -i "s/portyo.me/$DOMAIN_NAME/g" nginx.conf

    # Update init-letsencrypt.sh
    sed -i "s/portyo.me/$DOMAIN_NAME/g" init-letsencrypt.sh
    # We replaced portyo.me with the domain, so the array is now (domain www.domain api.domain) which is correct.
    # We do NOT want to inject *.$DOMAIN for webroot validation.
    # sed -i "s/domains=(/domains=($DOMAIN_NAME *.$DOMAIN_NAME /g" init-letsencrypt.sh
    
    echo "Secrets generated vs Domain updated."
    echo "IMPORTANT: You may need to edit deployment/.env manually to set Stripe and Email keys."
    read -p "Press Enter to continue (or Ctrl+C to stop and edit manually)..."
fi

# 7. Start Services and SSL
echo "[7/7] Starting Docker containers and initializing SSL..."
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh


echo "=========================================="
echo "   Deployment Complete!"
echo "   Frontend: http://$DOMAIN_NAME"
echo "   Backend:  http://api.$DOMAIN_NAME"
echo "=========================================="
