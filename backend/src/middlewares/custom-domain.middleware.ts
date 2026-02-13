import { Request, Response, NextFunction } from "express";
import { isIP } from "node:net";
import { CustomDomainService } from "../shared/services/custom-domain.service";
import { CustomDomainEntity } from "../database/entity/custom-domain-entity";
import { logger } from "../shared/utils/logger";

const unknownDomainWarnCache = new Map<string, number>();
const UNKNOWN_DOMAIN_WARN_COOLDOWN_MS = 10 * 60 * 1000;

const shouldLogUnknownDomainWarn = (domain: string): boolean => {
    const now = Date.now();
    const lastLoggedAt = unknownDomainWarnCache.get(domain) || 0;

    if (now - lastLoggedAt < UNKNOWN_DOMAIN_WARN_COOLDOWN_MS) {
        return false;
    }

    unknownDomainWarnCache.set(domain, now);

    if (unknownDomainWarnCache.size > 5000) {
        const entries = [...unknownDomainWarnCache.entries()].sort((a, b) => a[1] - b[1]);
        for (const [oldKey] of entries.slice(0, 1000)) {
            unknownDomainWarnCache.delete(oldKey);
        }
    }

    return true;
};

// Extiende a interface Request do Express para incluir dados do domínio personalizado
declare global {
    namespace Express {
        interface Request {
            customDomain?: CustomDomainEntity;
            isCustomDomain?: boolean;
            targetBioId?: string;
            targetBioSlug?: string;
        }
    }
}

/**
 * Middleware para detectar e processar domínios personalizados
 * Deve ser usado antes das rotas de página para redirecionar corretamente
 */
export async function customDomainMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const host = req.headers.host || '';
        const domain = CustomDomainService.extractDomain(host);

        // Ignora IP direto (probes/healthchecks), deixando o fluxo normal seguir
        if (!domain || isIP(domain) !== 0) {
            return next();
        }

        // Verifica se é um domínio do SaaS (não personalizado)
        if (CustomDomainService.isSaasDomain(domain)) {
            return next();
        }

        const isApiRequest = req.path.startsWith('/api/');

        // Busca o domínio personalizado no banco de dados
        const customDomain = await CustomDomainService.findActiveByDomain(domain);

        if (!customDomain) {
            // Domínio não encontrado ou não ativo
            // Pode ser um domínio que ainda está sendo configurado
            const pendingDomain = await CustomDomainService.findByDomain(domain);
            
            if (pendingDomain) {
                // Domínio existe mas não está ativo ainda
                logger.info(`Acesso a domínio pendente: ${domain}, status: ${pendingDomain.status}`);

                // Para APIs, não bloquear domínios já registrados.
                // Isso evita quebrar endpoints públicos (forms/blog/track/fonts) enquanto o status não está ACTIVE.
                if (isApiRequest) {
                    req.customDomain = pendingDomain;
                    req.isCustomDomain = true;
                    req.targetBioId = pendingDomain.bioId;
                    req.targetBioSlug = pendingDomain.bio?.sufix;

                    res.setHeader('X-Custom-Domain', 'true');
                    res.setHeader('X-Bio-Id', pendingDomain.bioId);
                    return next();
                }
                
                // Se estiver em processo de verificação, mostra página de status
                if (pendingDomain.status === 'pending' || 
                    pendingDomain.status === 'verifying_dns' || 
                    pendingDomain.status === 'generating_ssl') {
                    res.status(202).json({
                        message: 'Domínio em configuração',
                        status: pendingDomain.status,
                        domain: domain,
                        instructions: `Configure um registro DNS A apontando ${domain} para o IP do servidor`
                    });
                    return;
                }

                // Se falhou, mostra erro
                if (pendingDomain.status === 'failed') {
                    res.status(400).json({
                        message: 'Falha na configuração do domínio',
                        error: pendingDomain.errorMessage,
                        domain: domain
                    });
                    return;
                }
            }

            // Domínio não existe no sistema
            if (shouldLogUnknownDomainWarn(domain)) {
                logger.warn(`Acesso a domínio desconhecido: ${domain}`);
            } else {
                logger.debug(`Acesso repetido a domínio desconhecido (suprimido): ${domain}`);
            }
            res.status(404).json({
                message: 'Domínio não encontrado',
                domain: domain
            });
            return;
        }

        // Domínio ativo encontrado - adiciona informações à requisição
        req.customDomain = customDomain;
        req.isCustomDomain = true;
        req.targetBioId = customDomain.bioId;
        req.targetBioSlug = customDomain.bio?.sufix;

        // Adiciona headers informativos
        res.setHeader('X-Custom-Domain', 'true');
        res.setHeader('X-Bio-Id', customDomain.bioId);

        logger.debug(`Domínio personalizado detectado: ${domain} -> bio/${customDomain.bioId}`);

        next();
    } catch (error) {
        logger.error('Erro no middleware de domínio personalizado:', error);
        next(); // Continua mesmo com erro para não quebrar o site
    }
}

/**
 * Middleware para redirecionar requisições de domínios personalizados
 * para as rotas corretas do bio
 */
export function customDomainRedirectMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    // Se não for domínio personalizado, continua normalmente
    if (!req.isCustomDomain || !req.customDomain) {
        return next();
    }

    // Para APIs, não redireciona - apenas marca
    if (req.path.startsWith('/api/')) {
        return next();
    }

    // Para requisições de páginas, redireciona internamente para o bio
    const bioSlug = req.targetBioSlug || req.customDomain.bio?.sufix;
    
    if (bioSlug) {
        // Redireciona internamente (mantendo a URL original)
        // O frontend deve detectar isso e renderizar o bio correto
        req.url = `/p/${bioSlug}${req.url}`;
        logger.debug(`Redirecionando internamente: ${req.originalUrl} -> ${req.url}`);
    }

    next();
}

/**
 * Middleware para verificar se o usuário tem permissão para usar domínios personalizados
 * Geralmente apenas usuários Pro
 */
export function requireProForCustomDomain(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    // Se não for domínio personalizado, ignora
    if (!req.isCustomDomain) {
        return next();
    }

    // Aqui você pode adicionar lógica para verificar se o usuário tem plano Pro
    // Por exemplo, verificar o plano do usuário do bio
    
    // Por enquanto, deixa passar (a lógica de plano pode ser adicionada depois)
    next();
}
