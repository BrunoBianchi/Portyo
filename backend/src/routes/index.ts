import { Router, Request, Response, NextFunction } from "express";
import apiRoutes from "./api/api.route";
import sitemapRoute from "./public/seo/sitemap.route";
import robotsRoute from "./public/seo/robots.route";
import { logger } from "../shared/utils/logger";

const router: Router = Router();

// ============================================
// ROTA PARA DOMÍNIOS PERSONALIZADOS
// ============================================
// Intercepta requisições de domínios personalizados e redireciona para o bio correto
router.use("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Se não for domínio personalizado, continua normalmente
        if (!req.isCustomDomain || !req.customDomain) {
            return next();
        }

        // Ignora arquivos estáticos e rotas específicas
        if (req.path.startsWith('/api/') || 
            req.path.startsWith('/sitemap') || 
            req.path.startsWith('/robots')) {
            return next();
        }

        if (
            req.path.startsWith('/assets/') ||
            req.path.startsWith('/build/') ||
            req.path.startsWith('/favicons/') ||
            req.path.startsWith('/icons/') ||
            req.path.startsWith('/fonts/') ||
            req.path.startsWith('/i18n/') ||
            req.path.startsWith('/background/') ||
            req.path.startsWith('/base-img/') ||
            req.path.startsWith('/manifest') ||
            req.path.startsWith('/sw.js') ||
            req.path.startsWith('/@') ||
            req.path.includes('.')
        ) {
            return next();
        }

        // Domínio personalizado detectado
        const bio = req.customDomain.bio;
        if (!bio) {
            logger.error(`Bio não encontrado para domínio: ${req.customDomain.domain}`);
            return res.status(404).json({ 
                message: "Bio não encontrado para este domínio",
                domain: req.customDomain.domain
            });
        }

        // Adiciona headers informativos
        res.setHeader('X-Bio-Slug', bio.sufix);
        res.setHeader('X-Bio-Id', bio.id);
        res.setHeader('X-Custom-Domain', 'true');

        logger.debug(`Domínio personalizado: ${req.customDomain.domain} -> bio/${bio.sufix}`);

        // Para a raiz (/), redireciona internamente para a página do bio
        // O frontend deve estar preparado para renderizar o bio baseado no header X-Bio-Slug
        // ou na URL /p/:slug
        const queryString = req.url.slice(req.path.length);
        if (req.path === '/') {
            req.url = `/p/${bio.sufix}${queryString}`;
        } else {
            req.url = `/p/${bio.sufix}${req.path}${queryString}`;
        }

        next();
    } catch (error) {
        logger.error("Erro ao processar domínio personalizado:", error);
        next();
    }
});

// API Routes
router.use("/api", apiRoutes);

// SEO Routes (public)
router.use("/sitemap.xml", sitemapRoute);
router.use("/robots.txt", robotsRoute);

export default router;
