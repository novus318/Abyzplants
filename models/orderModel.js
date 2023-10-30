import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  products: [
    {
      _id: String,
      code: String,
      name: String,
      price: Number,
      quantity: Number,
      size: String,
    }
  ],
total: Number,
paymentMethod: String,
user: {
  type: mongoose.ObjectId,
    ref: 'users',
    required: true,
},
status:{
  type: String,
    enum: ['Processing', 'Ready to Ship', 'Order Shipped', 'Order Delivered', 'Order Cancelled','Unable to Process','Refunded'],
    default: 'Processing',
}
},{timestamps:true});

export default mongoose.model("order", orderSchema);