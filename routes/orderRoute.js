import express  from "express";
import { checkPaymentStatus, createOrderController, createStripeController, getAllOrdersController, getOrderByIdWithUserDetails, getOrdersByUserIdController } from "../contrrollers/orderController.js";
const router=express.Router()

router.post('/create-order',createOrderController)
router.get('/get-order/:pid',getOrdersByUserIdController)
router.get('/get-allOrders',getAllOrdersController)
router.get('/get-orderById/:pid',getOrderByIdWithUserDetails)
router.post('/checkout-stripe',createStripeController)
router.get('/check-payment-status/:pid',checkPaymentStatus)
// router.put('/orders/:orderId/status',updateOrderStatusAndSendNotification)

export default router