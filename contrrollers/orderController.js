import orderModel from '../models/orderModel.js' 
import userModel from "../models/userModel.js";
import stripe from 'stripe';
import dotenv from 'dotenv'
import nodemailer from 'nodemailer';
dotenv.config("../.env")

const apiUrl = process.env.REACT_APP_API_URL;
const appUrl = process.env.API_URL;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeInstance = stripe(stripeSecretKey);
const mailPass =process.env.MAIL_PASS

const transporter = nodemailer.createTransport({
  service:'hotmail',
  auth: {
    user: 'info@abyzplants.com',
    pass: `${mailPass}#`,
  },
});

export const createOrderController = async (req, res) => {
  const { orderDetails, userDetails } = req.body;

  try {
    const user = await userModel.findById(userDetails._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const products = orderDetails.products;

    const newOrder = await new orderModel({
      products,
      total: orderDetails.total,
      paymentMethod: orderDetails.paymentMethod,
      user: userDetails._id,
      orderStatus: 'Processing',
    }).save();

    const mailOptions = {
      from: 'info@abyzplants.com',
      to: user.email,
      subject: 'Your Order Confirmation',
      html: `
      <div style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0px 2px 5px #ccc; max-width: 600px; margin: 0 auto;">
        <img style="background-color: #ffffff;" src="https://upload.wikimedia.org/wikipedia/commons/1/15/Abyzplants_logo.png" alt="Abyzplants Logo" width="200">
          <h1 style="color: #333; font-size: 24px;">Order Confirmation</h1>
          <p>Dear ${user.name},</p>
          <p>Thank you for placing your order with Abyzplants.</p>
          <p><strong>Order Status:</strong> Processing</p>
          <p><strong>Order Amount:</strong> ${orderDetails.total} AED</p>
          <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
          <p><strong>Order Date:</strong> ${new Date().toDateString()}</p>
          <p>We are happy to inform you that your order with Abyzplants has been successfully placed and is currently being processed. Your order is on the way.</p>
          <p>Company Details:</p>
          <p style="color: #333; font-size: 18px;"><strong>Abyzplants</strong></p>
          <p>International City - Dubai - United Arab Emirates</p>
          <ul>
            <li>Website: <a href="https://www.abyzplants.com" style="color: #007bff; text-decoration: none;">https://www.abyzplants.com</a></li>
            <li>Phone: <a href="tel:+971589537998" style="color: #007bff; text-decoration: none;">+971 58 953 7998</a></li>
          </ul>
        </div>
      </div>
      `,
    };

    const sendEmail = () => {
      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            reject(error);
          } else {
            resolve(info);
          }
        });
      });
    };

    const emailInfo = await sendEmail();

    res.json({
      success: true,
      message: 'Your order has been placed successfully. Check your email',
      newOrder,
      emailInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Order placement failed',
      error,
    });
  }
};


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
        success_url: `${appUrl}/payment-complete/{CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/payment-complete/{CHECKOUT_SESSION_ID}`,
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
  
  export const returnOrderStatusAndSendNotification = async (req, res) => {
    try {
      console.log(req.body)
      const orderId = req.params.orderId;
      const newStatus = req.body.newStatus; 
      const accountDetails = req.body.formData
 
      const updatedOrder = await orderModel.findByIdAndUpdate(orderId, {status: newStatus });
 
      if (!updatedOrder) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      if(newStatus === 'Return'){
        const mailOptions = {
          from: 'info@abyzplants.com',
          to: 'abyzplants@gmail.com',
          subject: 'Customer returned order',
          html: `
      <div style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0px 2px 5px #ccc; max-width: 600px; margin: 0 auto;">
          <img style="background-color: #ffffff;" src="https://upload.wikimedia.org/wikipedia/commons/1/15/Abyzplants_logo.png" alt="Abyzplants Logo" width="200">
          
          <p style="font-size: 18px; margin-top: 20px;">Order ID: ${orderId.substring(16)}</p>
          
          <div style="margin-top: 20px;">
            <p style="font-size: 16px; margin-bottom: 10px;">Customer Account Details:</p>
            <p style="font-size: 14px; margin-bottom: 5px;">Name: ${accountDetails.name}</p>
            <p style="font-size: 14px; margin-bottom: 5px;">Mobile Number: ${accountDetails.number}</p>
            <p style="font-size: 14px; margin-bottom: 5px;">Account Number: ${accountDetails.account}</p>
            <p style="font-size: 14px;">IBAN: ${accountDetails.iban}</p>
          </div>
          <div style="margin-top: 20px;">
          <p style="font-size: 16px; margin-bottom: 10px;">Reason for Return:</p>
          <p style="font-size: 14px;">${accountDetails.reason}</p>
        </div>
        </div>
      </div>
    `,
  };
        
    
        const sendEmail = () => {
          return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                reject(error);
              } else {
                resolve(info);
              }
            });
          });
        };
        sendEmail()
      }
      res.status(200).json({ success: true, message: 'Order status updated and SMS notification sent' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating order status', error });
    }
  };
 export const updateOrderStatusAndSendNotification = async (req, res) => {
   try {
     const orderId = req.params.orderId;
     const newStatus = req.body.newStatus; 

     const updatedOrder = await orderModel.findByIdAndUpdate(orderId, {status: newStatus });

     if (!updatedOrder) {
       return res.status(404).json({ success: false, message: 'Order not found' });
     }
     switch (newStatus) {
      case 'Order Shipped':
       await sendOrderShippedNotification(updatedOrder,orderId)
        break;
      case 'Order Delivered':
        await sendOrderDeliveredNotification(updatedOrder,orderId);
        break;
      case 'Order Cancelled':
        await sendOrderCancelledNotification(updatedOrder,orderId);
        break;
      case 'Unable to Process':
        await sendUnableToProcessNotification(updatedOrder,orderId);
        break;
      case 'Refunded':
        await sendRefundedNotification(updatedOrder,orderId);
        break;
      default:
        break;
    }

     res.status(200).json({ success: true, message: 'Order status updated and SMS notification sent' });
   } catch (error) {
     res.status(500).json({ success: false, message: 'Error updating order status', error });
   }
 };
 const sendOrderDeliveredNotification = async (updatedOrder,orderId) =>{
  try {
    const user = await userModel.findById(updatedOrder.user);
    const mailOptions = {
      from: 'info@abyzplants.com',
      to: user.email,
      subject: 'Your Order Delivered',
      html: `
        <div style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0px 2px 5px #ccc; max-width: 600px; margin: 0 auto;">
            <img style="background-color: #ffffff;" src="https://upload.wikimedia.org/wikipedia/commons/1/15/Abyzplants_logo.png" alt="Abyzplants Logo" width="200">
            <h1 style="color: #333; font-size: 24px;">Order Delivered</h1>
            <p>Dear ${user.name},</p>
            <p>We are delighted to inform you that your order with Abyzplants has been successfully delivered.</p>
            <p><strong>Order ID:</strong> ${orderId.substring(16)}</p>
            <p><strong>Order Status:</strong> Delivered</p>
            <p><strong>Order Amount: </strong>${updatedOrder.total} AED</p>
            <p><strong>Payment Method:</strong> ${updatedOrder.paymentMethod}</p>
            <p><strong>Delivery Date:</strong> ${new Date().toDateString()}</p>
            <p>Thank you for choosing Abyzplants. We hope you are satisfied with your order. If you have any feedback or inquiries, please feel free to contact us.</p>
            <p>Company Details:</p>
            <p style="color: #333; font-size: 18px;"><strong>Abyzplants</strong></p>
            <p>International City - Dubai - United Arab Emirates</p>
            <ul>
              <li>Website: <a href="https://www.abyzplants.com" style="color: #007bff; text-decoration: none;">https://www.abyzplants.com</a></li>
              <li>Phone: <a href="tel:+971589537998" style="color: #007bff; text-decoration: none;">+971 58 953 7998</a></li>
            </ul>
          </div>
        </div>
      `,
    };
    

    const sendEmail = () => {
      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            reject(error);
          } else {
            resolve(info);
          }
        });
      });
    };
    sendEmail()
  } catch (error) {
    console.log(error)
  }
};
 const sendOrderShippedNotification = async (updatedOrder,orderId) =>{
  try {
    const user = await userModel.findById(updatedOrder.user);
    const mailOptions = {
      from: 'info@abyzplants.com',
      to: user.email,
      subject: 'Your Order Has Been Shipped',
      html: `
        <div style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0px 2px 5px #ccc; max-width: 600px; margin: 0 auto;">
            <img style="background-color: #ffffff;" src="https://upload.wikimedia.org/wikipedia/commons/1/15/Abyzplants_logo.png" alt="Abyzplants Logo" width="200">
            <h1 style="color: #333; font-size: 24px;">Your Order Has Been Shipped</h1>
            <p>Dear ${user.name},</p>
            <p>We are excited to inform you that your order with Abyzplants has been shipped and is on its way to you.</p>
            <p><strong>Order ID:</strong> ${orderId.substring(16)}</p>
            <p><strong>Order Status:</strong> Shipped</p>
            <p><strong>Order Amount:</strong>${updatedOrder.total} AED</p>
            <p><strong>Expected Delivery Date : </strong> Within 2 days</p>
            <p>If you have any questions or need assistance, please don't hesitate to reach out to our customer support team. Thank you for choosing us for your online shopping needs.</p>
            <p>Company Details:</p>
            <p style="color: #333; font-size: 18px;"><strong>Abyzplants</strong></p>
            <p>International City - Dubai - United Arab Emirates</p>
            <ul>
              <li>Website: <a href="https://www.abyzplants.com" style="color: #007bff; text-decoration: none;">https://www.abyzplants.com</a></li>
              <li>Phone: <a href="tel:+971589537998" style="color: #007bff; text-decoration: none;">+971 58 953 7998</a></li>
            </ul>
          </div>
        </div>
      `,
    };
    
    

    const sendEmail = () => {
      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            reject(error);
          } else {
            resolve(info);
          }
        });
      });
    };
    sendEmail()
  } catch (error) {
    console.log(error)
  }
 }
 const sendOrderCancelledNotification = async (updatedOrder,orderId) =>{
  try {
    const user = await userModel.findById(updatedOrder.user);

    const mailOptions = {
      from: 'info@abyzplants.com',
      to: user.email,
      subject: 'Your Order Has Been Cancelled',
      html: `
        <div style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0px 2px 5px #ccc; max-width: 600px; margin: 0 auto;">
            <img style="background-color: #ffffff;" src="https://upload.wikimedia.org/wikipedia/commons/1/15/Abyzplants_logo.png" alt="Abyzplants Logo" width="200">
            <h1 style="color: #333; font-size: 24px;">Your Order Has Been Cancelled</h1>
            <p>Dear ${user.name},</p>
            <p>We regret to inform you that your order with Abyzplants has been cancelled.</p>
            <p><strong>Order ID:</strong> ${orderId.substring(16)}</p>
            <p><strong>Order Status:</strong> Cancelled</p>
            <p><strong>Order Amount:</strong> ${updatedOrder.total} AED</p>
            <p>If you have any questions or require further assistance regarding this cancellation, please don't hesitate to contact us.</p>
            <p>Company Details:</p>
            <p style="color: #333; font-size: 18px;"><strong>Abyzplants</strong></p>
            <p>International City - Dubai - United Arab Emirates</p>
            <ul>
              <li>Website: <a href="https://www.abyzplants.com" style="color: #007bff; text-decoration: none;">https://www.abyzplants.com</a></li>
              <li>Phone: <a href="tel:+971589537998" style="color: #007bff; text-decoration: none;">+971 58 953 7998</a></li>
            </ul>
          </div>
        </div>
      `,
    };
    
    

    const sendEmail = () => {
      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            reject(error);
          } else {
            resolve(info);
          }
        });
      });
    };
    sendEmail()
  } catch (error) {
    console.log(error)
  }
 }
 const sendUnableToProcessNotification = async (updatedOrder,orderId) =>{
  try {
    const user = await userModel.findById(updatedOrder.user);
    const mailOptions = {
      from: 'info@abyzplants.com',
      to: user.email,
      subject: 'Unable to Process Your Order',
      html: `
        <div style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0px 2px 5px #ccc; max-width: 600px; margin: 0 auto;">
            <img style="background-color: #ffffff;" src="https://upload.wikimedia.org/wikipedia/commons/1/15/Abyzplants_logo.png" alt="Abyzplants Logo" width="200">
            <h1 style="color: #333; font-size: 24px;">Unable to Process Your Order</h1>
            <p>Dear ${user.name},</p>
            <p>We regret to inform you that we are unable to process your order with Abyzplants at this time.</p>
            <p><strong>Order ID:</strong> ${orderId.substring(16)}</p>
            <p><strong>Order Status:</strong> Unable to Process</p>
            <p><strong>Order Amount:</strong> ${updatedOrder.total} AED</p>
            <p>If you have any questions or concerns regarding this issue, please don't hesitate to contact us for further assistance.</p>
            <p>Company Details:</p>
            <p style="color: #333; font-size: 18px;"><strong>Abyzplants</strong></p>
            <p>International City - Dubai - United Arab Emirates</p>
            <ul>
              <li>Website: <a href="https://www.abyzplants.com" style="color: #007bff; text-decoration: none;">https://www.abyzplants.com</a></li>
              <li>Phone: <a href="tel:+971589537998" style="color: #007bff; text-decoration: none;">+971 58 953 7998</a></li>
            </ul>
          </div>
        </div>
      `,
    };
    
    

    const sendEmail = () => {
      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            reject(error);
          } else {
            resolve(info);
          }
        });
      });
    };
    sendEmail()
  } catch (error) {
    console.log(error)
  }
 }
 const sendRefundedNotification = async (updatedOrder,orderId) =>{
  try {
    const user = await userModel.findById(updatedOrder.user);
    const mailOptions = {
      from: 'info@abyzplants.com',
      to: user.email,
      subject: 'Refund Confirmation for Your Order',
      html: `
        <div style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0px 2px 5px #ccc; max-width: 600px; margin: 0 auto;">
            <img style="background-color: #ffffff;" src="https://upload.wikimedia.org/wikipedia/commons/1/15/Abyzplants_logo.png" alt="Abyzplants Logo" width="200">
            <h1 style="color: #333; font-size: 24px;">Refund Confirmation</h1>
            <p>Dear ${user.name},</p>
            <p>We are pleased to inform you that a refund has been processed for your order with Abyzplants.</p>
            <p><strong>Order ID:</strong> ${orderId.substring(16)}</p>
            <p><strong>Order Status:</strong> Refunded</p>
            <p>The refund has been successfully processed, and the refunded amount should be reflected in your account within a few business days. If you have any questions or require further assistance, please feel free to contact us.</p>
            <p>Company Details:</p>
            <p style="color: #333; font-size: 18px;"><strong>Abyzplants</strong></p>
            <p>International City - Dubai - United Arab Emirates</p>
            <ul>
              <li>Website: <a href="https://www.abyzplants.com" style="color: #007bff; text-decoration: none;">https://www.abyzplants.com</a></li>
              <li>Phone: <a href="tel:+971589537998" style="color: #007bff; text-decoration: none;">+971 58 953 7998</a></li>
            </ul>
          </div>
        </div>
      `,
    };
    
    

    const sendEmail = () => {
      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            reject(error);
          } else {
            resolve(info);
          }
        });
      });
    };
    sendEmail()
  } catch (error) {
    console.log(error)
  }
 }