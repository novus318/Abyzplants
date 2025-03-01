import mongoose from 'mongoose';

const sizeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const colorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
});

const potSchema = new mongoose.Schema({
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
  specifications: [
    {
      type: String,
    },
  ],
  sizeOption:{
    type:String,
    required:true
  },
  sizes: [sizeSchema],
  quantity: {
    type: Number,
    required: true,
  },
  offerPercentage: {
    type: Number,
    required: true,
  },
  colors: [colorSchema],
  images: {
    image1:String,
  imageName1:String,
  image2:String,
  imageName2:String,
  image3:String,
  imageName3:String,
  image4:String,
  imageName4:String,
  image5:String,
  imageName5:String,
  image6:String,
  imageName6:String,
  image7:String,
  imageName7:String,
  },
}, { timestamps: true });

export default mongoose.model('pots', potSchema);

