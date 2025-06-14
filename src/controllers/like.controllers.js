import apiError from "../utils/ApiErrors.js";
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js";
import likeModel from "../models/like.models.js"
const addLike = asyncHandler(async(req,res)=>{
    try {

        const {videoId} = req.params

        const like = await likeModel.findByIdAndUpdate({_id:videoId},{
            video:videoId,
            likedBy:req.user._id
        },
        {
            upsert:true
        }
    )
        
        if(!like)
        {
            throw new apiError(400,[],"Error in liking video")
        }

        return res.status(201).json(
            new ApiResponse(200,"Liked Video successfully",like)
        )
        
    } catch (error) {
        new apiError(400,[],`Error: ${error}`)
    }
})

export {addLike}