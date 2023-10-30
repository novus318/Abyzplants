import express from "express";
import ExpressFormidable from "express-formidable";
import { createProductController, deleteProductController, getCategoryController, getProductByCategoryController, getProductController, getRecommendedProductController, getSingleProductController, productPhoto1Controller, productPhoto2Controller, productPhoto3Controller, relatedProductontroller, updateProductController } from "../contrrollers/productController.js";

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
//get-photo
router.get("/product-photo1/:pid", productPhoto1Controller);
router.get("/product-photo2/:pid", productPhoto2Controller);
router.get("/product-photo3/:pid", productPhoto3Controller);
//delete product
router.delete("/delete-product/:pid", deleteProductController);


export default router;