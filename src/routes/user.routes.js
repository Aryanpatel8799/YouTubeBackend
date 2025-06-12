import { Router } from "express";
import { registerUser,loginUser, logoutUser,updateRefreshToken } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js";
import { body } from "express-validator";
import { verifyJWT } from "../middlewares/auth.middleware.js";
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

export default router