import { Router, Request, Response } from "express";
import * as SponsoredClickService from "../../../shared/services/sponsored-click.service";
import * as SponsoredAdoptionService from "../../../shared/services/sponsored-adoption.service";

const router: Router = Router();

// GET /api/public/sponsored/click/:trackingCode
// Tracks click and redirects to destination URL
router.get("/click/:trackingCode", async (req: Request, res: Response) => {
    try {
        const { trackingCode } = req.params;
        const fingerprint = req.query.fp as string | undefined;
        const sessionId = req.query.sid as string | undefined;

        let ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
            req.socket.remoteAddress || "";

        const userAgent = req.headers["user-agent"] || "";
        const referrer = req.headers["referer"] || req.headers["referrer"] || undefined;

        const result = await SponsoredClickService.trackClick(
            trackingCode,
            ip,
            userAgent,
            fingerprint,
            referrer as string | undefined,
            sessionId,
        );

        // Always redirect, even if click is invalid (user still gets to the destination)
        return res.redirect(302, result.redirectUrl);
    } catch (error: any) {
        // If link not found, redirect to homepage
        if (error.code === 404) {
            return res.redirect(302, "/");
        }
        return res.redirect(302, "/");
    }
});

// GET /api/public/sponsored/bio/:bioId
// Get active sponsored links for a public bio page
router.get("/bio/:bioId", async (req: Request, res: Response) => {
    try {
        const adoptions = await SponsoredAdoptionService.getBioAdoptions(req.params.bioId);

        const links = adoptions.map(a => ({
            id: a.id,
            trackingCode: a.trackingCode,
            position: a.position,
            offer: {
                id: a.offer.id,
                title: a.offer.title,
                description: a.offer.description,
                imageUrl: a.offer.imageUrl,
                linkUrl: a.offer.linkUrl,
                category: a.offer.category,
                backgroundColor: a.offer.backgroundColor,
                textColor: a.offer.textColor,
                layout: a.offer.layout,
                companyName: a.offer.company?.companyName,
                companyLogo: a.offer.company?.logo,
            },
        }));

        res.json(links);
    } catch (error: any) {
        const statusCode = typeof error.code === "number" && error.code >= 100 && error.code < 600 ? error.code : 500;
        res.status(statusCode).json({ error: error.message });
    }
});

export default router;
