import mongoose from "mongoose";
import userModel from "./user.models.js";

const subscriberSchema = new mongoose.Schema({
    subscriber:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    channel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
}, {
    timestamps: true,
})

const subscriberModel = mongoose.model("Subscriber", subscriberSchema);
export default subscriberModel;