import mongoose from "mongoose";
import mongooseaggregatepaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new mongoose.Schema({

    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    thumbnailUrl:{
        type:String,
        required:true
    },
    videoUrl:{
        type:String,
        required:true
    },
    duration:{
        type:String,
        required:true
    },
    isPublished:{
        type:Boolean,
        default:false
    },
    views:{
        type:Number,
        default:0
    },


},{timestamps:true});

videoSchema.plugin(mongooseaggregatepaginate);

const Video = mongoose.model("Video",videoSchema);

export default Video