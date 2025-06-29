import jwt from 'jsonwebtoken';
import  User  from '../models/user.models.js';
import ApiError from '../utils/ApiErrors.js';
import asyncHandler from '../utils/asyncHandler.js';


export const verifyJWT = asyncHandler (async (req, res, next) => {

    try {

        const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
        if(!token) {
            throw new ApiError(401, [], "Access token is required");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const user = await User.findById(decoded?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, [], "User not found");
        }

        req.user = user;
        next();

    } catch (error) {
        next(new ApiError(401, [], "Invalid or expired token"));
    }
})
