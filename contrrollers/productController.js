import slugify from 'slugify'
import productModel from '../models/productModel.js' 
import categoryModel from "../models/categoryModel.js";
import fs from 'fs'
import path from 'path';
import sharp from 'sharp';
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';
dotenv.config("../.env")

const apiUrl = process.env.REACT_APP_API_URL;
export const createProductController=async(req,res)=>{
    try {
        const {name,code,slug,description,plantCare,price,sizes,category,quantity,offerPercentage}=req.fields
        const {image1,image2,image3} =req.files
       
        const existingProduct = await productModel.findOne({ $or: [{ code }, { slug }] });

        if (existingProduct) {
          return res.status(400).send({
            success: false,
            message: 'A product with the same code already exists.',
          });
        }
        const product=new productModel({...req.fields,slug:slugify(name)})

        if(sizes){
            product.sizes =JSON.parse(sizes)
        }
        if(plantCare){
            product.plantCare =JSON.parse(plantCare)
        }

        const saveImage = async (image, productId, index) => {
            const ext = path.extname(image.name);
            const fileName = `image${index + 1}_${productId}.webp`;

            // Use fileURLToPath to get the current directory
            const currentDir = path.dirname(fileURLToPath(import.meta.url));
            const rootDir = path.resolve(currentDir, '../');
            // Create the "images" folder if it doesn't exist
            const imagesDir = path.join(rootDir, 'images');
            if (!fs.existsSync(imagesDir)) {
                fs.mkdirSync(imagesDir);
            }

            const imagePath = path.join(rootDir, 'images', fileName);
            await sharp(image.path)
                .toFormat('webp')
                .toFile(imagePath);

                const imageUrl = `${apiUrl}/images/${fileName}`;

                if (index === 0) {
                    product.photo.image1 = imageUrl;
                } else if (index === 1) {
                    product.photo.image2 = imageUrl;
                } else if (index === 2) {
                    product.photo.image3 = imageUrl;
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
        await product.save();
        res.status(201).send({
            success:true,
            message:'Product created successfully',
            product
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:'Error in creating product'
        })
    }
} 
export const getProductController = async (req, res) => {
    try {
        const products = await productModel.find({}).limit(15).sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            totalCount: products.length,
            message: 'All products',
            products
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in getting products',
            error: error.message,
        });
    }
}

export const getRecommendedProductController= async(req,res)=>{
    try {
        const products=await productModel.find({}).populate('category').limit(15).sort({createdAt:1})
        

        res.status(200).send({
            success:true,
            totalCount:products.length,
            message:'All products',
            products
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            
            success:false,
            message:"Error in getting products",
            error:error.message
        })
    }
}
export const getSingleProductController = async (req, res) => {
    try {
      const product = await productModel
        .findById(req.params.pid)
        .populate('category')
  
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


export const updateProductController=async(req,res)=>{
    try {
        const {name,slug,description,price,sizes,plantCare,quantity,offerPercentage}=req.fields
        const {image1,image2,image3} =req.files
        
        const product=await productModel.findByIdAndUpdate(req.params.pid,{
            ...req.fields,slug:slugify(name)
        },{new:true})
         if(sizes){
            product.sizes =JSON.parse(sizes)
        }
        if(plantCare){
            product.plantCare =JSON.parse(plantCare)
        }
        const saveImage = async (image, productId, index) => {
            const ext = path.extname(image.name);
            const fileName = `image${index + 1}_${productId}.webp`;

            // Use fileURLToPath to get the current directory
            const currentDir = path.dirname(fileURLToPath(import.meta.url));
            const rootDir = path.resolve(currentDir, '../');
            // Create the "images" folder if it doesn't exist
            const imagesDir = path.join(rootDir, 'images');
            if (!fs.existsSync(imagesDir)) {
                fs.mkdirSync(imagesDir);
            }

            const imagePath = path.join(rootDir, 'images', fileName);
            await sharp(image.path)
                .toFormat('webp')
                .toFile(imagePath);

                const imageUrl = `${apiUrl}/images/${fileName}`;

                if (index === 0) {
                    product.photo.image1 = imageUrl;
                } else if (index === 1) {
                    product.photo.image2 = imageUrl;
                } else if (index === 2) {
                    product.photo.image3 = imageUrl;
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
        await product.save()
        res.status(201).send({
            success:true,
            message:'Product updated successfully',
            product
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:'Error in updating product'
        })
    }
} 
const deleteImagesByProductId = async (productId) => {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const rootDir = path.resolve(currentDir, '../');
    const imagesDir = path.join(rootDir, 'images');

    const imageFiles = fs.readdirSync(imagesDir);

    imageFiles.forEach((imageFile) => {
        if (imageFile.startsWith(`image1_${productId}.webp`) || 
            imageFile.startsWith(`image2_${productId}.webp`) || 
            imageFile.startsWith(`image3_${productId}.webp`)) {
            const imagePath = path.join(imagesDir, imageFile);
            fs.unlinkSync(imagePath);
        }
    });
};
export const deleteProductController =async(req,res)=>{
    const id = req.params.pid
    try {
        deleteImagesByProductId(id);
        await productModel.findByIdAndDelete(id)
        res.status(200).send({
            success:true,
            message:'Product deleted Successfully'
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:'Error while deleting product',
            error
        })
    }
}
export const getCategoryController = async (req, res) => {
    try {
      const categoryId = req.params.pid;
      const category = await categoryModel.findById(categoryId);
  
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      const products = await productModel.find({ category: categoryId });
      
      res.status(200).json({ category, products });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching category and products' });
    }
  };
export const relatedProductontroller =async(req,res)=>{
    try {
        const {pid,cid}=req.params
        const products=await productModel.find({
            category:cid,
            _id:{$ne:pid}
        }).limit(15).populate("category")
        
        res.status(200).send({
            success:true,
            products
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success:false,
            message:'Error while getting product',
            error
        })
    }
}
export const getProductByCategoryController = async (req, res) => {
    try {
      const categoryId = req.params.pid;
      const category = await categoryModel.findById(categoryId);
  
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      const products = await productModel.find({ category: categoryId }).limit(30);;
     
      res.status(200).json({products});
    } catch (error) {
      res.status(500).json({ message: 'Error fetching category and products' });
    }
  };
