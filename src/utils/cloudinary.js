import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name:"dsnj5pq5p",
  api_key:"486741517721365",
  api_secret:"BIP76-fwedgWnEn14Tws83drbrA",
});

const cloudinaryUpload = async(filePath)=>{
    try {
        const response= await cloudinary.uploader.upload(filePath,
            {
                resource_type:"auto"
            }
        );
        return response;
    } catch (error) {
        fs.unlinkSync(filePath);
        return null;
    }
}

export default cloudinaryUpload