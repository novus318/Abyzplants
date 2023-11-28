import fs from 'fs'
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'
import bannerModel from '../models/bannerModel.js';
dotenv.config("../.env")

const apiUrl = process.env.REACT_APP_API_URL;
export const createBannerController=async(req,res)=>{
    try {
            const {image1,image2,image3}=req.files

         const newBanner = new bannerModel()
        const saveImage = async (image,BannerId,index) => {
            const ext = path.extname(image.name);
            const fileName = `image${index + 1}_${BannerId}.webp`;

            // Use fileURLToPath to get the current directory
            const currentDir = path.dirname(fileURLToPath(import.meta.url));
            const rootDir = path.resolve(currentDir, '../');
            // Create the folder if it doesn't exist
            const imagesDir = path.join(rootDir, 'Bannerimages');
            if (!fs.existsSync(imagesDir)) {
                fs.mkdirSync(imagesDir);
            }

            const imagePath = path.join(rootDir, 'Bannerimages', fileName);
            await sharp(image.path)
                .toFormat('webp')
                .toFile(imagePath);

                const imageUrl = `${apiUrl}/api/Bannerimages/${fileName}`;
                
                if (index === 0) {
                    newBanner.images.image1 = imageUrl;
                } else if (index === 1) {
                    newBanner.images.image2 = imageUrl;
                } else if (index === 2) {
                    newBanner.images.image3 = imageUrl;
                }
              
            };
            if (image1) {
                await saveImage(image1, newBanner._id, 0);
            }
    
            if (image2) {
                await saveImage(image2, newBanner._id, 1);
            }
    
            if (image3) {
                await saveImage(image3, newBanner._id, 2);
            }

            await newBanner.save();
        res.status(201).send({
            success:true,
            message:'Product created successfully',
            product:newBanner
        })
    } catch (error) {
        console.error('Error in creating product:', error);
        res.status(500).send({
            success:false,
            error,
            message:'Error in creating product'
        })
    }
}

export const updateBannerController=async(req,res)=>{
    try {
        const {image1,image2,image3}=req.files
        const banner=await bannerModel.findByIdAndUpdate(req.params.pid,{new:true})
        const saveImage = async (image, productId, index) => {
            const ext = path.extname(image.name);
            const fileName = `image${index + 1}_${productId}.webp`;

            // Use fileURLToPath to get the current directory
            const currentDir = path.dirname(fileURLToPath(import.meta.url));
            const rootDir = path.resolve(currentDir, '../');
            // Create the "images" folder if it doesn't exist
            const imagesDir = path.join(rootDir, 'Bannerimages');
            if (!fs.existsSync(imagesDir)) {
                fs.mkdirSync(imagesDir);
            }

            const imagePath = path.join(rootDir, 'Bannerimages', fileName);
            await sharp(image.path)
                .toFormat('webp')
                .toFile(imagePath);

                const imageUrl = `${apiUrl}/api/Bannerimages/${fileName}`;

                if (index === 0) {
                    banner.images.image1 = imageUrl;
                } else if (index === 1) {
                    banner.images.image2 = imageUrl;
                } else if (index === 2) {
                    banner.images.image3 = imageUrl;
                }
            };
            if (image1) {
                await saveImage(image1, banner._id, 0);
            }
    
            if (image2) {
                await saveImage(image2, banner._id, 1);
            }
    
            if (image3) {
                await saveImage(image3, banner._id, 2);
            }
        await banner.save()
       
        res.status(201).send({
            success:true,
            message:'Product updated successfully',
        })
    } catch (error) {
        res.status(500).send({
            success:false,
            error,
            message:'Error in updating product'
        })
    }
} 
export const getBannerController = async (req, res) => {
    try {

        const banners = await bannerModel
            .find({})

        res.status(200).send({
            success: true,
            message: 'Products fetched successfully',
            banners
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error in getting products',
            error: error.message,
        });
    }
};