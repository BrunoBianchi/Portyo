import express from "express";
import { formService } from "../../../services/form.service";

const router = express.Router();

// Public form definition (used by public bio widgets)
router.get("/forms/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const form = await formService.findOne(id);

        if (!form || !form.isActive) {
            return res.status(404).json({ error: "Form not found" });
        }

        return res.json({
            id: form.id,
            title: form.title,
            description: form.description,
            fields: form.fields,
            submitButtonText: form.submitButtonText,
            successMessage: form.successMessage,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch form" });
    }
});

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
