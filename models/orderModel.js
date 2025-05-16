import mongoose from "mongoose";

const returnHistorySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  quantity: Number,
  reason: String,
  status: String,
  refundAmount: Number,
  processedBy: String // Could be 'system' or admin ID
});

const cancellationHistorySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  quantity: Number,
  reason: String,
  refundAmount: Number,
  processedBy: String
});

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
  totalPrice: Number,
  cancelledQuantity: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: function(value) {
        return value <= this.quantity;
      },
      message: 'Cancelled quantity cannot exceed ordered quantity'
    }
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
      'Partially Cancelled',
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
  },
  returnHistory: [returnHistorySchema],
  cancellationHistory: [cancellationHistorySchema]
});

const orderSchema = new mongoose.Schema({
  products: [productSchema],
  total: Number,
  shippingFee: {
    type: Number,
    default: 0
  },
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

// Calculate refund amount for a product
function calculateRefund(product, returnedQty) {
  // Calculate base price (product price + pot price if exists)
  const basePrice = product.price + (product.pots?.potPrice || 0);
  
  // Apply any discount that was given
  const discountedPrice = product.offer 
    ? basePrice * (1 - product.offer / 100)
    : basePrice;
  
  // Return amount is based on the returned quantity
  return discountedPrice * returnedQty;
}

// Add methods for product-level operations
orderSchema.methods = {
  requestReturn: function(productId, quantity, reason) {
    const product = this.products.id(productId);
    if (!product) throw new Error('Product not found in order');
    
    if (!['Order Delivered', 'Return Requested'].includes(product.status)) {
      throw new Error('Product must be delivered or have a pending return request');
    }
    
    if (quantity > product.quantity - product.returnedQuantity) {
      throw new Error('Return quantity exceeds available quantity');
    }
    
    product.status = 'Return Requested';
    product.returnReason = reason;
    product.returnedQuantity += quantity;
    
    // Add to return history
    product.returnHistory.push({
      quantity,
      reason,
      status: 'Requested',
      refundAmount: 0 // Will be set when approved
    });
    
    return this.save();
  },
  
  cancelProduct: function(productId, quantity, reason, processedBy = 'system') {
    const product = this.products.id(productId);
    if (!product) throw new Error('Product not found in order');
    
    if (!['Processing', 'Ready to Ship', 'Partially Cancelled'].includes(product.status)) {
      throw new Error('Product can only be cancelled in Processing, Ready to Ship or Partially Cancelled state');
    }

    const remainingQuantity = product.quantity - product.cancelledQuantity;
    if (quantity > remainingQuantity) {
      throw new Error('Cancellation quantity exceeds remaining quantity');
    }
    
    // Update cancelled quantity
    product.cancelledQuantity += quantity;
    
    // Calculate refund amount for cancelled quantity
    const refundAmount = calculateRefund(product, quantity);
    product.refundAmount += refundAmount;
    
    // Update status based on cancellation
    if (product.cancelledQuantity === product.quantity) {
      product.status = 'Order Cancelled';
    } else if (product.cancelledQuantity > 0) {
      product.status = 'Partially Cancelled';
    }
    
    // Add to cancellation history with quantity and refund amount
    product.cancellationHistory.push({
      quantity,
      reason,
      processedBy,
      refundAmount
    });
    
    // Update order status
    this.updateOrderStatus();
    
    return this.save();
  },
  
  approveReturn: function(productId, adminId) {
    const product = this.products.id(productId);
    if (!product) throw new Error('Product not found in order');
    
    if (product.status !== 'Return Requested') {
      throw new Error('Product must have return requested');
    }
    
    // Find the most recent return request not yet approved
    const lastReturn = product.returnHistory
      .sort((a, b) => b.date - a.date)
      .find(r => r.status === 'Requested');
    
    if (!lastReturn) {
      throw new Error('No pending return request found');
    }
    
    // Calculate refund amount
    const refundAmount = calculateRefund(product, lastReturn.quantity);
    
    product.status = 'Return Approved';
    product.refundAmount = refundAmount;
    
    // Update the return history
    lastReturn.status = 'Approved';
    lastReturn.refundAmount = refundAmount;
    lastReturn.processedBy = adminId;
    
    return this.save();
  },
  
  rejectReturn: function(productId, adminId) {
    const product = this.products.id(productId);
    if (!product) throw new Error('Product not found in order');
    
    if (product.status !== 'Return Requested') {
      throw new Error('Product must have return requested');
    }
    
    // Find the most recent return request
    const lastReturn = product.returnHistory
      .sort((a, b) => b.date - a.date)
      .find(r => r.status === 'Requested');
    
    if (!lastReturn) {
      throw new Error('No pending return request found');
    }
    
    product.status = 'Return Rejected';
    product.returnedQuantity -= lastReturn.quantity;
    
    // Update the return history
    lastReturn.status = 'Rejected';
    lastReturn.processedBy = adminId;
    
    return this.save();
  },
  
  completeReturn: function(productId, adminId) {
    const product = this.products.id(productId);
    if (!product) throw new Error('Product not found in order');
    
    if (product.status !== 'Return Approved') {
      throw new Error('Product return must be approved first');
    }
    
    product.status = 'Return Received';
    this.refundedAmount += product.refundAmount;
    
    // Update the return history
    const lastReturn = product.returnHistory
      .sort((a, b) => b.date - a.date)
      .find(r => r.status === 'Approved');
    
    if (lastReturn) {
      lastReturn.status = 'Completed';
      lastReturn.processedBy = adminId;
    }
    
    // Update order status
    this.updateOrderStatus();
    
    return this.save();
  },
  changeOrderStatus: function(productId,status) {
    const product = this.products.id(productId);
    if (!product) throw new Error('Product not found in order');
    
    product.status = status;
    this.refundedAmount += product.refundAmount;
    
    // Update the return history
    const lastReturn = product.returnHistory
      .sort((a, b) => b.date - a.date)
      .find(r => r.status === 'Approved');
    
    if (lastReturn) {
      lastReturn.status = 'Completed';
    }
    
    // Update order status
    this.updateOrderStatus();
    
    return this.save();
  },
  
  updateOrderStatus: function() {
    const allProducts = this.products;
    
    // Check if all products are cancelled
    if (allProducts.every(p => p.status === 'Order Cancelled')) {
      this.orderStatus = 'Cancelled';
      return;
    }
    
    // Check return statuses
    const returnedProducts = allProducts.filter(p => 
      ['Return Received', 'Refunded'].includes(p.status)
    );
    
    if (returnedProducts.length === allProducts.length) {
      this.orderStatus = 'Fully Returned';
    } else if (returnedProducts.length > 0) {
      this.orderStatus = 'Partially Returned';
    }
    
    // Check other statuses if no returns
    else if (allProducts.every(p => p.status === 'Delivered')) {
      this.orderStatus = 'Delivered';
    } else if (allProducts.every(p => p.status === 'Shipped')) {
      this.orderStatus = 'Shipped';
    } else if (allProducts.some(p => ['Processing', 'Ready to Ship'].includes(p.status))) {
      this.orderStatus = 'Processing';
    }
  }
};

export default mongoose.model("order", orderSchema);