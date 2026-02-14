import { AppDataSource } from "../../database/datasource";
import { CustomDomainEntity, CustomDomainStatus } from "../../database/entity/custom-domain-entity";
import { BioEntity } from "../../database/entity/bio-entity";
import { UserEntity } from "../../database/entity/user-entity";
import { logger } from "../utils/logger";
import redisClient from "../../config/redis.client";
import { env } from "../../config/env";
import { exec } from "child_process";
import { promisify } from "util";
import * as dns from "dns";
import * as util from "util";
import * as fs from "fs";
import * as path from "path";
import { In } from "typeorm";

const execAsync = promisify(exec);
const dnsLookup = util.promisify(dns.lookup);
const dnsResolve4 = util.promisify(dns.resolve4);
const dnsResolveCname = util.promisify(dns.resolveCname);

const CUSTOM_DOMAIN_DNS_QUEUE_KEY = "custom-domain:dns-queue";
const CUSTOM_DOMAIN_DNS_QUEUE_LOCK_PREFIX = "custom-domain:dns-lock";
const CUSTOM_DOMAIN_VERIFY_LOCK_PREFIX = "custom-domain:verify-lock";
const CUSTOM_DOMAIN_DNS_QUEUE_BATCH = 10;

const isLocalhostDomain = (value: string) => {
    const clean = value.toLowerCase();
    return clean === "localhost" || clean.endsWith(".localhost");
};

const SAAS_BASE_DOMAIN = env.SAAS_BASE_DOMAIN.toLowerCase();
const COMPANY_SUBDOMAIN = env.COMPANY_SUBDOMAIN.toLowerCase();
const CUSTOM_DOMAIN_CNAME_TARGET = env.CUSTOM_DOMAIN_CNAME_TARGET.toLowerCase();
const CUSTOM_DOMAIN_REQUIRE_CNAME_ONLY = env.CUSTOM_DOMAIN_REQUIRE_CNAME_ONLY;

const SAAS_DOMAINS = [
    SAAS_BASE_DOMAIN,
    `www.${SAAS_BASE_DOMAIN}`,
    `api.${SAAS_BASE_DOMAIN}`,
    COMPANY_SUBDOMAIN,
    'localhost',
    '127.0.0.1',
    'backend',
    'frontend'
];

const IPV4_REGEX = /^(?:\d{1,3}\.){3}\d{1,3}$/;

export interface CustomDomainCheck {
    domain: string;
    isValid: boolean;
    dnsConfigured: boolean;
    pointsToServer: boolean;
    sslActive: boolean;
    status: CustomDomainStatus;
    message: string;
}

export class CustomDomainService {
    private static repository = AppDataSource.getRepository(CustomDomainEntity);
    private static bioRepository = AppDataSource.getRepository(BioEntity);
    private static hasSudo: boolean | null = null;

    private static isIpAddress(host: string): boolean {
        const clean = host.trim().toLowerCase();
        if (!clean) return false;
        if (IPV4_REGEX.test(clean)) {
            return clean.split(".").every((part) => Number(part) >= 0 && Number(part) <= 255);
        }
        return clean.includes(":");
    }

    private static getBackendHost(): string | null {
        try {
            if (!env.BACKEND_URL) return null;
            const parsed = new URL(env.BACKEND_URL);
            return parsed.hostname.toLowerCase();
        } catch {
            return null;
        }
    }

    private static async canUseSudo(): Promise<boolean> {
        if (this.hasSudo !== null) {
            return this.hasSudo;
        }

        try {
            await execAsync("command -v sudo", { timeout: 5000 });
            this.hasSudo = true;
        } catch {
            this.hasSudo = false;
            logger.warn("[CustomDomain] sudo not found; privileged commands will run without sudo");
        }

        return this.hasSudo;
    }

    private static async runPrivileged(command: string, timeout: number): Promise<{ stdout: string; stderr: string }> {
        return this.runPrivilegedWithOptions(command, timeout);
    }

