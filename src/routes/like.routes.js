import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {addLike} from "../controllers/like.controllers.js"
const router = Router();

router.route("/addLike/:videoId").post(verifyJWT,addLike)


export default router