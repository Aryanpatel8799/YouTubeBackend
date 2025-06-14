import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js";
import { body } from "express-validator";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {publishVideo,removeVideo,getAllVideo} from "../controllers/video.controllers.js"
const router = Router();

router.route("/uploadVideo").post(verifyJWT,
    [
      body("title").trim().notEmpty().withMessage("Title is required field"),
      body("description").trim().notEmpty().withMessage("Description is required field")
    ],
    upload.fields(
    [
    {
        name:"thumbnail",
        maxcount:1
    },
    {
        name:"video",
        maxcount:1
    }
]
)
,publishVideo)
router.route("/removeVideo/:videoId").delete(verifyJWT,removeVideo)
router.route("/getAllVideo").get(verifyJWT,getAllVideo);


export default router