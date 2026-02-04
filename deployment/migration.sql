-- ============================================
-- Migração SQL para Domínios Personalizados
-- Execute este script no PostgreSQL se não usar TypeORM migrations
-- ============================================

-- Criar enum de status se PostgreSQL < 12
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'custom_domain_status') THEN
        CREATE TYPE custom_domain_status AS ENUM (
            'pending', 
            'verifying_dns', 
            'dns_verified', 
            'generating_ssl', 
            'active', 
            'failed', 
            'expired', 
            'suspended'
        );
    END IF;
END$$;

-- Criar tabela de domínios personalizados
CREATE TABLE IF NOT EXISTS custom_domain_entity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain VARCHAR NOT NULL UNIQUE,
    bio_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'pending',
    error_message VARCHAR,
    expected_dns_value VARCHAR,
    dns_verified_at TIMESTAMP,
    actual_dns_value VARCHAR,
    ssl_active BOOLEAN NOT NULL DEFAULT false,
    ssl_expires_at TIMESTAMP,
    ssl_certificate_path VARCHAR,
    ssl_private_key_path VARCHAR,
    last_checked_at TIMESTAMP,
    activated_at TIMESTAMP,
    retry_count INT NOT NULL DEFAULT 0,
    last_error_at TIMESTAMP,
    redirect_www BOOLEAN NOT NULL DEFAULT true,
    force_https BOOLEAN NOT NULL DEFAULT false,
    redirect_to VARCHAR,
    verification_token VARCHAR,
    last_health_check_at TIMESTAMP,
    is_healthy BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_custom_domain_domain ON custom_domain_entity(domain);
CREATE INDEX IF NOT EXISTS idx_custom_domain_bio ON custom_domain_entity(bio_id);
CREATE INDEX IF NOT EXISTS idx_custom_domain_user ON custom_domain_entity(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_domain_status ON custom_domain_entity(status);

-- Criar chaves estrangeiras
ALTER TABLE custom_domain_entity 
    DROP CONSTRAINT IF EXISTS fk_custom_domain_bio,
    ADD CONSTRAINT fk_custom_domain_bio 
    FOREIGN KEY (bio_id) REFERENCES bio_entity(id) ON DELETE CASCADE;

ALTER TABLE custom_domain_entity 
    DROP CONSTRAINT IF EXISTS fk_custom_domain_user,
    ADD CONSTRAINT fk_custom_domain_user 
    FOREIGN KEY (user_id) REFERENCES user_entity(id) ON DELETE CASCADE;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_custom_domain_updated_at ON custom_domain_entity;
CREATE TRIGGER update_custom_domain_updated_at
    BEFORE UPDATE ON custom_domain_entity
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Dados iniciais (opcional)
-- ============================================

-- Comentários sobre a tabela
COMMENT ON TABLE custom_domain_entity IS 'Domínios personalizados dos usuários';
COMMENT ON COLUMN custom_domain_entity.domain IS 'Domínio personalizado (ex: parivahansewa.com)';
COMMENT ON COLUMN custom_domain_entity.status IS 'Status atual: pending, verifying_dns, dns_verified, generating_ssl, active, failed, expired, suspended';
COMMENT ON COLUMN custom_domain_entity.ssl_active IS 'Indica se o certificado SSL está ativo e válido';
COMMENT ON COLUMN custom_domain_entity.is_healthy IS 'Resultado da última verificação de saúde do domínio';
