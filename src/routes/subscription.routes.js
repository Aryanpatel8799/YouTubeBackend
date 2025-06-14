import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js";
import { body } from "express-validator";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {addSubscriber} from "../controllers/subscription.controllers.js"
const router = Router();

router.route("/addSubscriber/:id").post(verifyJWT,addSubscriber)


export default router