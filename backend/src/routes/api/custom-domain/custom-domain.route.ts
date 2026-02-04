import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { isUserPro } from "../../../middlewares/user-pro.middleware";
import { requireAdmin } from "../../../middlewares/admin.middleware";
import { CustomDomainService } from "../../../shared/services/custom-domain.service";
import { logger } from "../../../shared/utils/logger";
import { CustomDomainStatus } from "../../../database/entity/custom-domain-entity";

const router = Router();

/**
 * GET /api/custom-domains
 * Lista todos os domínios personalizados do usuário logado
 */
router.get("/", requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Não autenticado" });
        }

        const domains = await CustomDomainService.listUserDomains(userId);
        
        res.json({
            success: true,
            domains: domains.map(d => ({
                id: d.id,
                domain: d.domain,
                status: d.status,
                sslActive: d.sslActive,
                sslExpiresAt: d.sslExpiresAt,
                dnsVerifiedAt: d.dnsVerifiedAt,
                activatedAt: d.activatedAt,
                isHealthy: d.isHealthy,
                bioId: d.bioId,
                createdAt: d.createdAt,
                errorMessage: d.errorMessage
            }))
        });
    } catch (error) {
        logger.error("Erro ao listar domínios:", error);
        res.status(500).json({ message: "Erro interno ao listar domínios" });
    }
});

/**
 * POST /api/custom-domains
 * Adiciona um novo domínio personalizado
 * Requer plano Pro
 */
router.post("/", requireAuth, isUserPro, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Não autenticado" });
        }

        const { domain, bioId } = req.body;

        if (!domain || !bioId) {
            return res.status(400).json({ 
                message: "Domínio e Bio ID são obrigatórios" 
            });
        }

        // Valida o domínio primeiro
        const validation = await CustomDomainService.validateDomain(domain);
        if (!validation.valid) {
            return res.status(400).json({ 
                message: validation.message 
            });
        }

        // Adiciona o domínio
        const result = await CustomDomainService.addDomain(domain, bioId, userId);

        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        res.status(201).json({
            success: true,
            message: result.message,
            domain: {
                id: result.domain!.id,
                domain: result.domain!.domain,
                status: result.domain!.status,
                verificationToken: result.domain!.verificationToken
            },
            instructions: {
                dns: `Configure um registro DNS A apontando ${domain} para o IP do servidor`,
                cname: `Ou configure um CNAME apontando www.${domain} para portyo.me`
            }
        });
    } catch (error) {
        logger.error("Erro ao adicionar domínio:", error);
        res.status(500).json({ message: "Erro interno ao adicionar domínio" });
    }
});

/**
 * GET /api/custom-domains/check
 * Verifica o status de um domínio sem adicionar
 */
router.get("/check", async (req, res) => {
    try {
        const { domain } = req.query;
        
        if (!domain || typeof domain !== 'string') {
            return res.status(400).json({ message: "Domínio é obrigatório" });
        }

        const dnsCheck = await CustomDomainService.checkDnsConfiguration(domain);
        const existing = await CustomDomainService.findByDomain(domain);

        res.json({
            success: true,
            domain,
            available: !existing,
            dnsConfigured: dnsCheck.configured,
            dnsDetails: {
                actualIp: dnsCheck.actualIp,
                expectedIp: dnsCheck.expectedIp,
                message: dnsCheck.message
            },
            existingDomain: existing ? {
                status: existing.status,
                sslActive: existing.sslActive
            } : null
        });
    } catch (error) {
        logger.error("Erro ao verificar domínio:", error);
        res.status(500).json({ message: "Erro interno ao verificar domínio" });
    }
});

/**
 * GET /api/custom-domains/:id
 * Obtém detalhes de um domínio específico
 */
router.get("/:id", requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ message: "Não autenticado" });
        }

        const domains = await CustomDomainService.listUserDomains(userId);
        const domain = domains.find(d => d.id === id);

        if (!domain) {
            return res.status(404).json({ message: "Domínio não encontrado" });
        }

        res.json({
            success: true,
            domain: {
                id: domain.id,
                domain: domain.domain,
                status: domain.status,
                sslActive: domain.sslActive,
                sslExpiresAt: domain.sslExpiresAt,
                sslCertificatePath: domain.sslCertificatePath,
                dnsVerifiedAt: domain.dnsVerifiedAt,
                actualDnsValue: domain.actualDnsValue,
                activatedAt: domain.activatedAt,
                isHealthy: domain.isHealthy,
                lastHealthCheckAt: domain.lastHealthCheckAt,
                retryCount: domain.retryCount,
                errorMessage: domain.errorMessage,
                bioId: domain.bioId,
                createdAt: domain.createdAt,
                updatedAt: domain.updatedAt
            }
        });
    } catch (error) {
        logger.error("Erro ao obter detalhes do domínio:", error);
        res.status(500).json({ message: "Erro interno" });
    }
});

/**
 * POST /api/custom-domains/:id/verify
 * Força uma nova verificação do domínio
 */
router.post("/:id/verify", requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ message: "Não autenticado" });
        }

        const domains = await CustomDomainService.listUserDomains(userId);
        const domain = domains.find(d => d.id === id);

        if (!domain) {
            return res.status(404).json({ message: "Domínio não encontrado" });
        }

        // Inicia verificação em background
        CustomDomainService.processDomainVerification(domain.id).catch(error => {
            logger.error(`Erro ao reprocessar verificação do domínio ${domain.domain}:`, error);
        });

        res.json({
            success: true,
            message: "Verificação iniciada. Isso pode levar alguns minutos."
        });
    } catch (error) {
        logger.error("Erro ao verificar domínio:", error);
        res.status(500).json({ message: "Erro interno" });
    }
});

/**
 * DELETE /api/custom-domains/:id
 * Remove um domínio personalizado
 */
router.delete("/:id", requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ message: "Não autenticado" });
        }

        const result = await CustomDomainService.removeDomain(id, userId);

        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        logger.error("Erro ao remover domínio:", error);
        res.status(500).json({ message: "Erro interno ao remover domínio" });
    }
});

/**
 * GET /api/custom-domains/admin/all
 * Lista todos os domínios (apenas admin)
 */
router.get("/admin/all", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        const domains = await CustomDomainService.listAllDomains(
            status as CustomDomainStatus | undefined
        );

        res.json({
            success: true,
            count: domains.length,
            domains: domains.map(d => ({
                id: d.id,
                domain: d.domain,
                status: d.status,
                userId: d.userId,
                bioId: d.bioId,
                sslActive: d.sslActive,
                isHealthy: d.isHealthy
            }))
        });
    } catch (error) {
        logger.error("Erro ao listar todos os domínios:", error);
        res.status(500).json({ message: "Erro interno" });
    }
});

export default router;
