import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import { useCart } from '@/store/cartContext';
import { useAuth } from '@/store/authContext';

const PaymentCompletePage = () => {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { cart,setCart } = useCart();
  const { auth } = useAuth();
  const { sessionId } = router.query
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/order/check-payment-status/${sessionId}`);
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
        price: item.sizes.price,
        offer: item.offerPercentage,
        quantity: item.quantity,
        size: item.sizes.name,
        pots: item.pots,
        image:item.image,
        status:'Processing'
      })),
      total: calculateTotal(),
      paymentMethod: 'Online',
    };

    const userDetails = {
      _id: auth.user._id,
    };

    try {
      const response = await axios.post(`${apiUrl}/api/order/create-order`, {
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
    return cart.reduce((total, item) => {
      const itemPrice = item.sizes.price;
      const discountedPrice = item.offerPercentage > 0
        ? itemPrice - (itemPrice * item.offerPercentage / 100)
        : itemPrice;
  
      return total + item.quantity * discountedPrice;
    }, 0);
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
