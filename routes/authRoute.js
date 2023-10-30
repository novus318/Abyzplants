import express  from "express";
import { deleteUserById, getUserById, getUsersByRole, loginController, signupController, updateProfileController } from "../contrrollers/authController.js";
const router=express.Router()

router.post('/signup',signupController)

router.post('/login',loginController)
router.put('/profile/:pid',updateProfileController)
router.get('/users/role', getUsersByRole);
router.delete('/users/:id', deleteUserById);
router.get('/users/:id', getUserById);

export default router