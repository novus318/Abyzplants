import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Spinner from '@/components/Spinner';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { format, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

interface Product {
  _id: string;
  name: string;
  image:string;
  price: number;
  quantity: number;
  size: string;
}

interface Order {
  _id: string;
  products: Product[];
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

const Order = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<Order[] | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('thisWeek');
  useEffect(() => {
    const checkUserExistence = async () => {
      try {
        const userDataString = localStorage.getItem('user');

        if (userDataString !== null) {
          const userData = JSON.parse(userDataString);

          if (userData && userData.user) {
            const userId = userData.user._id;

            try {
              const response = await axios.get(`http://localhost:8080/order/get-order/${userId}`);
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
                          <p className={`text-lg font-semibold ${order.status === 'Processing' ? 'text-[#5f9231]' :
                              order.status === 'Ready to Ship' ? 'text-[#0077b6]' :
                                order.status === 'Order Shipped' ? 'text-[#560bad]' :
                                  order.status === 'Order Delivered' ? 'text-[#198754]' :
                                    order.status === 'Order Cancelled' ? 'text-[#dc3545]' :
                                      order.status === 'Unable to Process' ? 'text-[#ff8c00]' :
                                        order.status === 'Refunded' ? 'text-[#17a2b8]' :
                                          ''
                            }`}>
                            Status: {order.status}
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
                              className="w-16 h-20 object-cover rounded-lg mb-4 md:mr-4"
                            />
                          </Link>
                          <div>
                            <p className="text-[#5f9231] font-semibold text-lg">{product.name}</p>
                            <p className="text-gray-500 text-sm">Price: {product.price.toFixed(2)} AED</p>
                            <p className="text-gray-500 text-sm">Quantity: {product.quantity}</p>
                            <p className="text-gray-500 text-sm">Size: {product.size}</p>
                          </div>
                        </div>
                      ))}
                      <div className="text-center mt-4">
                        <button className="text-red-500 rounded-md hover:text-red-700 cursor-pointer">
                          Cancel Order
                        </button>

                      </div>
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
    </>
  );
};

export default Order;
