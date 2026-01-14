#!/bin/bash

# Directory for certs
DATA_DIR="./data/db-certs"
mkdir -p "$DATA_DIR"

# Generate Root CA
if [ ! -f "$DATA_DIR/root.key" ]; then
    echo "Generating Root CA..."
    openssl req -new -x509 -days 3650 -nodes -text -out "$DATA_DIR/root.crt" \
      -keyout "$DATA_DIR/root.key" -subj "/CN=Portyo_Root_CA"
    chmod 600 "$DATA_DIR/root.key"
fi

# Generate Server Cert
if [ ! -f "$DATA_DIR/server.key" ]; then
    echo "Generating Server Certificate..."
    openssl req -new -nodes -text -out "$DATA_DIR/server.csr" \
      -keyout "$DATA_DIR/server.key" -subj "/CN=postgres"
    chmod 600 "$DATA_DIR/server.key"

    openssl x509 -req -in "$DATA_DIR/server.csr" -text -days 365 \
      -CA "$DATA_DIR/root.crt" -CAkey "$DATA_DIR/root.key" -CAcreateserial \
      -out "$DATA_DIR/server.crt"
fi

# Set permissions for Postgres (user 999 is default postgres user in alpine/debian images usually, 
# but 70, 999 or others might apply. 0600 is required by postgres for key files.
# We set owner to 999:999 (postgres:postgres) just in case, but since we map volume, UID matters.
# Docker processes often run as root to chown, but postgres container runs as postgres.
# We will rely on simple chmod for now, but user might need to chown on host.
echo "Setting permissions..."
chmod 600 "$DATA_DIR/server.key"
chmod 600 "$DATA_DIR/root.key"
chmod 644 "$DATA_DIR/server.crt"
chmod 644 "$DATA_DIR/root.crt"

# Set ownership to postgres user (uid 70 for alpine, 999 for debian).
# Since we use postgres:15-alpine, we use 70.
# We try to use chown, ignoring errors if user doesn't exist (using numeric IDs is safer).
echo "Setting ownership to 70:70 (postgres:postgres)..."
chown 70:70 "$DATA_DIR/server.key" || echo "Warning: Could not chown server.key"
chown 70:70 "$DATA_DIR/server.crt" || echo "Warning: Could not chown server.crt"
chown 70:70 "$DATA_DIR/root.key" || echo "Warning: Could not chown root.key"
chown 70:70 "$DATA_DIR/root.crt" || echo "Warning: Could not chown root.crt"

echo "Certificates generated in $DATA_DIR"
