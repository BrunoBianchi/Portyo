import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { findUserById, findUserByEmail } from "../../../shared/services/user.service";
import { getBiosFromUser } from "../../../shared/services/bio.service";
import { AppDataSource } from "../../../database/datasource";
import { AutomationEntity } from "../../../database/entity/automation-entity";

const router:Router = Router()

import { BillingService } from "../../../services/billing.service";

router.get("/",authMiddleware,async (req,res)=>{
     const userId = req.user?.id || req.session?.user?.id;
     if (!userId) return res.status(401).send("Unauthorized");

     const user = await findUserById(userId);
     if (!user) return res.status(404).send("User not found");
     
     // Compute active plan dynamically
     const activePlan = await BillingService.getActivePlan(user.id);
     
     // Get Usage Stats
     const bios = await getBiosFromUser(user.id) || [];
     const bioIds = bios.map(b => b.id);
     
     let totalAutomations = 0;
     if (bioIds.length > 0) {
         totalAutomations = await AppDataSource.getRepository(AutomationEntity)
            .createQueryBuilder("automation")
            .where("automation.bioId IN (:...ids)", { ids: bioIds })
            .getCount();
     }

     const payload = {
          id: user.id,
          email: user.email,
          fullname: user.fullName,
          verified: user.verified,
          provider: user.provider,
          createdAt: user.createdAt,
          plan: activePlan,
          usage: {
              bios: bios.length,
              automations: totalAutomations
          }
      }
     res.status(200).json(payload)
})



export default router;