    private static async runPrivilegedWithOptions(
        command: string,
        timeout: number,
        cwd?: string
    ): Promise<{ stdout: string; stderr: string }> {
        const useSudo = await this.canUseSudo();
        const finalCommand = useSudo ? `sudo ${command}` : command;

        try {
            return await execAsync(finalCommand, { timeout, cwd });
        } catch (error: any) {
            const rawMessage = String(error?.message || "");
            const stderr = String(error?.stderr || "");
            const sudoFailure = /sudo:\s*not found|sudo:\s*a password is required|sudo:\s*permission denied/i.test(
                `${rawMessage}\n${stderr}`
            );

            if (useSudo && sudoFailure) {
                this.hasSudo = false;
                logger.warn("[CustomDomain] sudo failed at runtime; retrying privileged command without sudo");
                return execAsync(command, { timeout, cwd });
            }

            throw error;
        }
    }

    private static shellEscape(value: string): string {
        return `'${value.replace(/'/g, `'"'"'`)}'`;
    }

    private static resolveDeploymentDir(): string | null {
        const candidates = [
            process.env.CUSTOM_DOMAIN_DEPLOYMENT_DIR,
            path.resolve(process.cwd(), "deployment"),
            path.resolve(process.cwd(), "..", "deployment"),
            path.resolve(__dirname, "../../../../deployment"),
            "/var/www/portyo/deployment",
            "/opt/portyo/deployment",
        ].filter((value): value is string => Boolean(value));

        for (const candidate of candidates) {
            const normalized = path.resolve(candidate);
            const composePath = path.join(normalized, "docker-compose.yml");
            const addScriptPath = path.join(normalized, "add-custom-domain.sh");

            if (fs.existsSync(composePath) && fs.existsSync(addScriptPath)) {
                return normalized;
            }
        }

        return null;
    }

    private static resolveScriptPath(deploymentDir: string, scriptName: string, overridePath?: string): string | null {
        const candidates = [overridePath, path.join(deploymentDir, scriptName)].filter(
            (value): value is string => Boolean(value)
        );

        for (const candidate of candidates) {
            const normalized = path.resolve(candidate);
            if (fs.existsSync(normalized)) {
                return normalized;
            }
        }

        return null;
    }

    /**
     * Verifica se um domínio é um domínio do SaaS (não personalizado)
     */
    static isSaasDomain(host: string): boolean {
        if (!host) return true;
        const cleanHost = host.split(':')[0].toLowerCase();

        if (this.isIpAddress(cleanHost)) return true;
        
        if (SAAS_DOMAINS.includes(cleanHost)) return true;
        if (cleanHost.endsWith(`.${SAAS_BASE_DOMAIN}`)) return true;

        const backendHost = this.getBackendHost();
        if (backendHost && cleanHost === backendHost) return true;
        
        return false;
    }

