import mongoose from "mongoose";

const connectToDB = async()=>{

    try {
        const connectionInstance= await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to "+connectionInstance.connection.db.databaseName);
        
    } catch (error) {
        console.log("Error in connecting to DB "+error);
    }

}

export default connectToDB