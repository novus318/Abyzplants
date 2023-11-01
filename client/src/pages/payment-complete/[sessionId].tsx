import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import { useCart } from '@/store/cartContext';
import { useAuth } from '@/store/authContext';

const PaymentCompletePage = () => {
  const router = useRouter();
  const { cart,setCart } = useCart();
  const { auth } = useAuth();
  const { sessionId } = router.query
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/order/check-payment-status/${sessionId}`);
        if (response.data.success) {
          createOrder();
        } else {
          toast.error('Try again placing your order.');
          router.push('/cart');
        }
      } catch (error) {
        toast.error('Something went wrong. Please try again.');
        router.push('/cart');
      }
    };
  
  
    if (sessionId) {
     if (sessionId) checkPaymentStatus();
    }
  }, [sessionId,router]);


  const createOrder = async () => {
  
    const orderDetails = {
      products: cart.map((item) => ({
        _id: item._id,
        code: item.code,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
      })),
      total: calculateTotal(),
      paymentMethod: 'Online',
    };

    const userDetails = {
      _id: auth.user._id,
    };

    try {
      const response = await axios.post('http://localhost:8080/api/order/create-order', {
        orderDetails,
        userDetails,
      });

      if (response.data.success) {
        localStorage.removeItem('cart');
        setCart([])
        router.push('/order');
        toast.success(response.data.message,{ duration: 6000 });
      } else {
        router.push('/cart');
        toast.error(response.data.message);
      }
    } catch (error) {
      router.push('/cart');
      toast.error('Try again placing your order.');
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  const calculateShippingFee = (subtotal: number) => {
    if (subtotal >= 100) {
      return 0;
    } else {
      return 13;
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shippingFee = calculateShippingFee(subtotal);
    return subtotal + shippingFee;
  };

  return (
    <Spinner />
  );
};

export default PaymentCompletePage;
