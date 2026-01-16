import { Router } from "express";
import { z } from "zod";
import * as PublicService from "../../../shared/services/marketing-public.service";
import * as jwt from "jsonwebtoken";
import { env } from "../../../config/env";

const router: Router = Router();

// Validate proposal ID and status (public)
router.get("/:id/validate", async (req, res) => {
    try {
        const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
        const proposal = await PublicService.getProposal(id);

        if (proposal.status !== 'accepted') {
            return res.status(400).json({ error: "Invalid proposal" });
        }

        return res.status(200).json({ valid: true });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: "Invalid proposal" });
        }
        return res.status(error.statusCode || 500).json({ error: "Invalid proposal" });
    }
});

// Middleware to verify temporary proposal token
const proposalAuthMiddleware = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        if (decoded.type !== 'proposal_access') {
            return res.status(403).json({ error: "Invalid token type" });
        }
        req.proposalId = decoded.proposalId;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

// Send Access Code
router.post("/:id/send-code", async (req, res) => {
    try {
        const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
        await PublicService.sendAccessCode(id);
        res.json({ message: "Code sent" });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

// Verify Code
router.post("/:id/verify-code", async (req, res) => {
    try {
        const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
        const { code } = z.object({ code: z.string() }).parse(req.body);
        
        const result = await PublicService.verifyAccessCode(id, code);
        res.json(result);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

// Get Proposal Details (Protected by token)
router.get("/:id", proposalAuthMiddleware, async (req: any, res) => {
    try {
        if (req.params.id !== req.proposalId) {
            return res.status(403).json({ error: "Token mismatch" });
        }
        const proposal = await PublicService.getProposal(req.proposalId);
        res.json(proposal);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

// Update Creative (Protected by token)
router.put("/:id/creative", proposalAuthMiddleware, async (req: any, res) => {
    try {
        // req.proposalId comes from middleware, verify match with params
        if (req.params.id !== req.proposalId) {
            return res.status(403).json({ error: "Token mismatch" });
        }

        const body = z.object({
            imageUrl: z.string().url().optional(),
            title: z.string().optional(),
            description: z.string().optional(),
            linkUrl: z.string().url().optional(),
            buttonText: z.string().optional(),
            backgroundColor: z.string().optional(),
            textColor: z.string().optional(),
            borderColor: z.string().optional(),
            borderWidth: z.number().optional(),
            borderRadius: z.number().optional(),
            buttonColor: z.string().optional(),
            buttonTextColor: z.string().optional(),
            alignment: z.enum(['left', 'center', 'right']).optional(),
            boxShadow: z.string().optional(),
            padding: z.number().optional(),
            gap: z.number().optional(),
            fontFamily: z.string().optional(),
            animation: z.enum(['none', 'pulse', 'bounce']).optional(),
            items: z.array(z.any()).optional()
        }).passthrough().parse(req.body);

        await PublicService.updateProposalCreative(req.proposalId, body);
        res.json({ message: "Creative updated" });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
});

export default router;
