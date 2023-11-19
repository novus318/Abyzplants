import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Spinner from '@/components/Spinner';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { Modal } from 'antd';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  status: string;
}

interface Order {
  _id: string;
  products: Product[];
  total: number;
  paymentMethod: string;
  createdAt: string;
}

const Order = () => {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<Order[] | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('thisWeek');
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [returnId, setReturnId] = useState('');
  const [returnProductId, setReturnProductId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    account: '',
    iban: '',
    reason: ''
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormSubmit = async () => {
    setLoading(true);
    try {
      const newStatus = 'Return';
      const response = await axios.put(`${apiUrl}/api/order/returnOrder/${returnId}/${returnProductId}`, { newStatus, formData });

      if (response.status === 200) {


      }
    } catch (error) {
      setLoading(false);
    }
  }
  const showReturnModal = (id: any,productId: any) => {
    setReturnId(id)
    setReturnProductId(productId)
    setReturnModalVisible(true);
  };

  const handleReturnCancel = () => {
    setReturnId('')
    setReturnProductId('')
    setReturnModalVisible(false);
  };

  useEffect(() => {
    const checkUserExistence = async () => {
      try {
        const userDataString = localStorage.getItem('user');

        if (userDataString !== null) {
          const userData = JSON.parse(userDataString);

          if (userData && userData.user) {
            const userId = userData.user._id;

            try {
              const response = await axios.get(`${apiUrl}/api/order/get-order/${userId}`);
              if (response.data.success) {
                const filteredOrders = filterOrdersByDate(response.data.orders, selectedFilter);
                filteredOrders.sort((a, b) => {
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                })
                setOrderData(filteredOrders);
                console.log(filteredOrders)
                setLoading(false);
                setLoading(false);
              }
            } catch (error) {
              // Handle error
            }
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
  }, [router, selectedFilter]);

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const filterOrdersByDate = (orders: Order[], filter: string) => {
    const currentDate = new Date();
    let startDate: Date, endDate: Date;

    if (filter === 'thisWeek') {
      startDate = startOfWeek(currentDate);
      endDate = currentDate;
    } else if (filter === 'lastWeek') {
      startDate = startOfWeek(subDays(currentDate, 7));
      endDate = startOfWeek(currentDate);
    } else if (filter === 'thisMonth') {
      startDate = startOfMonth(currentDate);
      endDate = currentDate;
    } else if (filter === 'thisYear') {
      startDate = startOfYear(currentDate);
      endDate = currentDate;
    }

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  const formatDateTo12HourTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };

    return new Date(dateString).toLocaleString(undefined, options);
  };
  const handleCancelOrder = async (orderId: any,productId: any) => {
    if (window.confirm('Are you sure you want to Cancel Order')) {
      setLoading(true);
      try {
        const newStatus = 'Order Cancelled';
        const response = await axios.put(`${apiUrl}/api/order/orders/${orderId}/${productId}`, { newStatus });

        if (response.status === 200) {

          window.location.reload();
        }
      } catch (error) {
        setLoading(false);
      }
    }
  }


  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div>
          <Header />
          <div className="min-h-screen bg-white">
            <div className="mx-auto py-8 px-4 mt-10">
              <h1 className="text-3xl text-[#5f9231] mb-4 text-center font-medium py-8">Your Order Details</h1>
              <div className="flex flex-wrap justify-center space-y-2 space-x-2 md:space-x-4 md:space-y-0">
                <button
                  onClick={() => handleFilterChange('thisWeek')}
                  className={`filter-button ${selectedFilter === 'thisWeek' ? 'bg-[#5f9231] text-white' : 'bg-white text-[#5f9231] hover:bg-[#5f9231] hover:text-white'} py-2 px-4 md:py-2 md:px-4 rounded-lg transition duration-300`}
                >
                  This Week
                </button>
                <button
                  onClick={() => handleFilterChange('lastWeek')}
                  className={`filter-button ${selectedFilter === 'lastWeek' ? 'bg-[#5f9231] text-white' : 'bg-white text-[#5f9231] hover:bg-[#5f9231] hover:text-white'} py-2 px-4 md:py-2 md:px-4 rounded-lg transition duration-300`}
                >
                  Last Week
                </button>
                <button
                  onClick={() => handleFilterChange('thisMonth')}
                  className={`filter-button ${selectedFilter === 'thisMonth' ? 'bg-[#5f9231] text-white' : 'bg-white text-[#5f9231] hover:bg-[#5f9231] hover:text-white'} py-2 px-4 md:py-2 md:px-4 rounded-lg transition duration-300`}
                >
                  This Month
                </button>
                <button
                  onClick={() => handleFilterChange('thisYear')}
                  className={`filter-button ${selectedFilter === 'thisYear' ? 'bg-[#5f9231] text-white' : 'bg-white text-[#5f9231] hover:bg-[#5f9231] hover:text-white'} py-2 px-4 md:py-2 md:px-4 rounded-lg transition duration-300`}
                >
                  This Year
                </button>
              </div>
              {orderData?.length !== 0 ? (
                <div className='px-4 md:px-8 lg:px-16'>
                  {orderData?.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white rounded-lg shadow p-4 border-b border-gray-300 transition duration-300 mb-4"
                    >
                      <div className="flex flex-col md:flex-row justify-between mb-4">
                        <div className="mb-4 md:mb-0">
                          <p className="text-gray-500 text-sm">Order ID: {order._id.substring(16)}</p>
                          <p className="text-gray-500 text-sm">{formatDateTo12HourTime(order.createdAt)}</p>
                          <p className="text-gray-500 text-sm">Payment : {order.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-[#5f9231] font-semibold text-xl md:text-2xl">
                            Total: {order.total.toFixed(2)} AED
                          </p>

                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 mt-4">Ordered Products</h3>
                      {order.products.map((product, i) => (
                        <div
                          key={i}
                          className="mb-4 p-4 border border-gray-300 rounded-lg hover:shadow-md transition duration-300 flex flex-col md:flex-row items-center"
                        >
                          <Link href={`/details/${product._id}`}>
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-16 h-20 object-cover rounded-lg mb-4 md:mr-4 md:w-24 md:h-32"
                            />
                          </Link>
                          <div className="flex flex-col md:flex-row w-full">
                            <div className="md:flex-shrink">
                              <p className="text-[#5f9231] font-semibold text-lg mb-2">{product.name}</p>
                              <p className="text-gray-500 text-sm mb-2">Price: {product.price.toFixed(2)} AED</p>
                              <p className="text-gray-500 text-sm mb-2">Quantity: {product.quantity}</p>
                              <p className="text-gray-500 text-sm mb-2">Size: {product.size}</p>
                            </div>
                            <div className="md:ml-auto md:text-right mt-4 md:mt-0">
                              <p className='text-lg font-semibold text-[#5f9231] mb-2'>
                                Status: <span className={`text-lg font-semibold ${product.status === 'Processing' ? 'text-[#5f9231]' :
                                  product.status === 'Ready to Ship' ? 'text-[#5f9231]' :
                                    product.status === 'Order Shipped' ? 'text-[#5f9231]' :
                                      product.status === 'Order Delivered' ? 'text-[#5f9231]' :
                                        product.status === 'Order Cancelled' ? 'text-[#dc3545]' :
                                          product.status === 'Unable to Process' ? 'text-[#ff8c00]' :
                                            product.status === 'Refunded' && 'text-[#5f9231]'}`}>{product.status}</span>
                              </p>
                              <div className="text-center">
                                {!(product.status === 'Refunded' || product.status === 'Order Cancelled' || product.status === 'Order Delivered' || product.status === 'Return' || product.status === 'Order Shipped') ? (
                                  <button
                                    onClick={() => handleCancelOrder(order._id,product._id)}
                                    className="text-red-500 rounded-md hover:text-red-700 cursor-pointer mr-2 bg-gray-100 px-4 py-1">
                                    Cancel Order
                                  </button>
                                ) : null}

                                {product.status === 'Order Delivered' ? (
                                  <button
                                    onClick={() => showReturnModal(order._id,product._id)}
                                    className="text-[#5f9231] rounded-md hover:text-[#4a7327] cursor-pointer mr-2 bg-gray-100 px-4 py-1">
                                    Return
                                  </button>
                                ) : null}
                                {product.status === 'Return' ? (
                                  <p className="text-[#5f9231] rounded-md mb-2">Your return request is being processed & {((product.price * product.quantity) - 13).toFixed(2)} AED will be refunded</p>
                                ) : null}
                                {product.status === 'Refunded' ? (
                                  <p className="text-[#5f9231] rounded-md mb-2">Your amount of {((product.price * product.quantity) - 13).toFixed(2)} AED has been refunded</p>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                    </div>
                  ))}
                </div>
              ) : (
                <div className="col-span-12 text-center text-gray-600">
                  No order details available.
                </div>
              )}
            </div>
          </div>
          <Footer />
        </div>
      )}
      <Modal
        title="Return Order"
        visible={returnModalVisible}
        onCancel={handleReturnCancel}
        footer={null}
        className="rounded-md"
      >
        <div className="p-4">
          <p className="text-red-500">A charge of 13 AED will be deducted for the return.</p>
          <p className="text-gray-600 text-xs text-center">
            *The refunded amount will be credited to your account after deducting the applicable fee.
          </p>
          <p className="text-[#5f9231] mb-2">Please fill out the following details to initiate the refund process.</p>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="flex flex-col space-y-2">
              <PhoneInput
                international
                defaultCountry="AE"
                value={formData.number}
                onChange={(value) => handleInputChange({ target: { name: 'number', value } })}
                placeholder="Phone Number"
                maxLength={16}
                required
                className="border p-2 rounded-md focus:outline-none focus:border-[#5f9231] transition duration-300"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Account holder Name"
                required
                className="border p-2 rounded-md focus:outline-none focus:border-[#5f9231] transition duration-300"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <input
                type="text"
                id="account"
                name="account"
                value={formData.account}
                onChange={handleInputChange}
                placeholder="Your Account Number"
                required
                className="border p-2 rounded-md focus:outline-none focus:border-[#5f9231] transition duration-300"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <input
                type="text"
                id="iban"
                name="iban"
                value={formData.iban}
                onChange={handleInputChange}
                placeholder="IBAN"
                required
                className="border p-2 rounded-md focus:outline-none focus:border-[#5f9231] transition duration-300"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                placeholder="Reason"
                required
                className="border p-2 rounded-md focus:outline-none focus:border-[#5f9231] transition duration-300"
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-[#5f9231] text-white py-2 px-4 rounded-md hover:bg-[#4a7327] transition duration-300"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default Order;
