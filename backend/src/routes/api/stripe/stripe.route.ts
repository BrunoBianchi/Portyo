import { Router } from "express";
import connectRoute from "./[post]-connect.route";
import statusRoute from "./[get]-status.route";
import loginLinkRoute from "./[post]-login-link.route";
import productsRoute from "./[get]-products.route";
import createProductRoute from "./[post]-create-product";
import createCheckoutSessionRoute from "./[post]-create-checkout-session.route";
import cancelSubscriptionRoute from "./[post]-cancel-subscription.route";
import startTrialRoute from "./[post]-start-trial.route";
import updateProductRoute from "./[put]-product";
import deleteProductRoute from "./[delete]-product";

const router: Router = Router();

router.use(connectRoute);
router.use(statusRoute);
router.use(loginLinkRoute);
router.use(productsRoute);
router.use(createProductRoute);
router.use(createCheckoutSessionRoute);
router.use(cancelSubscriptionRoute);
router.use(startTrialRoute);
router.use(updateProductRoute);
router.use(deleteProductRoute);

export default router;
