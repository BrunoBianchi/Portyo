import { Router } from "express";
import getIntegrationsRoute from "./[get]-integrations.route";
import disconnectRoute from "./[delete]-disconnect.route";

const router: Router = Router();

router.use(getIntegrationsRoute);
router.use(disconnectRoute);

export default router;
