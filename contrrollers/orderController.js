import orderModel from '../models/orderModel.js' 
import userModel from "../models/userModel.js";
import stripe from 'stripe';
import dotenv from 'dotenv'
// import messagebird from 'messagebird';
dotenv.config({ path: './.env' })
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeInstance = stripe(stripeSecretKey);

const YOUR_DOMAIN = 'http://localhost:3000';

export const createOrderController=async(req,res)=>{
    const { orderDetails, userDetails } = req.body;
    try {
        const newOrder = await new orderModel({
            products: orderDetails.products,
            total: orderDetails.total,
            paymentMethod: orderDetails.paymentMethod,
            user: userDetails._id,
            orderStatus: 'Processing', 
          }).save();
      
          res.json({ success: true, message: 'Your order has been placed successfully',newOrder});
    } catch (error) {
        res.status(500).json({ success: false, message: 'Order placement failed',error});
    }
}

export const getOrdersByUserIdController = async (req, res) => {
    const userId = req.params.pid;
  
    try {
        console.log('User ID:', userId);
      const orders = await orderModel.find({ user: userId }).exec();
  
      if (orders) {
        res.json({ success: true, orders });
      } else {
        res.json({ success: true, message: 'No orders found for the user' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error getting orders', error });
    }
  };
  export const getAllOrdersController = async (req, res) => {
    try {
      const orders = await orderModel.find({}).exec();
  
      if (orders.length > 0) {
        const ordersWithUserDetails = await Promise.all(
          orders.map(async (order) => {
            const user = await userModel.findById(order.user);
            return {
              ...order._doc,
              user: user ? { _id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address, zip: user.zip, city: user.city } : null
            };
          })
        );
  
        res.json({ success: true, orders: ordersWithUserDetails });
      } else {
        res.json({ success: true, message: 'No orders found.' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error getting orders', error });
    }
  };
  export const getOrderByIdWithUserDetails = async (req, res) => {
    const orderId = req.params.pid;
  
    try {
      const order = await orderModel.findById(orderId).exec();
  
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
  
      const user = await userModel.findById(order.user);
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      const orderWithUserDetails = {
        _id: order._id,
        products: order.products,
        total: order.total,
        paymentMethod: order.paymentMethod,
        orderStatus: order.orderStatus,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address:user.address,
          zip: user.zip,
          city: user.city,
        },
      };
  
      res.json({ success: true, order: orderWithUserDetails });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error getting order with user details', error });
    }
  };

  export const createStripeController = async (req, res) => {
    try {
      const { orderDetails } = req.body;
  
      const session = await stripeInstance.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'aed',
              product_data: {
                name: 'Abyzplants',
              },
              unit_amount: orderDetails.total * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}/payment-complete/{CHECKOUT_SESSION_ID}`,
        cancel_url: `${YOUR_DOMAIN}/payment-complete/{CHECKOUT_SESSION_ID}`,
      });
  
      res.json({ sessionId: session.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};


  
  
  export const checkPaymentStatus = async (req,res) => {
    const sessionId = req.params.pid;
    try {
      const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
  
      if (session.payment_status === 'paid') {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      
      res.status(500).json({ success: false, message: 'Error checking payment status' });
    }
  }
  


// const messageBirdClient = messagebird('<YOUR_API_KEY>');


// export const updateOrderStatusAndSendNotification = async (req, res) => {
//   try {
//     const orderId = req.params.orderId;
//     const newStatus = req.body.newStatus; 

//     // Update the order status in your database (orderModel)
//     // Replace this with your code to update the status
//     const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { orderStatus: newStatus });

//     if (!updatedOrder) {
//       return res.status(404).json({ success: false, message: 'Order not found' });
//     }

//     const user = await userModel.findById(updatedOrder.user);
//     switch (newStatus) {
//       case 'Order Delivered':
//         await sendSMSNotification(user.phone, 'Your order is being Delevered.');
//         break;
//       case 'Order Cancelled':
//         await sendSMSNotification(user.phone, 'Your order is Cancelled');
//         break;

//       default:
//         break;
//     }

//     res.json({ success: true, message: 'Order status updated and SMS notification sent' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error updating order status', error });
//   }
// };

// async function sendSMSNotification(phoneNumber, message) {
//   try {
//     const params = {
//       originator: '', // Set your company name or number
//       recipients: [phoneNumber],
//       body: message,
//     };

//     const response = await messageBirdClient.messages.create(params);
//   } catch (error) {
   
//     console.error('Error sending SMS:', error);
//   }
// }
