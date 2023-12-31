import express  from "express";
import { checkPaymentStatus, createOrderController, createStripeController, getAllOrdersController, getOrderByIdWithUserDetails, getOrdersByUserIdController, returnOrderStatusAndSendNotification, updateOrderStatusAndSendNotification } from "../contrrollers/orderController.js";
const router=express.Router()

router.post('/create-order',createOrderController)
router.get('/get-order/:pid',getOrdersByUserIdController)
router.get('/get-allOrders',getAllOrdersController)
router.get('/get-orderById/:pid',getOrderByIdWithUserDetails)
router.post('/checkout-stripe',createStripeController)
router.get('/check-payment-status/:pid',checkPaymentStatus)
router.put('/orders/:orderId/:productId',updateOrderStatusAndSendNotification)
router.put('/returnOrder/:orderId/:productId',returnOrderStatusAndSendNotification)

export default router