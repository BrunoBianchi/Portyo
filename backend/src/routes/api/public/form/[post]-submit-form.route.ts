
import { Router } from "express";
import { formService } from "../../../../services/form.service";
import { z } from "zod";

export const publicSubmitRoute = Router();

const submitSchema = z.object({
  answers: z.record(z.string(), z.any())
});

publicSubmitRoute.post("/:id/submit", async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = submitSchema.parse(req.body);
    
    // Get IP and User-Agent from request
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || "";
    const userAgent = req.headers['user-agent'] || "";

    const form = await formService.submitAnswer(id, body.answers, { ip: ipAddress, userAgent });
    
    // Fetch form to get success message since submitAnswer might return answer entity
    const formDetails = await formService.findOne(id);
    res.json({ success: true, message: formDetails?.successMessage || "Thank you!" });
  } catch (error) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ message: "Validation error", issues: error.issues });
       return;
    }
    next(error);
  }
});
