import fs from 'fs'
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import slugify from 'slugify'
import potModel from '../models/potModel.js';

export const createPotController=async(req,res)=>{
    try {
        const {name,
            code,
            description,
            specifications,
            sizeOption,
            sizes,
            quantity,
            offerPercentage,
            color,imageName1,imageName2,imageName3,imageName4,imageName5,imageName6,imageName7}=req.fields
            const {image1,image2,image3,image4,image5,image6,image7}=req.files
            console.log('one1')
            const existingProduct = await potModel.findOne({ $or: [{ code }, { slug }] });
            console.log('one2')
        if (existingProduct) {
            console.log('start')
          return res.status(400).send({
            success: false,
            message: 'A product with the same code already exists.',
          });
        }
        const product=new potModel({name,code,description,sizeOption,quantity,offerPercentage,slug:slugify(name)})
        if(sizes){
            product.sizes =JSON.parse(sizes)
            console.log('one')
        }
        if(color){
            product.color =JSON.parse(color)
            console.log('two')
        }
        if(specifications){
            product.specifications =JSON.parse(specifications)
            console.log('thrree')
        }
        const saveImage = async (image, productId,index) => {
            const ext = path.extname(image.name);
            const fileName = `image${index + 1}_${productId}.webp`;

            // Use fileURLToPath to get the current directory
            const currentDir = path.dirname(fileURLToPath(import.meta.url));
            const rootDir = path.resolve(currentDir, '../');
            // Create the "images" folder if it doesn't exist
            const imagesDir = path.join(rootDir, 'Potimages');
            if (!fs.existsSync(imagesDir)) {
                fs.mkdirSync(imagesDir);
            }

            const imagePath = path.join(rootDir, 'Potimages', fileName);
            await sharp(image.path)
                .toFormat('webp')
                .toFile(imagePath);

                const imageUrl = `${apiUrl}/api/Potimages/${fileName}`;
                
                if (index === 0) {
                    product.images.image1 = imageUrl;
                } else if (index === 1) {
                    product.images.image2 = imageUrl;
                } else if (index === 2) {
                    product.images.image3 = imageUrl;
                }
                else if (index === 3) {
                    product.images.image4 = imageUrl;
                }
                else if (index === 4) {
                    product.images.image5 = imageUrl;
                }
                else if (index === 5) {
                    product.images.image6 = imageUrl;
                }
                else if (index === 6) {
                    product.images.image7 = imageUrl;
                }
              
            };
            console.log('one')
            if (image1) {
                await saveImage(image1, product._id, 0);
                product.images.imageName1 = imageName1;
            }
    
            if (image2) {
                await saveImage(image2, product._id, 1);
                product.images.imageName2 = imageName2;
            }
    
            if (image3) {
                await saveImage(image3, product._id, 2);
                product.images.imageName3 = imageName3;
            }
            if (image4) {
                await saveImage(image4, product._id, 3);
                product.images.imageName4 = imageName4;
            }
            if (image5) {
                await saveImage(image5, product._id, 4);
                product.images.imageName5 = imageName5;
            }
            if (image6) {
                await saveImage(image6, product._id, 5);
                product.images.imageName6 = imageName6;
            }
            if (image7) {
                await saveImage(image7, product._id, 6);
                product.images.imageName7 = imageName7;
            }

            await product.save();
        res.status(201).send({
            success:true,
            message:'Product created successfully',
            product
        })
    } catch (error) {
        res.status(500).send({
            success:false,
            error,
            message:'Error in creating product'
        })
    }
}

