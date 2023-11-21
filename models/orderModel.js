import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  _id: String,
  code: String,
  name: String,
  price: Number,
  quantity: Number,
  size: String,
  image: String,
  status: {
    type: String,
    enum: ['Processing', 'Ready to Ship', 'Order Shipped', 'Order Delivered', 'Order Cancelled', 'Unable to Process', 'Return', 'Refunded'],
    default: 'Processing',
  },
  offer:Number,
});

const orderSchema = new mongoose.Schema({
  products: [productSchema],
  total: Number,
  paymentMethod: String,
  user: {
    type: mongoose.ObjectId,
    ref: 'users',
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("order", orderSchema);
