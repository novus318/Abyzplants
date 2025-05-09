import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Spinner from '@/components/Spinner';
import getStripe from '@/lib/getStripe';
import { useAuth } from '@/store/authContext';
import { useCart } from '@/store/cartContext';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaPlus, FaMinus, FaTimes } from 'react-icons/fa';
import ReactInputMask from 'react-input-mask';


const Cart: React.FC = () => {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [loading, setLoading] = useState(false);
  const { cart, removeItem, changeQuantity,setCart } = useCart();
  const { auth, setAuth } = useAuth();
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');

  useEffect(() => {
    const checkUserExistence = async () => {
      try {
        const userDataString = localStorage.getItem('user');

        if (userDataString !== null) {
          const userData = JSON.parse(userDataString);

          if (userData && userData.user) {
            const { city, zip, address, phone } = userData.user;
            setCity(city);
            setZip(zip);
            setAddress(address);
            setPhone(phone);
            setLoading(false);
          }
        } else {
          const currentRoute = router.asPath;
          router.push(`/login?redirect=${encodeURIComponent(currentRoute)}`);
        }
      } catch (error) {
        router.push('/login');
      }
    };

    checkUserExistence();
  }, [router]);

  const handleUpdateClick = () => {
    const updatedProfile = {
      ...auth.user,
      city,
      zip,
      address,
      phone,
    };
    axios
      .put(`${apiUrl}/api/auth/profile/${auth.user?._id}`, updatedProfile)
      .then((response) => {
        if (response.data.success) {
          setAuth({
            ...auth,
            user: response.data.updatedUser,
          });

          const ls = JSON.parse(localStorage.getItem('user') || '{}');

          ls.user = response.data.updatedUser;
          localStorage.setItem('user', JSON.stringify(ls));
        }
      })
      .catch((error) => {
        toast.error('Error updating shipping');
      })
  };
 

  const handleQuantityChange = (itemId: string, itemSize: string, quantity: number,color:string) => {
    changeQuantity(itemId, itemSize, quantity,color);
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method);
  };
  const handleRemoveItem = (itemId: string, itemSize: string,itemColor:string) => {
    removeItem(itemId, itemSize,itemColor);
    toast.success('Product removed Successfully');
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = item.sizes.price;
      const potPrice = item.pots?.potPrice || 0;
  
      const totalPrice = (Number(itemPrice) + Number(potPrice));
      const discountedPrice = item.offerPercentage > 0
        ? totalPrice - (totalPrice * item.offerPercentage / 100)
        : totalPrice;
  
      return total + item.quantity * discountedPrice;
    }, 0);
  };
  

  const calculateShippingFee = (subtotal: number) => {
    if (subtotal >= 199) {
      return 0;
    } else {
      return 20;
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shippingFee = calculateShippingFee(subtotal);
    return subtotal + shippingFee;
  };

  const handleCODOrder = async () => {
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
        color: item.color,
        image: item.image,
        status: 'Processing', // Initial status
        returnedQuantity: 0,  // Initialize returned quantity
        refundAmount: 0,      // Initialize refund amount
        // Potentially add these if needed:
        // returnReason: null,
        // cancellationReason: null
      })),
      shippingFee: calculateShippingFee(calculateSubtotal()),
      subtotal: calculateSubtotal(),
      total: calculateTotal(),
      paymentMethod: 'Cash on Delivery',
    };

    const userDetails = {
      _id: auth.user._id,
    };

    try {
      setLoading(true);
      const response = await axios.post(`${apiUrl}/api/order/create-order`, {
        orderDetails,
        userDetails,
      });

      if (response.data.success) {
        // Clear cart after successful order
        localStorage.removeItem('cart');
        setCart([]);
        
        // Redirect to order confirmation page
        router.push(`/order`);
        
        // Show success message with order number
        toast.success(
          `Order placed successfully!`,
          { duration: 6000 }
        );
        
        setLoading(false);
      } else {
        setLoading(false);
        toast.error(response.data.message || 'Failed to place order');
      }
    } catch (error:any) {
      setLoading(false);
      console.error('Order placement error:', error);
      
      // Show more detailed error message if available
      toast(
        error.response?.data?.message || 
        'Failed to place order. Please try again.'
      );
    }
  };
  // const handleOnlineOrder = async () => {
  //   setLoading(true)
  //   const stripe = await getStripe();

  //   if (stripe) {
  //     try {
  //       const response = await axios.post(`${apiUrl}/api/order/checkout-stripe`, {
  //         orderDetails: {
  //           products: cart.map((item) => ({
  //             _id: item._id,
  //             code: item.code,
  //             name: item.name,
  //             price: item.sizes.price,
  //             offer: item.offerPercentage,
  //             quantity: item.quantity,
  //             size: item.sizes.name,
  //             pots: item.pots,
  //             color: item.color,
  //             image:item.image,
  //             status:'Processing'
  //           })),
  //           total: calculateTotal().toFixed(2),
  //         },
  //       });

  //       stripe.redirectToCheckout({ sessionId: response.data.sessionId });
  //     } catch (error) {
  //       toast.error('Something went wrong, try again');
  //       setLoading(false)
  //     }
  //   } else {
  //     toast.error('Online is not available.');
  //     setLoading(false)
  //   }
  // };


  const handleCheckout = () => {
    handleUpdateClick()
    if (selectedPaymentMethod === '') {
      toast.error('Please select a payment method...');
    } else if (selectedPaymentMethod === 'cod') {
      if (!address || !city || !zip) {
        toast.error('Please fill in all shipping details.');
      } else {
        handleCODOrder();
      }
    } else if (selectedPaymentMethod === 'online') {
      if (!address || !city || !zip) {
        toast.error('Please fill in all shipping details.');
      } else {
        // handleOnlineOrder();
      }
    }
  };
  

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <Header />
          <div className="bg-gray-100 min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl text-primary mb-4 text-center font-medium py-8">Shopping Cart</h1>
            <div className="max-w-screen-xl mx-auto grid grid-cols-12 gap-4">
              {cart.length === 0 ? (
                <div className="col-span-12 text-center text-gray-600">Your cart is empty.</div>
              ) : (
                <>
                  <div className="col-span-12 md:col-span-8">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      {cart.map((item, i) => (
                        <div key={i} className="border-b border-gray-200 last:border-b-0">
                          <div className="flex items-center p-3">
                            <Link href={`/details/${item._id}`}>
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-20 object-cover rounded-lg"
                              />
                            </Link>
                            <div className="ml-4 flex-1">
                              <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
                              <p className="text-gray-500 mt-1 text-sm">Size: {item.sizes.name} {item.pots && `/ ${item.pots.potName}`} {item.color && `/ ${item.color}`}</p>
                              {item?.offerPercentage > 0 ? (
                                <>
                                {item.pots?.potPrice ?
                                (<p className="text-gray-500 mt-1 text-sm font-medium"> Price: <span><s>{(Number(item.sizes.price) + Number(item.pots?.potPrice)).toFixed(2)} AED</s></span> {(
                                  ((100 - item.offerPercentage) / 100) * (Number(item.sizes.price) + Number(item.pots?.potPrice))
                                ).toFixed(2)}{' '}
                                AED</p>):
                                (<p className="text-gray-500 mt-1 text-sm font-medium"> Price: <span><s>{Number(item.sizes.price).toFixed(2)} AED</s></span> {(
                                  ((100 - item.offerPercentage) / 100) * Number(item.sizes.price)
                                ).toFixed(2)}{' '}
                                AED</p>)}</>
                                ):(
                                  <>
                                  {item.pots?.potPrice ? (
                                  <p className="text-gray-500 mt-1 text-sm font-medium">Price: {(Number(item.sizes.price) + Number(item.pots?.potPrice)).toFixed(2)} AED</p>):
                                  (<p className="text-gray-500 mt-1 text-sm font-medium">Price: {Number(item.sizes.price).toFixed(2)} AED</p>)}
                                  </>
                                )}
                            </div>
                            <div className="flex items-center">
                              {item.quantity > 1 ? (
                                <button
                                  className="cursor-pointer text-primary ring-secondary-foreground ring-1 rounded-full p-1.5"
                                  onClick={() => handleQuantityChange(item._id, item.sizes.name, item.quantity - 1, item.color)}
                                >
                                  <FaMinus size={16} />
                                </button>
                              ) : null}
                              <span className="text-xl text-gray-700 apple font-medium mx-3 sm:mx-5">
                                {item.quantity}
                              </span>
                              <button
                                className="cursor-pointer text-primary ring-secondary-foreground ring-1 rounded-full p-1.5"
                                onClick={() => handleQuantityChange(item._id, item.sizes.name, item.quantity + 1, item.color)}
                              >
                                <FaPlus size={12} />
                              </button>
                              <button
                                className="text-secondary-foreground ml-2 sm:ml-4"
                                onClick={() => handleRemoveItem(item._id, item.sizes.name,item.color)}
                              >
                                <FaTimes size={22} />
                              </button>
                            </div>
                          </div>
                          <div className="border-t border-gray-200"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <div className="bg-white rounded-lg shadow p-4 mb-2">
                      <h2 className="text-xl font-semibold text-primary">Order Summary</h2>
                      <div className="flex justify-between mt-4">
                        <span>Subtotal:</span>
                        <span className="text-primary">
                          {calculateSubtotal().toFixed(2)} AED</span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span>Shipping:</span>
                        {calculateShippingFee(calculateSubtotal()) === 0 ? (
                          <span className="text-primary">Free</span>
                        ) : (
                          <span className="text-primary">
                            {calculateShippingFee(calculateSubtotal()).toFixed(2)} AED
                          </span>
                        )}
                      </div>
                      {calculateSubtotal() <= 100 ? (
                        <div className="text-[#a14e3a] text-sm mt-2">Free shipping above 199 AED</div>
                      ) : null}
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold">Shipping Details</h3>
                        <div className="mt-2">
                          <ReactInputMask
                            id="phone"
                            name="phone"
                            mask="+971 99 999 9999"
                            maskChar="_"
                            autoComplete="tel"
                            placeholder="Phone Number (+971 5XX XXX XXXX)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className='w-full px-4 py-2 rounded-lg border border-secondary-foreground focus:outline-none text-primary text-base'
                          />
                        </div>
                        <div className="mt-2">
                          <textarea
                            placeholder="Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className='w-full px-4 py-2 rounded-lg border border-secondary-foreground focus:outline-none text-primary text-base'
                          />
                        </div>
                        <div className="mt-2 flex items-center">
                          <div className="mr-2 w-1/2">
                            <input
                              type="text"
                              placeholder="City"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className='w-full px-4 py-2 rounded-lg border  border-secondary-foreground focus:outline-none text-primary text-base'

                            />
                          </div>
                          <div className="w-1/2">
                            <input
                              type="text"
                              placeholder="ZIP Code"
                              value={zip}
                              onChange={(e) => setZip(e.target.value)}
                              className='w-full px-4 py-2 rounded-lg border  border-secondary-foreground focus:outline-none text-primary text-base'
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold">Select Payment Method</h3>
                        <div className="mt-2">
                          <p className='text-xs text-destructive mb-2'>*Online payment is under maintainance</p>
                          <div className="flex space-x-4">
                            <button
                              className={`flex-1 px-4 py-2 text-center rounded-lg border opacity-25 cursor-not-allowed ${selectedPaymentMethod === 'online'
                                  ? 'bg-primary text-white'
                                  : 'border-gray-300'
                                }`}
                              disabled
                            >
                              Online Payment
                            </button>
                            <button
                              className={`flex-1 px-4 py-2 text-center rounded-lg border ${selectedPaymentMethod === 'cod' ? 'bg-primary text-white' : 'border-gray-300'
                                }`}
                              onClick={() => handlePaymentMethodChange('cod')}
                            >
                              Cash on Delivery
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 my-3"></div>
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-lg text-primary">{calculateTotal().toFixed(2)} AED</span>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={handleCheckout}
                          className="w-full bg-primary text-white py-2 rounded-md hover:bg-secondary-foreground focus:outline-none focus:ring focus:ring-offset-2 focus:ring-sebg-secondary-foreground">
                          Proceed to Checkout
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <Footer />
        </>
      )}
    </>
  );
};

export default Cart;
