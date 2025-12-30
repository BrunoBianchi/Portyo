import { Router } from "express";
import connectRoute from "./[post]-connect.route";
import statusRoute from "./[get]-status.route";
import loginLinkRoute from "./[post]-login-link.route";
import productsRoute from "./[get]-products.route";
import createProductRoute from "./[post]-create-product";

const router: Router = Router();

router.use(connectRoute);
router.use(statusRoute);
router.use(loginLinkRoute);
router.use(productsRoute);
router.use(createProductRoute);

export default router;
