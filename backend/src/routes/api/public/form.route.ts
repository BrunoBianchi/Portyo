import express from "express";
import { formService } from "../../../services/form.service";

const router = express.Router();

// Submit Answer
router.post("/forms/:id/submit", async (req, res) => {
    try {
        const { id } = req.params;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
        const answer = await formService.submitAnswer(id, req.body, {
            ip: Array.isArray(ip) ? ip[0] : ip,
            userAgent: req.headers['user-agent']
        });
        
        res.status(201).json(answer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to submit form" });
    }
});

export default router;
