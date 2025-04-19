import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  _id: String,
  code: String,
  name: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: String,
  color: String,
  pots: {
    potName: String,
    potPrice: Number,
  },
  image: String,
  status: {
    type: String,
    enum: [
      'Processing', 
      'Ready to Ship', 
      'Order Shipped', 
      'Order Delivered', 
      'Order Cancelled', 
      'Unable to Process', 
      'Return Requested',
      'Return Approved',
      'Return Rejected',
      'Return Received',
      'Refunded'
    ],
    default: 'Processing',
  },
  offer: Number,
  returnReason: {
    type: String,
    enum: [
      'Damaged Product',
      'Wrong Item Shipped',
      'Product Not as Described',
      'Changed Mind',
      'Other'
    ]
  },
  cancellationReason: String,
  returnedQuantity: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: function(value) {
        return value <= this.quantity;
      },
      message: 'Returned quantity cannot exceed ordered quantity'
    }
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  }
});

const orderSchema = new mongoose.Schema({
  products: [productSchema],
  total: Number,
  refundedAmount: {
    type: Number,
    default: 0
  },
  paymentMethod: String,
  user: {
    type: mongoose.ObjectId,
    ref: 'users',
    required: true,
  },
  orderStatus: {
    type: String,
    enum: [
      'Processing',
      'Shipped',
      'Delivered',
      'Partially Returned',
      'Fully Returned',
      'Cancelled',
      'Refunded'
    ],
    default: 'Processing'
  }
}, { timestamps: true });

// Add methods for product-level operations
orderSchema.methods = {
  requestReturn: function(productId, quantity, reason) {
    const product = this.products.id(productId);
    if (!product) throw new Error('Product not found in order');
    
    if (product.status !== 'Order Delivered') {
      throw new Error('Product must be delivered before returning');
    }
    
    product.status = 'Return Requested';
    product.returnReason = reason;
    product.returnedQuantity = quantity;
    return this.save();
  },
  
  cancelProduct: function(productId, reason) {
    const product = this.products.id(productId);
    if (!product) throw new Error('Product not found in order');
    
    if (!['Processing', 'Ready to Ship'].includes(product.status)) {
      throw new Error('Product can only be cancelled in Processing or Ready to Ship state');
    }
    
    product.status = 'Order Cancelled';
    product.cancellationReason = reason;
    return this.save();
  },
  
  approveReturn: function(productId, refundAmount) {
    const product = this.products.id(productId);
    if (!product) throw new Error('Product not found in order');
    
    if (product.status !== 'Return Requested') {
      throw new Error('Product must have return requested');
    }
    
    product.status = 'Return Approved';
    product.refundAmount = refundAmount;
    return this.save();
  },
  
  completeReturn: function(productId) {
    const product = this.products.id(productId);
    if (!product) throw new Error('Product not found in order');
    
    if (product.status !== 'Return Approved') {
      throw new Error('Product return must be approved first');
    }
    
    product.status = 'Return Received';
    this.refundedAmount += product.refundAmount;
    
    // Update order status if needed
    const allProducts = this.products;
    const returnedProducts = allProducts.filter(p => 
      ['Return Received', 'Refunded'].includes(p.status)
    );
    
    if (returnedProducts.length === allProducts.length) {
      this.orderStatus = 'Fully Returned';
    } else if (returnedProducts.length > 0) {
      this.orderStatus = 'Partially Returned';
    }
    
    return this.save();
  }
};

export default mongoose.model("order", orderSchema);