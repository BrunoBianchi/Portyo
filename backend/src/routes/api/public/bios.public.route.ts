import { Router, Request, Response } from "express";
import { getAllPublicBios, getRandomPublicBios } from "../../../shared/services/bio.service";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        const bios = await getAllPublicBios();
        return res.status(200).json(bios);
    } catch (error) {
        console.error("Error fetching public bios:", error);
        return res.status(500).json({ error: "Failed to fetch bios" });
    }
});

router.get("/random", async (req: Request, res: Response) => {
    try {
        const limit = Number(req.query.limit || 8);
        const bios = await getRandomPublicBios(Number.isFinite(limit) ? limit : 8);
        return res.status(200).json(bios);
    } catch (error) {
        console.error("Error fetching random public bios:", error);
        return res.status(500).json({ error: "Failed to fetch random bios" });
    }
});

export default router;
