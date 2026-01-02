import {Router} from "express"
import callbackRoute from "./[get]-callback.route"
import exchangeTokenRoute from "./[get]-exchange-token.route"
import authRoute from "./[get]-auth.route"

const router:Router = Router()

router.use(callbackRoute)
router.use(exchangeTokenRoute)
router.use(authRoute)

export default router;