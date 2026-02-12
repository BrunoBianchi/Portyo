import { Router, Request, Response } from "express";
import { z } from "zod";
import * as CompanyAuthService from "../../../shared/services/company-auth.service";
import * as SponsoredOfferService from "../../../shared/services/sponsored-offer.service";
import { companyAuthMiddleware } from "../../../middlewares/company-auth.middleware";

const router: Router = Router();

/** Safely extract an HTTP status code from an error object */
const getErrorStatus = (error: any, fallback = 500): number => {
    const code = error.code;
    return typeof code === "number" && code >= 100 && code < 600 ? code : fallback;
};

// ==================== AUTH ====================

const registerSchema = z.object({
    companyName: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6),
    logo: z.string().url().optional(),
    website: z.string().url().optional(),
    description: z.string().max(500).optional(),
    industry: z.string().max(50).optional(),
});

router.post("/auth/register", async (req: Request, res: Response) => {
    try {
        const data = registerSchema.parse(req.body);
        const result = await CompanyAuthService.registerCompany(data);
        res.status(201).json({
            token: result.token,
            company: {
                id: result.company.id,
                companyName: result.company.companyName,
                email: result.company.email,
                logo: result.company.logo,
                website: result.company.website,
                industry: result.company.industry,
                balance: result.company.balance,
            },
        });
    } catch (error: any) {
        if (error.name === "ZodError") {
            return res.status(400).json({ error: "Validation error", details: error.errors });
        }
        res.status(getErrorStatus(error)).json({ error: error.message });
    }
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

router.post("/auth/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const result = await CompanyAuthService.loginCompany(email, password);
        res.json({
            token: result.token,
            company: {
                id: result.company.id,
                companyName: result.company.companyName,
                email: result.company.email,
                logo: result.company.logo,
                website: result.company.website,
                industry: result.company.industry,
                balance: result.company.balance,
                totalSpent: result.company.totalSpent,
            },
        });
    } catch (error: any) {
        if (error.name === "ZodError") {
            return res.status(400).json({ error: "Validation error", details: error.errors });
        }
        res.status(getErrorStatus(error)).json({ error: error.message });
    }
});

// ==================== PROFILE (Auth required) ====================

router.get("/profile", companyAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const company = await CompanyAuthService.getCompanyById(req.company!.companyId);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }
        res.json({
            id: company.id,
            companyName: company.companyName,
            email: company.email,
            logo: company.logo,
            website: company.website,
            description: company.description,
            industry: company.industry,
            balance: company.balance,
            totalSpent: company.totalSpent,
            verified: company.verified,
            createdAt: company.createdAt,
        });
    } catch (error: any) {
        res.status(getErrorStatus(error)).json({ error: error.message });
    }
});

const updateProfileSchema = z.object({
    companyName: z.string().min(2).max(100).optional(),
    logo: z.string().url().optional().nullable().transform(v => v ?? undefined),
    website: z.string().url().optional().nullable().transform(v => v ?? undefined),
    description: z.string().max(500).optional().nullable().transform(v => v ?? undefined),
    industry: z.string().max(50).optional().nullable().transform(v => v ?? undefined),
});

router.put("/profile", companyAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const data = updateProfileSchema.parse(req.body);
        const company = await CompanyAuthService.updateCompany(req.company!.companyId, data);
        res.json({
            id: company.id,
            companyName: company.companyName,
            email: company.email,
            logo: company.logo,
            website: company.website,
            description: company.description,
            industry: company.industry,
        });
    } catch (error: any) {
        if (error.name === "ZodError") {
            return res.status(400).json({ error: "Validation error", details: error.errors });
        }
        res.status(getErrorStatus(error)).json({ error: error.message });
    }
});

// ==================== OFFERS (Auth required) ====================

const createOfferSchema = z.object({
    title: z.string().min(3).max(150),
    description: z.string().min(10).max(1000),
    linkUrl: z.string().url(),
    imageUrl: z.preprocess(v => (v === "" ? undefined : v), z.string().url().optional()),
    category: z.enum(["food", "tech", "fashion", "health", "finance", "education", "entertainment", "travel", "sports", "other"]).optional(),
    cpcRate: z.number().min(0.01),
    dailyBudget: z.preprocess(v => (v === "" || v === null ? undefined : v), z.number().min(1).optional()),
    totalBudget: z.preprocess(v => (v === "" || v === null ? undefined : v), z.number().min(1).optional()),
    startsAt: z.preprocess(v => (v === "" ? undefined : v), z.string().optional()),
    expiresAt: z.preprocess(v => (v === "" ? undefined : v), z.string().optional()),
    targetCountries: z.preprocess(v => (Array.isArray(v) && v.length === 0 ? undefined : v), z.array(z.string()).optional()),
    minBioTier: z.enum(["any", "starter", "growing", "established"]).optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    layout: z.enum(["card", "banner", "compact"]).optional(),
});

router.post("/offers", companyAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const data = createOfferSchema.parse(req.body);
        const offer = await SponsoredOfferService.createOffer(req.company!.companyId, {
            ...data,
            startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        });
        res.status(201).json(offer);
    } catch (error: any) {
        if (error.name === "ZodError") {
            return res.status(400).json({ error: "Validation error", details: error.errors });
        }
        res.status(getErrorStatus(error)).json({ error: error.message });
    }
});

router.get("/offers", companyAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const offers = await SponsoredOfferService.getCompanyOffers(req.company!.companyId);
        res.json(offers);
    } catch (error: any) {
        res.status(getErrorStatus(error)).json({ error: error.message });
    }
});

router.put("/offers/:id", companyAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const data = createOfferSchema.partial().parse(req.body);
        const offer = await SponsoredOfferService.updateOffer(req.company!.companyId, req.params.id, {
            ...data,
            startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        });
        res.json(offer);
    } catch (error: any) {
        if (error.name === "ZodError") {
            return res.status(400).json({ error: "Validation error", details: error.errors });
        }
        res.status(getErrorStatus(error)).json({ error: error.message });
    }
});

router.patch("/offers/:id/pause", companyAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const offer = await SponsoredOfferService.pauseOffer(req.company!.companyId, req.params.id);
        res.json(offer);
    } catch (error: any) {
        res.status(getErrorStatus(error)).json({ error: error.message });
    }
});

router.get("/offers/:id/stats", companyAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const stats = await SponsoredOfferService.getOfferStats(req.company!.companyId, req.params.id);
        res.json(stats);
    } catch (error: any) {
        res.status(getErrorStatus(error)).json({ error: error.message });
    }
});

export default router;
