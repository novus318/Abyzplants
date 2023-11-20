import mongoose from 'mongoose';

const sizeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
});

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
  sizes: [sizeSchema],
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
    image1: String,
    image2: String,
    image3: String,
  },
  offerPercentage: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

export default mongoose.model('products', productSchema);