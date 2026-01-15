import { Router } from "express";
import generateBioRouter from "./[post]-generate-bio.route";

const router: Router = Router();

router.use("/", generateBioRouter);

export default router;
