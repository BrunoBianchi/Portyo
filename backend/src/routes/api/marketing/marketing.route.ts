import { Router } from "express";
import slotsRoute from "./slots.route";
import proposalsRoute from "./proposals.route";

const router: Router = Router();

router.use("/slots", slotsRoute);
router.use("/proposals", proposalsRoute);

export default router;
