import express from "express";
import ExpressFormidable from "express-formidable";
import { createProductController, deleteProductController, getCategoryController, getProductByCategoryController, getProductController, getRecommendedProductController, getSingleProductController, relatedProductontroller, updateProductController } from "../contrrollers/productController.js";

const router = express.Router()

router.post("/create-product", ExpressFormidable(), createProductController);

router.put(
    "/update-product/:pid",
    ExpressFormidable(),
    updateProductController
);
//get products
router.get("/get-product", getProductController);
router.get("/get-byCategory/:pid",getCategoryController);
router.get("/get-ProductbyCategory/:pid",getProductByCategoryController);
router.get('/related-product/:pid/:cid',relatedProductontroller)

router.get("/get-recommended", getRecommendedProductController);
//single product
router.get("/get-product/:pid", getSingleProductController);

//delete product
router.delete("/delete-product/:pid", deleteProductController);


export default router;