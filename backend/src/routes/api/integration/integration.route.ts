import { Router } from "express";
import getIntegrationsRoute from "./[get]-integrations.route";

const router: Router = Router();

router.use(getIntegrationsRoute);

export default router;
