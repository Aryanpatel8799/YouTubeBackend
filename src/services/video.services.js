import mongoose from "mongoose";
import videoModel from "../models/video.models.js";
import asyncHandler from "../utils/asyncHandler.js";

const uploadVideo = async(owner,title,description,thumbnailUrl,videoUrl,duration)=>
{

    const video = await videoModel.create({
        owner,
        title,
        description,
        thumbnailUrl,
        videoUrl,
        duration
    })

    return video
}

export default uploadVideo