export const updatePotController=async(req,res)=>{
    try {
        const {name,
            code,
            description,
            specifications,
            sizeOption,
            sizes,
            quantity,
            offerPercentage,
            color,}=req.fields
        const {imageName1,imageName2,imageName3,imageName4,imageName5,imageName6,imageName7}=req.body
        const {image1,image2,image3,image4,image5,image6,image7}=req.files
        const parsedSizes = JSON.parse(sizes);
       if(parsedSizes){
        const product=await potModel.findByIdAndUpdate(req.params.pid,{
            name,description,quantity,offerPercentage,sizeOption,code,slug:slugify(name)
        },{new:true})
         if(sizes){
           product.sizes = parsedSizes
        }
        if(color){
            product.color =JSON.parse(color)
        }
        if(specifications){
            product.specifications =JSON.parse(specifications)
        }
        const saveImage = async (image, productId, index) => {
            const ext = path.extname(image.name);
            const fileName = `image${index + 1}_${productId}.webp`;

            // Use fileURLToPath to get the current directory
            const currentDir = path.dirname(fileURLToPath(import.meta.url));
            const rootDir = path.resolve(currentDir, '../');
            // Create the "images" folder if it doesn't exist
            const imagesDir = path.join(rootDir, 'Potimages');
            if (!fs.existsSync(imagesDir)) {
                fs.mkdirSync(imagesDir);
            }

            const imagePath = path.join(rootDir, 'Potimages', fileName);
            await sharp(image.path)
                .toFormat('webp')
                .toFile(imagePath);

                const imageUrl = `${apiUrl}/api/images/${fileName}`;

                if (index === 0) {
                    product.images.image1 = imageUrl;
                    product.images.imageName1 = imageName1;
                } else if (index === 1) {
                    product.images.image2 = imageUrl;
                    product.images.imageName2 = imageName2;
                } else if (index === 2) {
                    product.images.image3 = imageUrl;
                    product.images.imageName3 = imageName3;
                }
                else if (index === 3) {
                    product.images.image4 = imageUrl;
                    product.images.imageName4 = imageName4;
                }
                else if (index === 4) {
                    product.images.image5 = imageUrl;
                    product.images.imageName5 = imageName5;
                }
                else if (index === 5) {
                    product.images.image6 = imageUrl;
                    product.images.imageName6 = imageName6;
                }
                else if (index === 6) {
                    product.images.image7 = imageUrl;
                    product.images.imageName7 = imageName7;
                }
            };
            if (image1) {
                await saveImage(image1, product._id, 0);
            }
    
            if (image2) {
                await saveImage(image2, product._id, 1);
            }
    
            if (image3) {
                await saveImage(image3, product._id, 2);
            }
            if (image4) {
                await saveImage(image4, product._id, 3);
            }
            if (image5) {
                await saveImage(image5, product._id, 4);
            }
            if (image6) {
                await saveImage(image6, product._id, 5);
            }
            if (image7) {
                await saveImage(image7, product._id, 6);
            }
        await product.save()
       }
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

export const getPotController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = 16;

        const products = await potModel
            .find({})
            .sort({ createdAt: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        res.status(200).send({
            success: true,
            totalCount: products.length,
            message: 'Products fetched successfully',
            products
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error in getting products',
            error: error.message,
        });
    }
};
export const getTotalPotCount = async (req, res) => {
    try {
        const totalCount = await potModel.countDocuments({});
        
        res.status(200).send({
            success: true,
            totalCount: totalCount,
            message: 'Total product count fetched successfully',
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error in getting total product count',
            error: error.message,
        });
    }
};

export const getSinglePotController = async (req, res) => {
    try {
      const product = await potModel
        .findById(req.params.pid)
  
      if (!product) {
        return res.status(404).send({
          success: false,
          message: 'Product not found',
        });
      }
      
      res.status(200).send({product});
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message: 'Error in getting single product',
        error,
      });
    }
};


const deleteImagesByProductId = async (productId) => {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const rootDir = path.resolve(currentDir, '../');
    const imagesDir = path.join(rootDir, 'images');

    const imageFiles = fs.readdirSync(imagesDir);

    imageFiles.forEach((imageFile) => {
        if (imageFile.startsWith(`image1_${productId}.webp`) || 
            imageFile.startsWith(`image2_${productId}.webp`) || 
            imageFile.startsWith(`image3_${productId}.webp`) || 
            imageFile.startsWith(`image4_${productId}.webp`) || 
            imageFile.startsWith(`image5_${productId}.webp`) || 
            imageFile.startsWith(`image6_${productId}.webp`) ||
            imageFile.startsWith(`image7_${productId}.webp`)) {
            const imagePath = path.join(imagesDir, imageFile);
            fs.unlinkSync(imagePath);
        }
    });
};
export const deletePotController =async(req,res)=>{
    const id = req.params.pid
    try {
        deleteImagesByProductId(id);
        await potModel.findByIdAndDelete(id)
        res.status(200).send({
            success:true,
            message:'Product deleted Successfully'
        })
    } catch (error) {
    
        res.status(500).send({
            success:false,
            message:'Error while deleting product',
            error
        })
    }
}