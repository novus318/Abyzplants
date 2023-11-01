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
  const [loading, setLoading] = useState(false);
  const { cart, removeItem, changeQuantity,setCart } = useCart();
  const { auth, setAuth } = useAuth();
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditable, setIsEditable] = useState(false);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

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
    setIsEditable(false);
    setLoading(true);
    const updatedProfile = {
      ...auth.user,
      city,
      zip,
      address,
      phone,
    };
    axios
      .put(`http://localhost:8080/api/auth/profile/${auth.user._id}`, updatedProfile)
      .then((response) => {
        if (response.data.success) {
          setAuth({
            ...auth,
            user: response.data.updatedUser,
          });

          const ls = JSON.parse(localStorage.getItem('user') || '{}');

          ls.user = response.data.updatedUser;
          localStorage.setItem('user', JSON.stringify(ls));

          toast.success('Profile Updated successfully');
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error('Error updating profile');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleEditClick = () => {
    setIsEditable(true);
  };

  const handleQuantityChange = (itemId: string, itemSize: string, quantity: number) => {
    changeQuantity(itemId, itemSize, quantity);
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method);
  };
  const handleRemoveItem = (itemId: string, itemSize: string) => {
    removeItem(itemId, itemSize);
    toast.success('Product removed Successfully');
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

  const handleCODOrder = async () => {
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
      paymentMethod: 'Cash on Delivery',
    };

    const userDetails = {
      _id: auth.user._id,
    };

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8080/api/order/create-order', {
        orderDetails,
        userDetails,
      });

      if (response.data.success) {
        localStorage.removeItem('cart');
        setCart([])
        router.push('/order');
        toast.success(response.data.message,{ duration: 6000 });
        setLoading(false);
      } else {
        setLoading(false);
        toast.error(response.data.message);
      }
    } catch (error) {
      setLoading(false);
      toast.error('Try again placing your order.');
    }
  };
  const handleOnlineOrder = async () => {
    setLoading(true)
    const stripe = await getStripe();

    if (stripe) {
      try {
        const response = await axios.post('http://localhost:8080/api/order/checkout-stripe', {
          orderDetails: {
            products: cart.map((item) => ({
              _id: item._id,
              code: item.code,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              size: item.size,
            })),
            total: calculateTotal().toFixed(2),
          },
        });

        stripe.redirectToCheckout({ sessionId: response.data.sessionId });
      } catch (error) {
        toast.error('Something went wrong, try again');
        setLoading(false)
      }
    } else {
      toast.error('Online is not available.');
      setLoading(false)
    }
  };


  const handleCheckout = () => {
    if (selectedPaymentMethod === '') {
      toast.error('Please select a payment method...');
    } else if (selectedPaymentMethod === 'cod') {
      handleCODOrder();
    } else if (selectedPaymentMethod === 'online') {
      handleOnlineOrder();
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
            <h1 className="text-3xl text-[#5f9231] mb-4 text-center font-medium py-8">Shopping Cart</h1>
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
                              <p className="text-gray-500 mt-1">Size: {item.size}</p>
                              <p className="text-gray-500 mt-1">Price: {Number(item.price).toFixed(2)} AED</p>
                            </div>
                            <div className="flex items-center">
                              {item.quantity > 1 ? (
                                <button
                                  className="cursor-pointer text-[#5f9231] ring-[#a14f3a27] ring-1 rounded-full p-1 sm:p-2"
                                  onClick={() => handleQuantityChange(item._id, item.size, item.quantity - 1)}
                                >
                                  <FaMinus size={16} />
                                </button>
                              ) : null}
                              <span className="text-xl text-gray-700 apple font-medium mx-3 sm:mx-5">
                                {item.quantity}
                              </span>
                              <button
                                className="cursor-pointer text-[#5f9231] ring-[#a14f3a27] ring-1 rounded-full p-1 sm:p-2"
                                onClick={() => handleQuantityChange(item._id, item.size, item.quantity + 1)}
                              >
                                <FaPlus size={16} />
                              </button>
                              <button
                                className="text-[#a14e3a] ml-2 sm:ml-4"
                                onClick={() => handleRemoveItem(item._id, item.size)}
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
                    <div className="bg-white rounded-lg shadow p-4">
                      <h2 className="text-xl font-semibold text-[#5f9231]">Order Summary</h2>
                      <div className="flex justify-between mt-4">
                        <span>Subtotal:</span>
                        <span className="text-[#5f9231]">{calculateSubtotal().toFixed(2)} AED</span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span>Shipping:</span>
                        {calculateShippingFee(calculateSubtotal()) === 0 ? (
                          <span className="text-[#5f9231]">Free</span>
                        ) : (
                          <span className="text-[#5f9231]">
                            {calculateShippingFee(calculateSubtotal()).toFixed(2)} AED
                          </span>
                        )}
                      </div>
                      {calculateSubtotal() <= 100 ? (
                        <div className="text-[#a14e3a] text-sm mt-2">Free shipping above 99 AED</div>
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
                            className={`w-full px-4 py-2 rounded-lg border ${isEditable ? 'border-gray-300' : 'border-[#5f9231]'
                              } focus:outline-none ${isEditable ? '' : 'text-[#5f9231]'} text-base`}
                            disabled={!isEditable}
                          />
                        </div>
                        <div className="mt-2">
                          <textarea
                            placeholder="Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className={`w-full px-4 py-2 rounded-lg border ${isEditable ? 'border-gray-300' : 'border-[#5f9231]'
                              } focus:outline-none ${isEditable ? '' : 'text-[#5f9231]'} text-base`}
                            disabled={!isEditable}
                          />
                        </div>
                        <div className="mt-2 flex items-center">
                          <div className="mr-2 w-1/2">
                            <input
                              type="text"
                              placeholder="City"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className={`w-full px-4 py-2 rounded-lg border ${isEditable ? 'border-gray-300' : 'border-[#5f9231]'
                                } focus:outline-none ${isEditable ? '' : 'text-[#5f9231]'} text-base`}
                              disabled={!isEditable}
                            />
                          </div>
                          <div className="w-1/2">
                            <input
                              type="text"
                              placeholder="ZIP Code"
                              value={zip}
                              onChange={(e) => setZip(e.target.value)}
                              className={`w-full px-4 py-2 rounded-lg border ${isEditable ? 'border-gray-300' : 'border-[#5f9231]'
                                } focus:outline-none ${isEditable ? '' : 'text-[#5f9231]'} text-base`}
                              disabled={!isEditable}
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          {isEditable ? (
                            <button
                              onClick={handleUpdateClick}
                              className="w-full bg-[#5f9231] text-white py-2 rounded-md hover:bg-[#a14e3a] focus:outline-none focus:ring focus:ring-offset-2 focus:ring-[#a14e3a]"
                            >
                              Confirm Shipping
                            </button>
                          ) : (
                            <button
                              onClick={handleEditClick}
                              className="w-full bg-[#a14e3a] text-white py-2 rounded-md hover-bg-[#5f9231] focus:outline-none focus:ring focus:ring-offset-2 focus:ring-[#a14e3a]"
                            >
                              Edit Shipping
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold">Select Payment Method</h3>
                        <div className="mt-2">
                          <div className="flex space-x-4">
                            <button
                              className={`flex-1 px-4 py-2 text-center rounded-lg border ${selectedPaymentMethod === 'online'
                                  ? 'bg-[#5f9231] text-white'
                                  : 'border-gray-300'
                                }`}
                              onClick={() => handlePaymentMethodChange('online')}
                            >
                              Online Payment
                            </button>
                            <button
                              className={`flex-1 px-4 py-2 text-center rounded-lg border ${selectedPaymentMethod === 'cod' ? 'bg-[#5f9231] text-white' : 'border-gray-300'
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
                        <span className="text-lg text-[#5f9231]">{calculateTotal().toFixed(2)} AED</span>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={handleCheckout}
                          className="w-full bg-[#5f9231] text-white py-2 rounded-md hover:bg-[#a14e3a] focus:outline-none focus:ring focus:ring-offset-2 focus:ring-[#a14e3a]">
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
