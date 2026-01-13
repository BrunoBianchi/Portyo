# Portyo Deployment Guide

This guide explains how to deploy the Portyo application to a DigitalOcean VPS running Ubuntu.

## Prerequisites

1.  **DigitalOcean Droplet**: Create a new Droplet with an Ubuntu image (22.04 LTS or 24.04 LTS recommended).
2.  **Domain Name**: Buy a domain (e.g., `portyo.com`).
3.  **DNS Records**:
    *   Create an **A Record** for `@` (root) pointing to your Droplet's IP.
    *   Create a **CNAME Record** (or A Record) for `*` (wildcard) pointing to your Droplet's IP (or `@`).
    *   This ensures `anything.portyo.com` reaches your server.

## Installation Steps

### 1. Push Changes
Ensure this `deployment` folder and all the new files (`Dockerfile`, `docker-compose.yml`, etc.) are committed and pushed to your git repository.

### 2. Access your VPS
SSH into your server:
```bash
ssh root@your_droplet_ip
```

### 3. Bootstrap the Installation
Run the following commands to install Git, clone your repository, and start the setup script.

```bash
# Update and install Git
sudo apt update
sudo apt install -y git

# Clone your repository (Replace URL with your actual repo URL)
# If your repo is private, you may need to use a Personal Access Token or generate an SSH key on the VPS first.
git clone https://github.com/yourusername/portyo.git /var/www/portyo

# Enter the directory
cd /var/www/portyo/deployment

# Make the script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

### 4. Follow the Script Prompts
The script will:
*   Install Docker and Docker Compose.
*   Ask for your **Domain Name** (to configure Nginx and environment variables).
*   Generate secure passwords.
*   **Automatically generate SSL certificates** using Let's Encrypt (Certbot).
*   Start the application.

### 5. Finalize Configuration
After the script finishes, the app should be running with HTTPS enabled.

1.  Edit the `.env` file to add your API keys:
    ```bash
    nano /var/www/portyo/deployment/.env
    ```
2.  Fill in `STRIPE_SECRET_KEY`, `MAILGUN_API_KEY`, etc.
3.  Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).
4.  Restart the backend to apply changes:
    ```bash
    docker compose restart backend
    ```

## HTTPS & Certificates
The setup script uses `init-letsencrypt.sh` to automatically obtain SSL certificates for your domain and subdomains.
*   Certificates are stored in `deployment/data/certbot`.
*   The `certbot` container checks for renewal every 12 hours.


## Troubleshooting
*   **View Logs**: `docker compose logs -f`
*   **Restart All**: `docker compose down && docker compose up -d`