    /**
     * Extrai o domínio limpo do host header
     */
    static extractDomain(host: string): string {
        if (!host) return '';
        const trimmed = host.trim().toLowerCase();
        const withoutProtocol = trimmed.replace(/^https?:\/\//, "");
        const withoutPath = withoutProtocol.split("/")[0];

        let withoutPort = withoutPath;
        if (withoutPath.startsWith("[")) {
            const bracketEnd = withoutPath.indexOf("]");
            withoutPort = bracketEnd >= 0 ? withoutPath.slice(1, bracketEnd) : withoutPath;
        } else {
            withoutPort = withoutPath.split(":")[0].trim();
        }

        return withoutPort.replace(/\.$/, "");
    }

    /**
     * Busca um domínio personalizado pelo nome
     */
    static async findByDomain(domain: string): Promise<CustomDomainEntity | null> {
        const cleanDomain = this.extractDomain(domain);
        return this.repository.findOne({
            where: { domain: cleanDomain },
            relations: ['bio', 'user']
        });
    }

    /**
     * Busca um domínio personalizado ativo pelo nome
     */
    static async findActiveByDomain(domain: string): Promise<CustomDomainEntity | null> {
        const cleanDomain = this.extractDomain(domain);
        return this.repository.findOne({
            where: { 
                domain: cleanDomain,
                status: CustomDomainStatus.ACTIVE,
                sslActive: true
            },
            relations: ['bio', 'user']
        });
    }

    /**
     * Busca todos os domínios personalizados de uma bio
     */
    static async findDomainsByBioId(bioId: string): Promise<CustomDomainEntity[]> {
        return this.repository.find({
            where: { bioId }
        });
    }

    /**
     * Busca domínios ativos de uma bio (prontos para uso público)
     */
    static async findActiveDomainsByBioId(bioId: string): Promise<CustomDomainEntity[]> {
        return this.repository.find({
            where: {
                bioId,
                status: CustomDomainStatus.ACTIVE,
                sslActive: true
            }
        });
    }

    /**
     * Extrai o sufix de um subdomínio do SaaS (ex: user.portyo.me => user)
     */
    static extractSaasSubdomain(host: string): string | null {
        const cleanHost = this.extractDomain(host);
        if (!cleanHost) return null;
        if (SAAS_DOMAINS.includes(cleanHost)) return null;
        const saasSuffix = `.${SAAS_BASE_DOMAIN}`;
        if (!cleanHost.endsWith(saasSuffix)) return null;

        const sub = cleanHost.slice(0, cleanHost.length - saasSuffix.length);
        if (!sub || sub.includes('.')) return null;
        return sub;
    }

    /**
     * Retorna o domínio do SaaS para um sufix (ex: user => user.portyo.me)
     */
    static getSaasSubdomainDomain(sufix: string): string {
        return `${sufix}.${SAAS_BASE_DOMAIN}`;
    }

    /**
     * Verifica se um domínio DNS está apontando para o servidor correto
     */
    static async checkDnsConfiguration(domain: string): Promise<{ 
        configured: boolean; 
        actualIp?: string; 
        expectedIp?: string;
        message: string 
    }> {
        try {
            const cnameTarget = CUSTOM_DOMAIN_CNAME_TARGET;

            const [domainIps, cnameIps, cnames] = await Promise.all([
                dnsResolve4(domain).catch(() => [] as string[]),
                dnsResolve4(cnameTarget).catch(() => [] as string[]),
                dnsResolveCname(domain).catch(() => [] as string[])
            ]);

            logger.info(`[CustomDomain][DNS] ${domain} -> CNAMEs: ${cnames.join(", ") || "(none)"}; A: ${domainIps.join(", ") || "(none)"}; ${cnameTarget} A: ${cnameIps.join(", ") || "(none)"}`);

            const hasValidCname = cnames.some((value) =>
                value.toLowerCase().replace(/\.$/, "") === cnameTarget
            );

            if (hasValidCname) {
                return {
                    configured: true,
                    actualIp: domainIps.join(", ") || undefined,
                    expectedIp: cnameIps.join(", ") || undefined,
                    message: `CNAME configurado corretamente (${cnameTarget})`
                };
            }

            if (!CUSTOM_DOMAIN_REQUIRE_CNAME_ONLY) {
                const expectedIps = new Set(cnameIps);
                const matchingIp = domainIps.find((ip) => expectedIps.has(ip));

                if (matchingIp) {
                    return {
                        configured: true,
                        actualIp: matchingIp,
                        expectedIp: cnameIps.join(", ") || undefined,
                        message: `DNS configurado por A record compatível com ${cnameTarget} (${matchingIp})`
                    };
                }
            }

            return {
                configured: false,
                actualIp: domainIps.join(', ') || undefined,
                expectedIp: cnameTarget,
                message: `DNS inválido: configure um registro CNAME de ${domain} para ${cnameTarget}.`
            };
        } catch (error) {
            logger.error(`[CustomDomain][DNS] Falha na resolução para ${domain}:`, error);
            return {
                configured: false,
                message: `Não foi possível resolver o DNS. Verifique se o CNAME aponta para ${CUSTOM_DOMAIN_CNAME_TARGET}.`
            };
        }
    }

    /**
     * Valida um domínio antes de adicionar
     */
    static async validateDomain(domain: string): Promise<{ valid: boolean; message: string }> {
        const cleanDomain = this.extractDomain(domain);
        
        // Verifica se é um domínio do SaaS
        if (this.isSaasDomain(cleanDomain)) {
            return { valid: false, message: 'Este domínio não pode ser usado como domínio personalizado' };
        }

        // Valida formato do domínio
        const domainRegex = /^(?=.{1,253}$)(?!-)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
        if (!domainRegex.test(cleanDomain)) {
            return { valid: false, message: 'Formato de domínio inválido' };
        }

        // Verifica se já existe
        const existing = await this.findByDomain(cleanDomain);
        if (existing) {
            return { valid: false, message: 'Este domínio já está registrado' };
        }

        return { valid: true, message: 'Domínio válido' };
    }

    /**
     * Adiciona um novo domínio personalizado
     */
    static async addDomain(
        domain: string, 
        bioId: string, 
        userId: string
    ): Promise<{ success: boolean; domain?: CustomDomainEntity; message: string }> {
        try {
            // Valida o domínio
            const validation = await this.validateDomain(domain);
            if (!validation.valid) {
                return { success: false, message: validation.message };
            }

            // Verifica se o bio existe e pertence ao usuário
            const bio = await this.bioRepository.findOne({
                where: { id: bioId, userId }
            });

            if (!bio) {
                return { success: false, message: 'Bio não encontrado' };
            }

            const cleanDomain = this.extractDomain(domain);
            
            // Cria o registro do domínio
            const customDomain = this.repository.create({
                domain: cleanDomain,
                bioId,
                userId,
                status: CustomDomainStatus.PENDING,
                verificationToken: this.generateVerificationToken()
            });

            await this.repository.save(customDomain);

            // Inicia o processo de verificação em background
            this.processDomainVerification(customDomain.id).catch(error => {
                logger.error(`Erro ao processar verificação do domínio ${cleanDomain}:`, error);
            });

            return { 
                success: true, 
                domain: customDomain, 
                message: 'Domínio adicionado com sucesso. Verificação DNS iniciada.' 
            };
        } catch (error) {
            logger.error('Erro ao adicionar domínio:', error);
            return { success: false, message: 'Erro interno ao adicionar domínio' };
        }
    }

    /**
     * Processa a verificação completa de um domínio (DNS + SSL)
     */
    static async processDomainVerification(domainId: string): Promise<void> {
        const verifyLockKey = `${CUSTOM_DOMAIN_VERIFY_LOCK_PREFIX}:${domainId}`;
        const lockAcquired = await redisClient.set(verifyLockKey, "1", "NX", "EX", 900);
        let domain: CustomDomainEntity | null = null;

        if (!lockAcquired) {
            logger.info(`[CustomDomain] Verificação já em andamento para ${domainId}, ignorando execução concorrente`);
            return;
        }

        try {
            domain = await this.repository.findOne({
                where: { id: domainId }
            });

            if (!domain) {
                logger.error(`Domínio ${domainId} não encontrado para verificação`);
                return;
            }

            // Atualiza status
            domain.status = CustomDomainStatus.VERIFYING_DNS;
            domain.lastCheckedAt = new Date();
            domain.errorMessage = undefined;
            await this.repository.save(domain);

            // Verifica DNS
            const dnsCheck = await this.checkDnsConfiguration(domain.domain);
            domain.actualDnsValue = dnsCheck.actualIp;

            if (!dnsCheck.configured) {
                domain.status = CustomDomainStatus.PENDING;
                domain.errorMessage = "Falha na verificação do domínio. Verifique o DNS e tente novamente.";
                await this.repository.save(domain);
                logger.warn(`DNS não configurado para ${domain.domain}: ${dnsCheck.message}`);
                return;
            }

            // DNS OK, prossegue para SSL
            domain.status = CustomDomainStatus.DNS_VERIFIED;
            domain.dnsVerifiedAt = new Date();
            domain.errorMessage = undefined;
            await this.repository.save(domain);

            // Gera certificado SSL
            await this.generateSSLCertificate(domain);

        } catch (error) {
            logger.error(`Erro na verificação do domínio ${domain?.domain ?? domainId}:`, error);
            if (domain) {
                domain.status = CustomDomainStatus.FAILED;
                domain.errorMessage = "Falha ao verificar o domínio. Tente novamente mais tarde.";
                domain.lastErrorAt = new Date();
                domain.retryCount++;
                await this.repository.save(domain);
            }
        } finally {
            await redisClient.del(verifyLockKey);
        }
    }

    /**
     * Gera certificado SSL usando Certbot
     */
    static async generateSSLCertificate(domain: CustomDomainEntity): Promise<boolean> {
        try {
            const isLocalEnv = process.env.NODE_ENV !== "production";
            if (isLocalEnv || isLocalhostDomain(domain.domain)) {
                domain.status = CustomDomainStatus.ACTIVE;
                domain.sslActive = false;
                domain.forceHttps = false;
                domain.activatedAt = new Date();
                domain.errorMessage = undefined;
                await this.repository.save(domain);
                logger.info(`SSL generation skipped in localhost/dev for ${domain.domain}`);
                return true;
            }

            domain.status = CustomDomainStatus.GENERATING_SSL;
            domain.errorMessage = undefined;
            await this.repository.save(domain);

            const deploymentDir = this.resolveDeploymentDir();
            if (!deploymentDir) {
                throw new Error(
                    "Diretório de deployment não encontrado. Configure CUSTOM_DOMAIN_DEPLOYMENT_DIR com o caminho correto (ex: /var/www/portyo/deployment)."
                );
            }

            const scriptPath = this.resolveScriptPath(
                deploymentDir,
                "add-custom-domain.sh",
                process.env.CUSTOM_DOMAIN_ADD_SCRIPT_PATH
            );

            if (!scriptPath) {
                throw new Error(
                    `Script add-custom-domain.sh não encontrado em ${deploymentDir}. Configure CUSTOM_DOMAIN_ADD_SCRIPT_PATH se necessário.`
                );
            }

            const { stdout, stderr } = await this.runPrivilegedWithOptions(
                `bash ${this.shellEscape(scriptPath)} ${this.shellEscape(domain.domain)} ${this.shellEscape(env.CUSTOM_DOMAIN_CERTBOT_EMAIL)}`,
                120000,
                deploymentDir
            );

            if (stderr && !stderr.includes('Certbot')) {
                logger.warn(`Certbot stderr for ${domain.domain}:`, stderr);
            }

            logger.info(`Certbot stdout for ${domain.domain}:`, stdout);

            // Verifica se o certificado foi gerado
            const certPath = `/etc/letsencrypt/live/${domain.domain}/fullchain.pem`;
            const keyPath = `/etc/letsencrypt/live/${domain.domain}/privkey.pem`;

            // Atualiza o domínio como ativo
            domain.status = CustomDomainStatus.ACTIVE;
            domain.sslActive = true;
            domain.sslCertificatePath = certPath;
            domain.sslPrivateKeyPath = keyPath;
            domain.sslExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 dias
            domain.activatedAt = new Date();
            domain.errorMessage = undefined;
            await this.repository.save(domain);

            // Atualiza o bio com o domínio personalizado
            await this.bioRepository.update(
                { id: domain.bioId },
                { customDomain: domain.domain }
            );

            logger.info(`Certificado SSL gerado com sucesso para ${domain.domain}`);
            return true;

        } catch (error) {
            logger.error(`Erro ao gerar certificado para ${domain.domain}:`, error);
            domain.status = CustomDomainStatus.FAILED;
            const rawMessage = error instanceof Error ? error.message : 'Unknown';

            const retryAfterMatch = rawMessage.match(/retry after\s+([0-9:\-\s]+UTC)/i);
            const retryAfterText = retryAfterMatch?.[1]?.trim();

            domain.errorMessage = retryAfterText
                ? `Falha ao gerar certificado SSL. Limite temporário da Let's Encrypt atingido. Tente novamente após ${retryAfterText}.`
                : "Falha ao gerar certificado SSL. Tente novamente mais tarde.";
            domain.lastErrorAt = new Date();
            domain.retryCount++;
            await this.repository.save(domain);
            return false;
        }
    }

    /**
     * Remove um domínio personalizado
     */
    static async removeDomain(domainId: string, userId: string): Promise<{ success: boolean; message: string }> {
        try {
            const domain = await this.repository.findOne({
                where: { id: domainId, userId }
            });

            if (!domain) {
                return { success: false, message: 'Domínio não encontrado' };
            }

            // Remove o domínio do bio
            await this.bioRepository.update(
                { id: domain.bioId },
                { customDomain: null }
            );

            // Remove o certificado SSL (opcional - pode manter para reutilização)
            if (domain.sslActive) {
                try {
                    const deploymentDir = this.resolveDeploymentDir();
                    const removeScriptPath = deploymentDir
                        ? this.resolveScriptPath(deploymentDir, "remove-custom-domain.sh")
                        : null;

                    if (deploymentDir && removeScriptPath) {
                        await this.runPrivilegedWithOptions(
                            `bash ${this.shellEscape(removeScriptPath)} ${this.shellEscape(domain.domain)}`,
                            120000,
                            deploymentDir
                        );
                    } else {
                        await this.runPrivileged(`certbot delete --cert-name ${domain.domain} --non-interactive`, 60000);
                    }
                } catch (error) {
                    logger.warn(`Erro ao remover certificado para ${domain.domain}:`, error);
                }
            }

            await this.repository.remove(domain);

            return { success: true, message: 'Domínio removido com sucesso' };
        } catch (error) {
            logger.error('Erro ao remover domínio:', error);
            return { success: false, message: 'Erro interno ao remover domínio' };
        }
    }

    /**
     * Lista todos os domínios de um usuário
     */
    static async listUserDomains(userId: string): Promise<CustomDomainEntity[]> {
        return this.repository.find({
            where: { userId },
            relations: ['bio'],
            order: { createdAt: 'DESC' }
        });
    }

    /**
     * Lista todos os domínios (para admin)
     */
    static async listAllDomains(status?: CustomDomainStatus): Promise<CustomDomainEntity[]> {
        const where: any = {};
        if (status) where.status = status;
        
        return this.repository.find({
            where,
            relations: ['bio', 'user'],
            order: { createdAt: 'DESC' }
        });
    }

    /**
     * Sincroniza status de domínio quando certificado já existe em disco,
     * evitando estado pendente/failed inconsistente no banco.
     */
    static async syncStatusFromCertificate(domain: CustomDomainEntity): Promise<boolean> {
        const certPath = `/etc/letsencrypt/live/${domain.domain}/fullchain.pem`;
        const keyPath = `/etc/letsencrypt/live/${domain.domain}/privkey.pem`;

        if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
            return false;
        }

        let updated = false;

        if (domain.status !== CustomDomainStatus.ACTIVE) {
            domain.status = CustomDomainStatus.ACTIVE;
            updated = true;
        }

        if (!domain.sslActive) {
            domain.sslActive = true;
            updated = true;
        }

        if (!domain.activatedAt) {
            domain.activatedAt = new Date();
            updated = true;
        }

        if (!domain.sslExpiresAt) {
            domain.sslExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
            updated = true;
        }

        if (domain.sslCertificatePath !== certPath) {
            domain.sslCertificatePath = certPath;
            updated = true;
        }

        if (domain.sslPrivateKeyPath !== keyPath) {
            domain.sslPrivateKeyPath = keyPath;
            updated = true;
        }

        if (domain.errorMessage) {
            domain.errorMessage = undefined;
            updated = true;
        }

        if (updated) {
            await this.repository.save(domain);
            await this.bioRepository.update(
                { id: domain.bioId },
                { customDomain: domain.domain }
            );
            logger.info(`[CustomDomain] Status sincronizado por certificado existente para ${domain.domain}`);
        }

        return updated;
    }

