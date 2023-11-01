import slugify from 'slugify'
import productModel from '../models/productModel.js' 
import categoryModel from "../models/categoryModel.js";
import fs from 'fs'
import dotenv from 'dotenv'
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
        if(image1){
            product.photo.image1.data =fs.readFileSync(image1.path)
            product.photo.image1.contentType =image1.type
        }
        if(image2){
            product.photo.image2.data =fs.readFileSync(image2.path)
            product.photo.image2.contentType =image2.type
        }
        if(image3){
            product.photo.image3.data =fs.readFileSync(image3.path)
            product.photo.image3.contentType =image3.type
        }
        await product.save()
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
        const products = await productModel.find({}).select('-photo').limit(15).sort({ createdAt: -1 });

        const productsWithImageUrls = await Promise.all(products.map(async product => {
            const photoUrl = `${apiUrl}/api/product/product-photo1/${product._id}`;
            return {
                ...product._doc,
                image: photoUrl,
            };
        }));

        res.status(200).send({
            success: true,
            totalCount: productsWithImageUrls.length,
            message: 'All products',
            products: productsWithImageUrls,
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
        const products=await productModel.find({}).populate('category').select('-photo').limit(15).sort({createdAt:1})
        const productsWithImageUrls = await Promise.all(products.map(async product => {
            const photoUrl = `${apiUrl}/api/product/product-photo1/${product._id}`;
            return {
                ...product._doc,
                image: photoUrl,
            };
        }));

        res.status(200).send({
            success:true,
            totalCount:products.length,
            message:'All products',
            products: productsWithImageUrls
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
        .populate('category').select('-photo');
  
      if (!product) {
        return res.status(404).send({
          success: false,
          message: 'Product not found',
        });
      }
      
      // Construct the image URLs
      const photoUrls = {
        image1: `${apiUrl}/api/product/product-photo1/${product._id}`,
        image2: `${apiUrl}/api/product/product-photo2/${product._id}`,
        image3: `${apiUrl}/api/product/product-photo3/${product._id}`,
      };
    
  
      res.status(200).send({product,photoUrls});
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message: 'Error in getting single product',
        error,
      });
    }
};


  
export const productPhoto1Controller=async(req,res)=>{
    try {
        const product=await productModel.findById(req.params.pid).select('photo')
        if(product.photo.image1.data){
            res.set('Content-type',product.photo.image1.contentType)
            return res.status(200).send(product.photo.image1.data)
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:'error while getting photo',
            error
        })
    }
}
export const productPhoto2Controller=async(req,res)=>{
    try {
        const product=await productModel.findById(req.params.pid).select('photo')
        if(product.photo.image2.data){
            res.set('Content-type',product.photo.image2.contentType)
            return res.status(200).send(product.photo.image2.data)
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:'error while getting photo',
            error
        })
    }
}
export const productPhoto3Controller=async(req,res)=>{
    try {
        const product=await productModel.findById(req.params.pid).select('photo')
        if(product.photo.image3.data){
            res.set('Content-type',product.photo.image3.contentType)
            return res.status(200).send(product.photo.image3.data)
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:'error while getting photo',
            error
        })
    }
}
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
        if(image1){
            product.photo.image1.data =fs.readFileSync(image1.path)
            product.photo.image1.contentType =image1.type
        }
        if(image2){
            product.photo.image2.data =fs.readFileSync(image2.path)
            product.photo.image2.contentType =image2.type
        }
        if(image3){
            product.photo.image3.data =fs.readFileSync(image3.path)
            product.photo.image3.contentType =image3.type
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

export const deleteProductController =async(req,res)=>{
    try {
        await productModel.findByIdAndDelete(req.params.pid).select("-photo")
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
      const productsWithImageUrls = await Promise.all(products.map(async product => {
        const photoUrl = `${apiUrl}/api/product/product-photo1/${product._id}`;
        return {
            ...product._doc,
            image: photoUrl,
        };
    }));
      res.status(200).json({ category, products: productsWithImageUrls });
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
        }).select('-photo').limit(15).populate("category")
        const productsWithImageUrls = await Promise.all(products.map(async product => {
            const photoUrl = `${apiUrl}/api/product/product-photo1/${product._id}`;
            return {
                ...product._doc,
                image: photoUrl,
            };
        }));
        res.status(200).send({
            success:true,
            products:productsWithImageUrls
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
      const products = await productModel.find({ category: categoryId }).select('-photo').limit(30);;
      const productsWithImageUrls = await Promise.all(products.map(async product => {
        const photoUrl = `${apiUrl}/api/product/product-photo1/${product._id}`;
        return {
            ...product._doc,
            image: photoUrl,
        };
    }));
      res.status(200).json({products: productsWithImageUrls});
    } catch (error) {
      res.status(500).json({ message: 'Error fetching category and products' });
    }
  };
