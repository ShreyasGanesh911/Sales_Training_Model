import cloudinary from 'cloudinary'
import fs from 'fs'
import 'dotenv/config'
cloudinary.v2.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
    
  });
  const uploadToCloudinary = async(filePath:string)=>{
    try{
        if(!filePath) {
            console.log("No file provided")
            return 
        }
        const file = await cloudinary.v2.uploader.upload(filePath,{
            resource_type: 'auto',
        })
        console.log("Uploaded to cloudinary");
        return file

    }catch(e){
        console.log("Error uploading to cloudinary", e)
        fs.unlinkSync(filePath)
    }
  }

export default uploadToCloudinary