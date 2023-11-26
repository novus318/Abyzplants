import express from "express";
import ExpressFormidable from "express-formidable";
import { createPotController, deletePotController, getPotController, getSinglePotController, getTotalPotCount, updatePotController } from "../contrrollers/potController.js";

const router = express.Router()

router.post("/createPot", ExpressFormidable(), createPotController);

router.put(
    "/update-pot/:pid",
    ExpressFormidable(),
    updatePotController
);
//get pots
router.get("/get-pot", getPotController);
router.get("/get-potCount", getTotalPotCount);
//single pot
router.get("/get-pot/:pid", getSinglePotController);

//delete pot
router.delete("/delete-pot/:pid", deletePotController);


export default router;