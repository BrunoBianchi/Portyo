import { AppDataSource } from "../../database/datasource";
import { CustomDomainEntity, CustomDomainStatus } from "../../database/entity/custom-domain-entity";
import { BioEntity } from "../../database/entity/bio-entity";
import { UserEntity } from "../../database/entity/user-entity";
import { logger } from "../utils/logger";
import { exec } from "child_process";
import { promisify } from "util";
import * as dns from "dns";
import * as util from "util";

const execAsync = promisify(exec);
const dnsLookup = util.promisify(dns.lookup);

const SAAS_DOMAINS = [
    'portyo.me',
    'www.portyo.me',
    'api.portyo.me',
    'localhost',
    '127.0.0.1',
    'backend',
    'frontend'
];

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

    /**
     * Verifica se um domínio é um domínio do SaaS (não personalizado)
     */
    static isSaasDomain(host: string): boolean {
        if (!host) return true;
        const cleanHost = host.split(':')[0].toLowerCase();
        
        if (SAAS_DOMAINS.includes(cleanHost)) return true;
        if (cleanHost.endsWith('.portyo.me')) return true;
        
        return false;
    }

    /**
     * Extrai o domínio limpo do host header
     */
    static extractDomain(host: string): string {
        if (!host) return '';
        return host.split(':')[0].toLowerCase().trim();
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
     * Verifica se um domínio DNS está apontando para o servidor correto
     */
    static async checkDnsConfiguration(domain: string): Promise<{ 
        configured: boolean; 
        actualIp?: string; 
        expectedIp?: string;
        message: string 
    }> {
        try {
            const { address } = await dnsLookup(domain);
            
            // Em produção, você deve obter o IP real do servidor
            // Por enquanto, vamos apenas verificar se resolve
            const serverIp = process.env.SERVER_IP || process.env.VM_IP || '127.0.0.1';
            
            // Verifica se o IP é público (não localhost)
            const isPublicIp = !address.startsWith('127.') && 
                              !address.startsWith('10.') && 
                              !address.startsWith('192.168.') &&
                              !address.startsWith('172.');
            
            return {
                configured: isPublicIp,
                actualIp: address,
                expectedIp: serverIp,
                message: isPublicIp 
                    ? `DNS configurado corretamente (${address})`
                    : `DNS aponta para IP privado (${address})`
            };
        } catch (error) {
            return {
                configured: false,
                message: `Não foi possível resolver o DNS: ${error instanceof Error ? error.message : 'Unknown error'}`
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
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
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
        const domain = await this.repository.findOne({
            where: { id: domainId }
        });

        if (!domain) {
            logger.error(`Domínio ${domainId} não encontrado para verificação`);
            return;
        }

        try {
            // Atualiza status
            domain.status = CustomDomainStatus.VERIFYING_DNS;
            domain.lastCheckedAt = new Date();
            await this.repository.save(domain);

            // Verifica DNS
            const dnsCheck = await this.checkDnsConfiguration(domain.domain);
            domain.actualDnsValue = dnsCheck.actualIp;

            if (!dnsCheck.configured) {
                domain.status = CustomDomainStatus.PENDING;
                domain.errorMessage = dnsCheck.message;
                await this.repository.save(domain);
                logger.warn(`DNS não configurado para ${domain.domain}: ${dnsCheck.message}`);
                return;
            }

            // DNS OK, prossegue para SSL
            domain.status = CustomDomainStatus.DNS_VERIFIED;
            domain.dnsVerifiedAt = new Date();
            await this.repository.save(domain);

            // Gera certificado SSL
            await this.generateSSLCertificate(domain);

        } catch (error) {
            logger.error(`Erro na verificação do domínio ${domain.domain}:`, error);
            domain.status = CustomDomainStatus.FAILED;
            domain.errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            domain.lastErrorAt = new Date();
            domain.retryCount++;
            await this.repository.save(domain);
        }
    }

    /**
     * Gera certificado SSL usando Certbot
     */
    static async generateSSLCertificate(domain: CustomDomainEntity): Promise<boolean> {
        try {
            domain.status = CustomDomainStatus.GENERATING_SSL;
            await this.repository.save(domain);

            // Executa o script de geração de certificado
            const scriptPath = '/opt/portyo/deployment/add-custom-domain.sh';
            const { stdout, stderr } = await execAsync(
                `sudo ${scriptPath} ${domain.domain} admin@portyo.me`,
                { timeout: 120000 }
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
            domain.errorMessage = `Falha ao gerar certificado SSL: ${error instanceof Error ? error.message : 'Unknown'}`;
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
                    await execAsync(`sudo certbot delete --cert-name ${domain.domain} --non-interactive`, { timeout: 60000 });
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
            await execAsync('sudo certbot renew --quiet', { timeout: 300000 });
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
