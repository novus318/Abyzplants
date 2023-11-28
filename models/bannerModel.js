import mongoose from "mongoose";

const bannerSchema= new mongoose.Schema({
    images:{
        image1:String,
        image2:String,
        image3:String,
    },
},{timestamps:true})
export default mongoose.model('banners',bannerSchema)