    /**
     * Verifica a saúde de todos os domínios ativos
     */
    static async checkAllDomainsHealth(): Promise<void> {
        const domains = await this.repository.find({
            where: { status: CustomDomainStatus.ACTIVE }
        });

        for (const domain of domains) {
            try {
                const dnsCheck = await this.checkDnsConfiguration(domain.domain);
                domain.isHealthy = dnsCheck.configured;
                domain.lastHealthCheckAt = new Date();
                await this.repository.save(domain);

                if (!dnsCheck.configured) {
                    logger.warn(`Domínio ${domain.domain} não está saudável: ${dnsCheck.message}`);
                }
            } catch (error) {
                domain.isHealthy = false;
                domain.lastHealthCheckAt = new Date();
                await this.repository.save(domain);
                logger.error(`Erro ao verificar saúde do domínio ${domain.domain}:`, error);
            }
        }
    }

    /**
     * Enfileira domínios pendentes para verificação DNS
     */
    static async enqueuePendingDomainsForDnsCheck(): Promise<number> {
        const pendingDomains = await this.repository.find({
            where: { status: In([CustomDomainStatus.PENDING, CustomDomainStatus.VERIFYING_DNS]) },
            select: ["id"]
        });

        let enqueued = 0;
        const score = Date.now();

        for (const domain of pendingDomains) {
            try {
                const added = await redisClient.zadd(
                    CUSTOM_DOMAIN_DNS_QUEUE_KEY,
                    "NX",
                    score,
                    domain.id
                );
                if (added) enqueued++;
            } catch (error) {
                logger.error(`Falha ao enfileirar verificação DNS para ${domain.id}:`, error);
            }
        }

        if (enqueued > 0) {
            logger.info(`[CustomDomain] Enfileirados ${enqueued} domínios para verificação DNS`);
        }

        return enqueued;
    }

