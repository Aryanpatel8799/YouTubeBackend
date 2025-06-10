import asyncHandler from "./../utils/asyncHandler.js"
import ApiError from "../utils/ApiErrors.js";
import cloudinaryUpload from "../utils/cloudinary.js";
import userModel from "../models/user.models.js";
import {createUser} from "../services/user.services.js";
import ApiResponse from "../utils/ApiResponse.js";
import { validationResult } from "express-validator";
import fs from "fs";

const registerUser = asyncHandler( async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        throw new ApiError(400,errors.array().map(err => ({
            param: err.param,
            msg: err.msg
        })),"Validation Error");
    }

    const {userName,fullName,email,password}=req.body;
    
    const avatarfilepath = req.files?.avatar[0].path
     if(!avatarfilepath){
        throw new ApiError(400,[],"Avatar is required");
    }
    
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!userName || !fullName || !email || !password || !avatarfilepath){
        throw new ApiError(400,[],"All fields are required");
    }

    const userExists = await userModel.findOne({
        $or:[
            {userName},
            {email}
        ]
    })

    if(userExists){
        throw new ApiError(400,[],"User already exists with this username or email");
    }

    const avatarURL = await cloudinaryUpload(avatarfilepath);
    let coverImageURL;
    if(coverImageLocalPath){
     coverImageURL = await cloudinaryUpload(coverImageLocalPath);
    }
    if(!avatarURL){
        throw new ApiError(500,[],"Failed to upload avatar image");
    }

    try{

    const user = await createUser(
        userName,
        fullName,
        email,
        password,
        avatarURL.url,
        coverImageURL ? coverImageURL.url : " "
    );

    const createdUser = await userModel.findById(user._id).select("-password -refreshToken");
    if(!createdUser){
        throw new ApiError(500,"Failed to create user");
    }
    fs.unlinkSync(avatarfilepath);
    if(coverImageLocalPath){
        fs.unlinkSync(coverImageLocalPath);
    }

    res.status(201).json(
        new ApiResponse(201,"User registered successfully",createdUser)
    );
  }
  catch (error) {
    throw new ApiError(500,error.array,`Failed to register user: ${error.message}`);
  } 

})

export {registerUser}
