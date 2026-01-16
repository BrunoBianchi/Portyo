import { Router } from "express";
import slotsRoute from "./slots.route";
import proposalsRoute from "./proposals.route";
import generatePaymentLinkRoute from "./[post]-generate-payment-link.route";

const router: Router = Router();

router.use("/slots", slotsRoute);
router.use("/proposals", proposalsRoute);
router.use("/proposals", generatePaymentLinkRoute);

export default router;

