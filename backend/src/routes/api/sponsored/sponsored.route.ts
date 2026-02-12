import { Router, Request, Response } from "express";
import { z } from "zod";
import * as SponsoredOfferService from "../../../shared/services/sponsored-offer.service";
import * as SponsoredAdoptionService from "../../../shared/services/sponsored-adoption.service";

const router: Router = Router();

// ==================== MARKETPLACE ====================

router.get("/marketplace", async (req: Request, res: Response) => {
    try {
        const { category, search, page, limit } = req.query;
        const result = await SponsoredOfferService.listMarketplaceOffers({
            category: category as string,
            search: search as string,
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 20,
        });
        res.json(result);
    } catch (error: any) {
        const statusCode = typeof error.code === "number" && error.code >= 100 && error.code < 600 ? error.code : 500;
        res.status(statusCode).json({ error: error.message });
    }
});

router.get("/marketplace/:id", async (req: Request, res: Response) => {
    try {
        const offer = await SponsoredOfferService.getOfferById(req.params.id);
        if (!offer) {
            return res.status(404).json({ error: "Offer not found" });
        }
        res.json(offer);
    } catch (error: any) {
        const statusCode = typeof error.code === "number" && error.code >= 100 && error.code < 600 ? error.code : 500;
        res.status(statusCode).json({ error: error.message });
    }
});

// ==================== ADOPTIONS ====================

const adoptSchema = z.object({
    offerId: z.string().uuid(),
    bioId: z.string().uuid(),
});

router.post("/adopt", async (req: Request, res: Response) => {
    try {
        const { offerId, bioId } = adoptSchema.parse(req.body);
        const adoption = await SponsoredAdoptionService.adoptOffer(
            req.user!.id!,
            bioId,
            offerId,
        );
        res.status(201).json(adoption);
    } catch (error: any) {
        if (error.name === "ZodError") {
            return res.status(400).json({ error: "Validation error", details: error.errors });
        }
        // PostgreSQL duplicate key = unique constraint violation (code 23505)
        if (error.code === "23505") {
            return res.status(409).json({ error: "You have already adopted this offer" });
        }
        const statusCode = typeof error.code === "number" && error.code >= 100 && error.code < 600 ? error.code : 500;
        res.status(statusCode).json({ error: error.message });
    }
});

router.delete("/adopt/:id", async (req: Request, res: Response) => {
    try {
        await SponsoredAdoptionService.removeAdoption(req.user!.id!, req.params.id);
        res.json({ success: true });
    } catch (error: any) {
        const statusCode = typeof error.code === "number" && error.code >= 100 && error.code < 600 ? error.code : 500;
        res.status(statusCode).json({ error: error.message });
    }
});

router.get("/my-links", async (req: Request, res: Response) => {
    try {
        const bioId = req.query.bioId as string | undefined;
        const adoptions = await SponsoredAdoptionService.getUserAdoptions(req.user!.id!, bioId);
        res.json(adoptions);
    } catch (error: any) {
        const statusCode = typeof error.code === "number" && error.code >= 100 && error.code < 600 ? error.code : 500;
        res.status(statusCode).json({ error: error.message });
    }
});

// ==================== EARNINGS ====================

router.get("/earnings", async (req: Request, res: Response) => {
    try {
        const earnings = await SponsoredAdoptionService.getUserEarnings(req.user!.id!);
        res.json(earnings);
    } catch (error: any) {
        const statusCode = typeof error.code === "number" && error.code >= 100 && error.code < 600 ? error.code : 500;
        res.status(statusCode).json({ error: error.message });
    }
});

router.get("/earnings/history", async (req: Request, res: Response) => {
    try {
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
        const result = await SponsoredAdoptionService.getEarningsHistory(req.user!.id!, page, limit);
        res.json(result);
    } catch (error: any) {
        const statusCode = typeof error.code === "number" && error.code >= 100 && error.code < 600 ? error.code : 500;
        res.status(statusCode).json({ error: error.message });
    }
});

export default router;
