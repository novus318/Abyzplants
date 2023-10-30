import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";


export const signupController = async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        password,
        city,
        zip,
        landmark,
        address,
      } = req.body;
      //check user
      const existingUser = await userModel.findOne({ email });
      //existing user
      if (existingUser) {
        return res.status(200).send({
          success: false,
          message: "Already registered Please login",
        });
      }
      //register user
      const hashedPassword = await hashPassword(password);
      //save
      const user = await new userModel({
        name,
        email,
        phone,
        city,
        zip,
        landmark,
        address,
        password: hashedPassword,
      }).save();
      const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.status(201).send({
        success: true,
        message: "User Registered successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          city: user.city,
          zip: user.zip,
          landmark: user.landmark,
          address: user.address,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error in Signup",
        error,
      });
    }
  };
  export const loginController = async (req, res) => {
    try {
      const {email,password} = req.body
    
      //check user
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Email is not Registered",
        });
      }
      const match = await comparePassword(password, user.password);
      if (!match) {
        return res.status(200).send({
          success: false,
          message: "Invalid Password",
        });
      }
      //token
      const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.status(200).send({
        success: true,
        message: "Login Successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          city: user.city,
          zip: user.zip,
          landmark: user.landmark,
          address: user.address,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "error in login",
        error,
      });
    }
  };
  export const updateProfileController = async (req, res) => {
    try {
      const {  name,
        email,
        phone,
        city,
        zip,
        landmark,
        address, } = req.body;
      const user = await userModel.findById(req.params.pid);
      const updatedUser = await userModel.findByIdAndUpdate(
        req.params.pid,
        {
          name: name || user.name,
          email: email || user.email,
          phone: phone || user.phone,
          city: city || user.city,
          zip: zip || user.zip,
          landmark: landmark || user.landmark,
          address: address || user.address,
        },
        { new: true }
      ).select('-password');
      res.status(200).send({
        success: true,
        message: "Profile updated successfully",
        updatedUser,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: "Error while updating profile",
        error,
      });
    }
  };
  export const getUsersByRole = async (req, res) => {
    try {
      const users = await userModel.find({ role: 0 });
      res.status(200).send({
        success: true,
        message: 'Users with role 0 retrieved successfully',
        users,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message: 'Error while fetching users by role',
        error,
      });
    }
  };

  export const deleteUserById = async (req, res) => {
    try {
      const userId = req.params.id; 
  
      const deletedUser = await userModel.findByIdAndRemove(userId);
  
      res.status(200).send({
        success: true,
        message: 'User deleted successfully',
        deletedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message: 'Error while deleting the user',
        error,
      });
    }
  };

  export const getUserById = async (req, res) => {
    try {
      const userId = req.params.id;
  
      const user = await userModel.findById(userId).select('name email phone address zip city');
  
      if (!user) {
        return res.status(404).send({
          success: false,
          message: 'User not found',
        });
      }
  
      res.status(200).send({
        success: true,
        message: 'User retrieved successfully',
        user,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message: 'Error while fetching user by ID',
        error,
      });
    }
  };
  