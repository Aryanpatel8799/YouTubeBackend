import apiError from "../utils/ApiErrors.js";
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js";
import commentModel from "../models/comment.models.js"
const addComment = asyncHandler(async(req,res)=>{
    try {

        const {videoId} = req.params
        const {commentContent} = req.body

        const comment = await commentModel.create({
            content:commentContent,
            video:videoId,
            owner:req.user._id
        })
    
        if(!comment)
        {
            throw new apiError(400,[],"Error while adding Comment to the video")
        }

        return res.status(201).json(
            new ApiResponse(200,"Comment added to Video successfully",comment)
        )
        
    } catch (error) {
        new apiError(400,[],`Error: ${error}`)
    }
})

export {addComment}