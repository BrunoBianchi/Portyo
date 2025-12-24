import { Router, Request, Response } from "express";
import { findBioBySufixWithUser } from "../../../shared/services/bio.service";
import { ApiError } from "../../../shared/errors/api-error";
import z from "zod"
const router: Router = Router();

router.get("/:sufix", async (req: Request, res: Response) => {
        const { sufix } = z.object({ sufix: z.string() }).parse(req.params);
        const bio = await findBioBySufixWithUser(sufix);
        if(bio)  return res.status(200).json(bio);
        else return res.status(404).json("Invalid Bio !")
});

export default router;
