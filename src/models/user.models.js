import mongoose from "mongoose";
import bcrypt, { hash } from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema  = new mongoose.Schema({

    userName:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        min:[13,"Email should be at least 13 characters long"],
        isEmail:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        min:[8,"Password should be at least 8 characters long"],
        trim:true
    },
    avatar:{
        type:String,
        required:true
    },
    coverImage:{
        type:String,
    },
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    refreshToken:{
        type:String
    }
},
    {timestamps:true}
)

userSchema.pre("save",async function(next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.comparePassword = async function(password){
     return await hash.comparePassword(password,this.password);
}

userSchema.methods.generate_JWT_Token = function()
{
    return jwt.sign(
        {
            _id:this._id,
            userName:this.userName,
            email:this.email,
            fullName:this.fullName
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn:process.env.JWT_EXPIRY_TIME
        });
}

userSchema.methods.generate_Refresh_Token = function()
{
    return jwt.sign( 
        {
            _id:this._id,
            userName:this.userName,
            email:this.email,
            fullName:this.fullName
        },
        process.env.REFRESH_SECRET_KEY,
        {
            expiresIn:process.env.REFRESH_EXPIRY_TIME
        });
}

const User = mongoose.model("User",userSchema);

export default User