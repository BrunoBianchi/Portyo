import { Router, Request, Response } from "express";
import { getAllPublicBios } from "../../../shared/services/bio.service";

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

export default router;
