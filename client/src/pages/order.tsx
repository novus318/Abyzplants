import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Spinner from '@/components/Spinner';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  offer: number;
  quantity: number;
  size: string;
  color: string;
  pots: {
    potName: string;
    potPrice: number;
  }
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
  const [returnColor, setReturnColor] = useState('');
  const [returnProductSize, setReturnProductSize] = useState('');
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
      const response = await axios.put(`${apiUrl}/api/order/returnOrder/${returnId}/${returnProductId}`, { 
        newStatus, 
        formData,
        returnProductSize,
        returnColor 
      });

      if (response.status === 200) {
        toast.success('Return request submitted successfully');
        setReturnModalVisible(false);
        fetchOrders();
      }
    } catch (error) {
      toast.error('Failed to submit return request');
      setLoading(false);
    }
  }

  const showReturnModal = (id: string, productId: string, size: string, color: string) => {
    setReturnId(id);
    setReturnColor(color);
    setReturnProductId(productId);
    setReturnProductSize(size);
    setReturnModalVisible(true);
  };

  const handleReturnCancel = () => {
    setReturnId('');
    setReturnColor('');
    setReturnProductId('');
    setReturnProductSize('');
    setReturnModalVisible(false);
  };

  const fetchOrders = async () => {
    try {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        if (userData && userData.user) {
          const userId = userData.user._id;
          const response = await axios.get(`${apiUrl}/api/order/get-order/${userId}?filter=${selectedFilter}`);
          if (response.data.success) {
            setOrderData(response.data.orders);
            setLoading(false);
          }
        }
      }
    } catch (error) {
      toast.error('Failed to fetch orders');
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkUserExistence = async () => {
      try {
        const userDataString = localStorage.getItem('user');
        if (!userDataString) {
          const currentRoute = router.asPath;
          router.push(`/login?redirect=${encodeURIComponent(currentRoute)}`);
          return;
        }
        await fetchOrders();
      } catch (error) {
        router.push('/login');
      }
    };

    checkUserExistence();
  }, [router, selectedFilter]);

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const formatDateTo12HourTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const handleCancelOrder = async (orderId: string, productId: string, size: string, color: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      setLoading(true);
      try {
        const newStatus = 'Order Cancelled';
        const response = await axios.put(`${apiUrl}/api/order/orders/${orderId}/${productId}`, { 
          newStatus,
          size,
          color
        });

        if (response.status === 200) {
          toast.success('Order cancelled successfully');
          fetchOrders();
        }
      } catch (error) {
        toast.error('Failed to cancel order');
        setLoading(false);
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing':
      case 'Ready to Ship':
      case 'Order Shipped':
      case 'Order Delivered':
        return 'bg-primary text-primary-foreground';
      case 'Order Cancelled':
        return 'bg-destructive text-destructive-foreground';
      case 'Unable to Process':
        return 'bg-orange-500 text-white';
      case 'Return':
      case 'Refunded':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto max-w-4xl py-8 px-1 mt-10">
            <h1 className="text-3xl font-semibold text-primary mb-8 text-center">Your Orders</h1>
            
            <div className="flex flex-wrap justify-center gap-1 mb-8">
              {['thisWeek', 'lastWeek', 'thisMonth', 'thisYear'].map((filter) => (
                <Button
                size='sm'
                  key={filter}
                  variant={selectedFilter === filter ? 'default' : 'outline'}
                  onClick={() => handleFilterChange(filter)}
                  className="capitalize"
                >
                  {filter.replace(/([A-Z])/g, ' $1').trim()}
                </Button>
              ))}
            </div>

            <ScrollArea className="h-[calc(100vh-300px)]">
              {orderData?.length ? (
                <div className="space-y-6">
                  {orderData.map((order) => (
                    <div
                      key={order._id}
                      className="bg-card rounded-lg shadow-sm border p-3 space-y-2"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                          <p className="text-xs md:text-sm font-medium text-muted-foreground">Order ID: {order._id.substring(16)}</p>
                          <p className="text-xs md:text-sm font-medium text-muted-foreground">{formatDateTo12HourTime(order.createdAt)}</p>
                          <p className="text-xs md:text-sm font-medium text-muted-foreground">Payment: {order.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-sm md:text-base font-semibold text-primary">
                            Total: {order.total.toFixed(2)} AED
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium">Ordered Products</h3>
                        {order.products.map((product, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-4 border-b pb-2"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-20 h-20 object-cover rounded-md"
                            />
                          
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-gray-900">
                                {product.name}
                              </h4>
                              <div className="text-xs text-gray-500 space-y-0.5">
                                <p>Size: {product.size} {product.pots && `• ${product.pots.potName}`}</p>
                                {product.color && <p>Color: {product.color}</p>}
                                <p>Qty: {product.quantity}</p>
                              </div>
                              <p className="text-xs text-gray-800 font-medium">
                                Price:{" "}
                                {product.offer ? (
                                  product.pots?.potPrice ? (
                                    <>
                                      {(
                                        ((100 - product.offer) / 100) *
                                        (Number(product.price) + Number(product.pots?.potPrice))
                                      ).toFixed(2)}{" "}
                                      AED
                                    </>
                                  ) : (
                                    <>
                                      {(((100 - product.offer) / 100) * product.price).toFixed(2)} AED
                                    </>
                                  )
                                ) : product.pots?.potPrice ? (
                                  <>
                                    {(Number(product.price) + Number(product.pots.potPrice)).toFixed(2)} AED
                                  </>
                                ) : (
                                  <>{product.price.toFixed(2)} AED</>
                                )}
                              </p>
                            </div>
                            
                            <div className="flex flex-col items-end gap-3">
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                product.status === 'Order Delivered' ? 'bg-green-100 text-green-800' :
                                product.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                product.status.includes('Cancelled') || product.status.includes('Return') ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {product.status}
                              </div>
                              
                              <div className="flex flex-wrap justify-end gap-2">
                                {!(['Refunded', 'Order Cancelled', 'Order Delivered', 'Return', 'Order Shipped'].includes(product.status)) && (
                                  <button
                                    onClick={() => handleCancelOrder(order._id, product._id, product.size, product.color)}
                                    className="text-sm font-medium text-red-600 hover:text-red-800 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                  >
                                    Cancel Order
                                  </button>
                                )}
                                
                                {product.status === 'Order Delivered' && (
                                  <button
                                    onClick={() => showReturnModal(order._id, product._id, product.size, product.color)}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                  >
                                    Return Item
                                  </button>
                                )}
                                
                                {product.status === 'Return' && (
                                  <p className="text-sm text-blue-600 italic">Return in progress</p>
                                )}
                                
                                {product.status === 'Refunded' && (
                                  <p className="text-sm text-green-600 italic">Refund completed</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No orders found for the selected period.
                </div>
              )}
            </ScrollArea>
          </main>
          <Footer />
        </div>
      )}

      <Modal
        title="Return Order"
        open={returnModalVisible}
        onCancel={handleReturnCancel}
        footer={null}
        className="rounded-md"
      >
        <div className="p-4 space-y-4">
          <div className="bg-destructive/10 text-destructive p-3 rounded-md">
            <p>A charge of 13 AED will be deducted for the return.</p>
            <p className="text-xs mt-1">
              *The refunded amount will be credited to your account after deducting the applicable fee.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <PhoneInput
                international
                defaultCountry="AE"
                value={formData.number}
                onChange={(value) => handleInputChange({ target: { name: 'number', value } })}
                className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Account Holder Name</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Account Number</label>
              <Input
                type="text"
                name="account"
                value={formData.account}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">IBAN</label>
              <Input
                type="text"
                name="iban"
                value={formData.iban}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for Return</label>
              <Textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                required
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleReturnCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
              >
                Submit Return Request
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default Order;
