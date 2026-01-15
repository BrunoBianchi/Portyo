import { Router } from "express";
import z from "zod";
import { trackClick } from "../../../shared/services/marketing.service";

const router: Router = Router();

// Public endpoint to track clicks (no auth required)
router.post("/track-click/:id", async (req, res) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    
    await trackClick(id);
    
    return res.status(200).json({ success: true });
});

export default router;
