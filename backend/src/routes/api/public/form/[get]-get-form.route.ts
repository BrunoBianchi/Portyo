
import { Router } from "express";
import { formService } from "../../../../services/form.service";

export const publicGetFormRoute = Router();

publicGetFormRoute.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const form = await formService.findOne(id);
    
    if (!form) {
      res.status(404).json({ message: "Form not found" });
      return;
    }

    if (!form.isActive) {
       res.status(404).json({ message: "Form is currently inactive" });
       return;
    }
    
    // Return only necessary public fields
    res.json({
      id: form.id,
      title: form.title,
      description: form.description,
      fields: form.fields,
      submitButtonText: form.submitButtonText,
      successMessage: form.successMessage
    });
    
    // Optionally increment view count asynchronously
    // formService.incrementViews(id).catch(console.error);
    
  } catch (error) {
    next(error);
  }
});
