import apiError from "../utils/ApiErrors.js";
import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js";
import subscriberModel from "../models/subscriber.models.js";

const addSubscriber = asyncHandler(async(req,res)=>{

    try {

        const {id} = req.params;
        const userId = req.user._id

        const subscriber = await subscriberModel.create({
            subscriber:userId,
            channel:id
        })

        if(!subscriber)
        {
            throw new apiError(500,[],"Error in Subscribing channel")
        }

        return res.status(201).json(
            new ApiResponse(201,"Subscribed to channel successfully")
        )
        
    } catch (error) {
        throw new apiError(400,[],"Error in fetching subscribers")
    }
})

export {addSubscriber}