    /**
     * Processa a fila de verificação DNS em paralelo via Redis
     */
    static async processDnsVerificationQueue(): Promise<void> {
        const now = Date.now();
        const domainIds: string[] = await redisClient.zrangebyscore(
            CUSTOM_DOMAIN_DNS_QUEUE_KEY,
            0,
            now,
            "LIMIT",
            0,
            CUSTOM_DOMAIN_DNS_QUEUE_BATCH
        );

        if (!domainIds.length) return;

        await Promise.all(domainIds.map(async (domainId) => {
            const lockKey = `${CUSTOM_DOMAIN_DNS_QUEUE_LOCK_PREFIX}:${domainId}`;
            const lockAcquired = await redisClient.set(lockKey, "1", "NX", "EX", 600);

            if (!lockAcquired) return;

            try {
                await redisClient.zrem(CUSTOM_DOMAIN_DNS_QUEUE_KEY, domainId);
                await this.processDomainVerification(domainId);
            } catch (error) {
                logger.error(`[CustomDomain] Erro ao processar DNS para ${domainId}:`, error);
            } finally {
                await redisClient.del(lockKey);
            }
        }));
    }

    /**
     * Renova certificados próximos do vencimento
     */
    static async renewExpiringCertificates(): Promise<void> {
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        const expiringDomains = await this.repository.find({
            where: {
                sslActive: true,
                sslExpiresAt: { $lt: thirtyDaysFromNow } as any
            }
        });

        logger.info(`${expiringDomains.length} certificados próximos do vencimento`);

        // O Certbot já renova automaticamente, mas podemos forçar uma verificação
        try {
            const deploymentDir = this.resolveDeploymentDir();
            const renewScriptPath = deploymentDir
                ? this.resolveScriptPath(deploymentDir, "renew-all-certificates.sh")
                : null;

            if (deploymentDir && renewScriptPath) {
                await this.runPrivilegedWithOptions(`bash ${this.shellEscape(renewScriptPath)}`, 300000, deploymentDir);
            } else {
                await this.runPrivileged('certbot renew --quiet', 300000);
            }
            logger.info('Renovação de certificados concluída');
        } catch (error) {
            logger.error('Erro ao renovar certificados:', error);
        }
    }

    /**
     * Gera um token de verificação único
     */
    private static generateVerificationToken(): string {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }
}
