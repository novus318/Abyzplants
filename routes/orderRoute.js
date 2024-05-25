import express  from "express";
import { checkPaymentStatus, createOrderController, createStripeController, getAllOrdersController, getOrderByIdWithUserDetails, getOrdersByUserIdController, returnOrderStatusAndSendNotification, updateOrderStatusAndSendNotification } from "../contrrollers/orderController.js";
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",  
    secure: true,
    secureConnection: false,
    tls: {
        ciphers:'SSLv3'
    },
    requireTLS:true,
    port: 465,
    debug: true,
    auth: {
        user: "support@tlonline.shop",
        pass: "Enzo@2024" 
    }
  });


const router=express.Router()

router.post('/create-order',createOrderController)
router.get('/get-order/:pid',getOrdersByUserIdController)
router.get('/get-allOrders',getAllOrdersController)
router.get('/get-orderById/:pid',getOrderByIdWithUserDetails)
router.post('/checkout-stripe',createStripeController)
router.get('/check-payment-status/:pid',checkPaymentStatus)
router.put('/orders/:orderId/:productId',updateOrderStatusAndSendNotification)
router.put('/returnOrder/:orderId/:productId',returnOrderStatusAndSendNotification)



const sendOrderEmail = async (user, products, totalPrice, paymentMethod) => {
    const productDetails = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f5f5f5; border-bottom: 2px solid #ddd;">
              <th style="padding: 10px; text-align: center;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: center;">Size</th>
              <th style="padding: 10px; text-align: center;">Color</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(product => `
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; text-align: center;">${product.code}</td>
                <td style="padding: 10px; text-align: center;">${product.quantity}</td>
                <td style="padding: 10px; text-align: center;">${product.size}</td>
                <td style="padding: 10px; text-align: center;">${product.color}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
    `;

    const customerDetails = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
                <tr style="background-color: #f5f5f5; border-bottom: 2px solid #ddd;">
                    <th style="padding: 10px; text-align: center;">Name</th>
                    <th style="padding: 10px; text-align: center;">Phone</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 10px; text-align: center;">${user.name}</td>
                    <td style="padding: 10px; text-align: center;">+971${user.mobileNumber}</td>
                </tr>
            </tbody>
        </table>
        <p><strong>Address:</strong> ${user.address}</p>
    `;

    // const recipients = ['mohamed.iqbal53@gmail.com', 'nizamudheen318@gmail.com'];
    const recipients = ['nizamudheen.tech@gmail.com', 'nizamudheen318@gmail.com'];
    const sendEmail = async (recipient) => {
        const mailOptions = {
            from: 'support@tlonline.shop',
            to: recipient,
            subject: 'New order has been placed',
            html: `
                <div style="background-color: #f5f5f5; padding: 10px; font-family: Arial, sans-serif;">
                    <div style="background-color: #ffffff; padding: 10px; border-radius: 5px; box-shadow: 0px 2px 5px #ccc; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #333; font-size: 18px;">Order Confirmation</h1>
                        <p>Dear Iqbal,</p>
                        <p>A new order has been placed by a customer.</p>
                        <p><strong>Order Amount:</strong> ${totalPrice} AED</p>
                        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                        <p><strong>Order Date:</strong> ${new Date().toDateString()}</p>
                        <h2 style="color: #333; font-size: 20px; margin-top: 20px;">Ordered Products</h2>
                        ${productDetails}
                        <h2 style="color: #333; font-size: 20px; margin-top: 20px;">User Details</h2>
                        ${customerDetails}
                        <a href="${user.map}" style="display: inline-block; background-color: #888; color: white; padding: 2px 4px; text-align: center; text-decoration: none; border-radius: 3px; margin-top: 20px;">Map</a>
                        <p>We are happy to inform you that a new order with TLonline has been successfully placed. Please check the admin panel for more details.</p>
                    </div>
                </div>
            `,
        };

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

    await Promise.all(recipients.map(recipient => sendEmail(recipient)));
};
router.post('/sendMail',async (req, res) => {
    const { user, products, totalPrice, paymentMethod } = req.body;

    try {
        res.json({
            success: true,
            message: 'Order email sent successfully.',
        });
        await sendOrderEmail(user, products, totalPrice, paymentMethod);
    } catch (error) {
        console.error('Error sending order email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send order email.',
            error,
        });
    }
});
export default router