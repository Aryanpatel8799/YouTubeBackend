import { Router } from "express";
import { registerUser,loginUser,logoutUser,updateRefreshToken,updatePassword,getCurrentUser,updateUserDetails,getChannelDetails,getWatchHistory} from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js";
import { body } from "express-validator";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { name } from "ejs";
const router = Router();

router.route("/register").post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]),
    body("userName").notEmpty().withMessage("Username is required"),
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    registerUser
)

router.route("/login").post(
    body("password").notEmpty().withMessage("Password is required"),
    loginUser
);

router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(updateRefreshToken);
router.route("/updatePassword").post(verifyJWT,updatePassword);
router.route("/getCurrentUser").post(verifyJWT,getCurrentUser);
router.route("/updateUserDetails").patch(verifyJWT,
     upload.fields([
        {name:"avatar",maxCount:1},
        {name:"coverImage",maxCount:1}
     ]),
updateUserDetails)
router.route("/getChannelDetails/:userName").get(verifyJWT,getChannelDetails)
router.route("/getWatchHistory").post(verifyJWT,getWatchHistory)

export default router