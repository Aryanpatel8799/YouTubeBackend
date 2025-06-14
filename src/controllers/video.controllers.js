import apiError from "../utils/ApiErrors.js";
import asyncHandler from "../utils/asyncHandler.js"
import { validationResult } from "express-validator"
import cloudinaryUpload from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import uploadVideo from "../services/video.services.js";
import fs from "fs"
import videoModel from "../models/video.models.js";
import userModel from "../models/user.models.js";


const publishVideo = asyncHandler(async(req,res)=>
{
    try {
        const error = validationResult(req);
        if(!error.isEmpty)
        {
            throw new apiError(400,error,"Cannot upload video")
        }
    
        const { title , description } = req.body
        const thumbnailFilePath = req.files.thumbnail[0].path
        const videoFilePath = req.files.video[0].path
    
        if(!thumbnailFilePath || !videoFilePath)
        {
            throw new apiError(400,[],"Thumbnail and video are required fields")
        }
    
        const thumbnailUrl = await cloudinaryUpload(thumbnailFilePath);
        if(!thumbnailUrl)
        {
            throw new apiError(500,[],"Error in uploading thumbnail")
        }
        const videoUrl = await cloudinaryUpload(videoFilePath);
        if(!videoUrl)
        {
            throw new apiError(500,[],"Error in uploading video")
        }
        const owner = req.user._id
    
        const uploadedVideo = await uploadVideo(
            owner,
            title,
            description,
            thumbnailUrl.secure_url,
            videoUrl.secure_url,
            videoUrl.duration,
        )
    
        if(!uploadVideo)
        {
            throw new apiError(500,[],"Error");
            
        }
        uploadedVideo.isPublished = true;
        uploadedVideo.save({validateBeforeSave:false})
    
        fs.unlinkSync(thumbnailFilePath);
        fs.unlinkSync(videoFilePath);
        
        return res.status(200).json(
            new ApiResponse(200,"Video Uploaded successfully",uploadedVideo)
        );
    } catch (error) {
        throw new apiError(400,[],error)
    }

})
const removeVideo = asyncHandler(async (req,res)=>{

   try {
    const { videoId } = req.params;

    if(!videoId)
    {
        throw new apiError(400,[],"Error in fetching videoID")
    }

    const isVideoExist = await videoModel.findById({_id:videoId})
    if(!isVideoExist)
    {
      throw new apiError(404,[],"Video Does not exists with this video Id")
    }
    const deletedVideo = await isVideoExist.deleteOne()
    
    const user = await userModel.updateMany({
        watchHistory:videoId
    },
    {
        $pull:{watchHistory:videoId}
    }
)


     return res.status(200).json(
         new ApiResponse(200,"Video deleted successfully",deletedVideo)
     )
   } catch (error) {
     throw new apiError(400,[],`Error : ${error}`)
   }
   
})
const getAllVideo = asyncHandler(async(req,res)=>{
   try {
     const video = await videoModel.find().sort({createdAt:-1}).limit(10);
     return res.status(200).json(
         new ApiResponse(200,"All Videos Fetched Successfully",video)
     )
   } catch (error) {
      throw new apiError(400,[],"Error in fetching video")
   }
})


export {publishVideo,removeVideo,getAllVideo}