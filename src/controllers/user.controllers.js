import asyncHandler from "./../utils/asyncHandler.js"
import  validationResult from "express-validator";

const registerUser = asyncHandler( async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        throw new ApiError(400,"Validation Error",errors.array());
    }

    const {userName,fullName,email,password,avatar,coverImage}=req.body;

    if(!userName || !fullName || !email || !password || !avatar){
        throw new ApiError(400,"All fields are required");
    }

})

export {registerUser}
