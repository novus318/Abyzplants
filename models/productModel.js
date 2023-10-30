import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  plantCare: [
    {
      type: String,
    },
  ],
  price: {
    type: String,
    required: true,
  },
  sizes: [
    {
      type: String,
    },
  ],
  category: {
    type: mongoose.ObjectId,
    ref: 'category',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  photo: {
    image1: {
      data: Buffer,
      contentType: String,
    },
    image2: {
      data: Buffer,
      contentType: String,
    },
    image3: {
      data: Buffer,
      contentType: String,
    },
  },
  offerPercentage:{
    type: Number,
    required: true,
  }
}, { timestamps: true });

export default mongoose.model('products', productSchema);
