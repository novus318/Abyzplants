import slugify from 'slugify'
import productModel from '../models/productModel.js' 
import potModel from '../models/productPotModel.js'
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
        const {name,code,slug,description,plantCare,sizes,category,quantity,offerPercentage}=req.fields
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

                const imageUrl = `${apiUrl}/api/images/${fileName}`;

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
        res.status(500).send({
            success:false,
            error,
            message:'Error in creating product'
        })
    }
} 
export const getProductController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = 16;  // Adjust this based on your desired page size

        const products = await productModel
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

export const getTotalProductCount = async (req, res) => {
    try {
        const totalCount = await productModel.countDocuments({});
        
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

export const getPlantsController = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = 12; // Adjust this based on your desired page size
      const categoryIds = '6542624166381dcbef355ee9,6542658166381dcbef355f7b,6542664266381dcbef355f8f'; 
  
      // Convert the comma-separated string of category IDs into an array
      const categoryIdArray = categoryIds ? categoryIds.split(',') : [];
  
      // Build the query
      let query = {};
      if (categoryIdArray.length > 0) {
        query = { category: { $in: categoryIdArray } }; // Filter by category IDs
      }
  
      // Fetch products
      const products = await productModel
        .find(query) // Apply the query
        .sort({ createdAt: -1 }) // Sort by creation date (newest first)
        .skip((page - 1) * pageSize) // Pagination: skip previous pages
        .limit(pageSize); // Pagination: limit to the current page size
  
      // Fetch total count of products matching the query (for pagination)
      const totalCount = await productModel.countDocuments(query);
  
      res.status(200).send({
        success: true,
        totalCount, // Total number of products matching the query
        currentPage: page, // Current page number
        pageSize, // Number of products per page
        message: 'Products fetched successfully',
        products,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: 'Error in getting products',
        error: error.message,
      });
    }
  };

export const getTotalPlantsCount = async (req, res) => {
    try {
        const categoryIds = '6542624166381dcbef355ee9,6542658166381dcbef355f7b,6542664266381dcbef355f8f'; 
  
        // Convert the comma-separated string of category IDs into an array
        const categoryIdArray = categoryIds ? categoryIds.split(',') : [];

        let query = {};
      if (categoryIdArray.length > 0) {
        query = { category: { $in: categoryIdArray } }; // Filter by category IDs
      }
        const totalCount = await productModel.find(query).countDocuments({});
        
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

export const getAllProductNamesController = async (req, res) => {
    try {
      const { keyword } = req.query; // Extract the keyword from the query parameters
  
      // Fetch products and pots with necessary fields
      const products = await productModel.find({}, 'name description plantCare');
      const pots = await potModel.find({}, 'name description specifications');
  
      // Function to create a suggestion string
      const createSuggestion = (item) => {
        const { name, description, plantCare, specifications } = item;
        let suggestion = `${name}: ${description}`;
  
        if (plantCare) {
          suggestion += ` | Plant Care: ${plantCare.join(', ')}`;
        }
  
        if (specifications) {
          suggestion += ` | Specifications: ${specifications.join(', ')}`;
        }
  
        return suggestion.length > 100 ? suggestion.substring(0, 100) + '...' : suggestion;
      };
  
      // Create suggestions for products and pots
      const productSuggestions = products.map(createSuggestion);
      const potSuggestions = pots.map(createSuggestion);
  
      // Combine all suggestions
      const allSuggestions = [...productSuggestions, ...potSuggestions];
  
      // Filter suggestions based on the keyword
      const filteredSuggestions = keyword
        ? allSuggestions.filter((suggestion) =>
            suggestion.toLowerCase().includes(keyword.toLowerCase())
          )
        : allSuggestions;
  
      res.status(200).json({
        success: true,
        totalCount: filteredSuggestions.length,
        message: 'Filtered product suggestions',
        suggestions: filteredSuggestions,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Error in getting product suggestions',
        error: error.message,
      });
    }
  };
 
  export const searchProductsController = async (req, res) => {
    try {
      const { keyword } = req.params;
  
      // Extract the name from the suggestion (assuming the suggestion format is "name: description...")
      const nameFromSuggestion = keyword.split(':')[0].trim();
  
      // Search in products collection
      const products = await productModel.find({
        $or: [
          { name: { $regex: new RegExp(nameFromSuggestion, 'i') } },
          { description: { $regex: new RegExp(nameFromSuggestion, 'i') } },
          { plantCare: { $regex: new RegExp(nameFromSuggestion, 'i') } },
        ],
      });
  
      // Search in pots collection
      const pots = await potModel.find({
        $or: [
          { name: { $regex: new RegExp(nameFromSuggestion, 'i') } },
          { description: { $regex: new RegExp(nameFromSuggestion, 'i') } },
          { specifications: { $regex: new RegExp(nameFromSuggestion, 'i') } },
        ],
      });
  
      // Combine results
      const results = [...products, ...pots];
  
      res.status(200).send({
        success: true,
        totalCount: results.length,
        message: 'Products matching the search keyword',
            products,
            pots
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: 'Error in searching for products',
        error: error.message,
      });
    }
  };


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
        .findById(req.params.pid).populate('category')
  
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
        const {name,slug,description,sizes,plantCare,quantity,offerPercentage}=req.fields
        const {image1,image2,image3} =req.files
        const parsedSizes = JSON.parse(sizes);
       if(parsedSizes){
        const product=await productModel.findByIdAndUpdate(req.params.pid,{
            name,slug,description,quantity,offerPercentage,slug:slugify(name)
        },{new:true})
         if(sizes){
           product.sizes = parsedSizes
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

                const imageUrl = `${apiUrl}/api/images/${fileName}`;

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
    
        res.status(500).send({
            success:false,
            message:'Error while deleting product',
            error
        })
    }
}
export const getCategoryController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = 16; 
        const categoryId = req.params.pid;
        const category = await categoryModel.findById(categoryId);
  
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const totalProductsCount = await productModel.countDocuments({ category: categoryId });

        const products = await productModel.find({ category: categoryId }).sort({ createdAt: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize);
      
        res.status(200).json({ category, products, totalCount: totalProductsCount });
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
        }).populate("category").limit(10)
        
        res.status(200).send({
            success:true,
            products
        })
    } catch (error) {
    
        res.status(400).send({
            success:false,
            message:'Error while getting product',
            error
        })
    }
}
export const getProductByCategoryController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = 16; 
      const categoryId = req.params.pid;
      const category = await categoryModel.findById(categoryId).sort({ createdAt: -1 }).limit(pageSize)
      .skip((page - 1) * pageSize);
  
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      const products = await productModel.find({ category: categoryId }).limit(30);;
     
      res.status(200).json({products});
    } catch (error) {
      res.status(500).json({ message: 'Error fetching category and products' });
    }
  };
