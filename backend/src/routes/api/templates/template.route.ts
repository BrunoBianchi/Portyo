import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { createTemplate, deleteTemplate, getTemplate, getTemplates, updateTemplate } from "../../../shared/services/email-template.service";
import { ApiError } from "../../../shared/errors/api-error";

const router = Router();

const CreateTemplateSchema = z.object({
    name: z.string().min(1),
    content: z.any(),
    html: z.string()
});

const UpdateTemplateSchema = z.object({
    name: z.string().min(1).optional(),
    content: z.any().optional(),
    html: z.string().optional()
});

router.use(authMiddleware);

router.post("/:bioId", async (req, res) => {
    try {
        const { bioId } = req.params;
        const data = CreateTemplateSchema.parse(req.body);
        const template = await createTemplate(bioId, data);
        res.status(201).json(template);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues });
        } else {
            const apiError = error as ApiError;
            res.status(apiError.code || 500).json({ message: apiError.message });
        }
    }
});

router.get("/:bioId", async (req, res) => {
    try {
        const { bioId } = req.params;
        const templates = await getTemplates(bioId);
        res.json(templates);
    } catch (error) {
        const apiError = error as ApiError;
        res.status(apiError.code || 500).json({ message: apiError.message });
    }
});

router.get("/:bioId/:id", async (req, res) => {
    try {
        const { bioId, id } = req.params;
        const template = await getTemplate(id, bioId);
        res.json(template);
    } catch (error) {
        const apiError = error as ApiError;
        res.status(apiError.code || 500).json({ message: apiError.message });
    }
});

router.put("/:bioId/:id", async (req, res) => {
    try {
        const { bioId, id } = req.params;
        const data = UpdateTemplateSchema.parse(req.body);
        const template = await updateTemplate(id, bioId, data);
        res.json(template);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues });
        } else {
            const apiError = error as ApiError;
            res.status(apiError.code || 500).json({ message: apiError.message });
        }
    }
});

router.delete("/:bioId/:id", async (req, res) => {
    try {
        const { bioId, id } = req.params;
        await deleteTemplate(id, bioId);
        res.status(204).send();
    } catch (error) {
        const apiError = error as ApiError;
        res.status(apiError.code || 500).json({ message: apiError.message });
    }
});

export default router;
