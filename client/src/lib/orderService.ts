import Axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const OrderService = {
  // Approve a return request
  approveReturn: async (orderId: string, productId: string, adminId: string) => {
    try {
      const response = await Axios.post(`${apiUrl}/api/order/approve-return`, {
        orderId,
        productId,
        adminId: '664345a8b17e7f78628d8fd1'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reject a return request
  rejectReturn: async (orderId: string, productId: string, adminId: string) => {
    try {
      const response = await Axios.post(`${apiUrl}/api/order/reject-return`, {
        orderId,
        productId,
        adminId: '664345a8b17e7f78628d8fd1'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Complete a return process
  completeReturn: async (orderId: string, productId: string, adminId: string) => {
    try {
      const response = await Axios.post(`${apiUrl}/api/order/complete-return`, {
        orderId,
        productId,
        adminId: '664345a8b17e7f78628d8fd1'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change order or product status
  changeOrderStatus: async (orderId: string, status: string, productId?: string) => {
    try {
      const response = await Axios.post(`${apiUrl}/api/order/change-order-status`, {
        orderId,
        status,
        productId
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};