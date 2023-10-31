import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import AdminSidebar from '@/components/AdminSidebar';
import { withAuth } from '../../components/withAuth';
import { Modal, Button, Table, Select } from 'antd';
import Link from 'next/link';

const { Option } = Select;

interface Order {
  _id: string;
  products: Product[];
  total: number;
  paymentMethod: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: number;
    zip: number;
    city: string;
    address: string;
  };
  status: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  code: string;
}

const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [dateFilter, setDateFilter] = useState('thisWeek');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Axios.get('http://localhost:8080/order/get-allOrders')
      .then((response) => {
        if (response.data.success) {
          const sortedOrders = response.data.orders.sort((a: Order, b: Order) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setOrders(sortedOrders);
          setFilteredOrders(sortedOrders);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching orders:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (dateFilter === 'today') {
      const today = new Date();
      const filtered = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getDate() === today.getDate() &&
          orderDate.getMonth() === today.getMonth() &&
          orderDate.getFullYear() === today.getFullYear()
        );
      });
      setFilteredOrders(filtered);
    } else if (dateFilter === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const filtered = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getDate() === yesterday.getDate() &&
          orderDate.getMonth() === yesterday.getMonth() &&
          orderDate.getFullYear() === yesterday.getFullYear()
        );
      });
      setFilteredOrders(filtered);
    } else if (dateFilter === 'thisWeek') {
      const today = new Date();
      const firstDayOfWeek = new Date(today);
      firstDayOfWeek.setDate(today.getDate() - today.getDay());
      const filtered = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= firstDayOfWeek;
      });
      setFilteredOrders(filtered);
    } else if (dateFilter === 'thisMonth') {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const filtered = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= firstDayOfMonth;
      });

      setFilteredOrders(filtered);
    } else if (dateFilter === 'last6Months') {
      const today = new Date();
      const firstDayOfLast6Months = new Date(
        today.getFullYear(),
        today.getMonth() - 6,
        today.getDate()
      );

      const filtered = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= firstDayOfLast6Months;
      });

      setFilteredOrders(filtered);
    }
  }, [dateFilter, orders]);

  useEffect(() => {
    filterOrdersByOrderId(searchQuery);
  }, [searchQuery, orders]);

  const filterOrdersByOrderId = (query: string) => {
    if (!query) {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) =>
        order._id.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
    },
  ];

  const handleViewClick = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
  };

  const formatDateTime = (dateTime: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true, // Use 12-hour format
    };

    return new Date(dateTime).toLocaleString(undefined, options);
  };
  const handleStatusChange = (orderId: string, newStatus: string) => {
    Axios.put(`http://localhost:8080/order/orders/${orderId}/status`, { newStatus })
      .then((response) => {
        if (response.data.success) {
          const updatedOrders = orders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          );
          setOrders(updatedOrders);
          setFilteredOrders(updatedOrders);
        } else {
          // Handle the error.
        }
      })
      .catch((error) => {
        console.error('Error updating order status:', error);
      });
  };
  
  
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-4 ml-64">
        <h1 className="text-3xl font-semibold mb-4">Orders</h1>
        <input
          type="text"
          placeholder="Search by Order ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-auto py-1 px-4 mx-3 border border-gray-300 rounded-md"
        />
        <Select
          style={{ width: 200, marginBottom: '1rem' }}
          placeholder="Select Date Filter"
          onChange={handleDateFilterChange}
        >
          <Option value="today">Today</Option>
          <Option value="yesterday">Yesterday</Option>
          <Option value="thisWeek">This Week</Option>
          <Option value="thisMonth">This Month</Option>
          <Option value="last6Months">Last 6 months</Option>
        </Select>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="px-6 text-center py-3 bg-gray-100 text-xs leading-4 font-medium text-gray-600 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 text-center py-3 bg-gray-100 text-xs leading-4 font-medium text-gray-600 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 text-center py-3 bg-gray-100 text-xs leading-4 font-medium text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 text-center py-3 bg-gray-100 text-xs leading-4 font-medium text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 text-center py-3 bg-gray-100 text-xs leading-4 font-medium text-gray-600 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 text-center py-3 bg-gray-100 text-xs leading-4 font-medium text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 text-center py-3 bg-gray-100 text-xs leading-4 font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 text-center py-3 bg-gray-100 text-xs leading-4 font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredOrders.map((order) => (
                <tr
                key={order._id}
                className={`ring-gray-500 ring-1 ${
                  order.status === 'Order Cancelled' ? 'bg-red-50' : ''
                }`}
              >
                  <td className="px-6 py-4 whitespace-no-wrap text-sm text-center leading-5 font-medium text-gray-900">
                    {order._id.substring(16)}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap text-sm text-center leading-5 text-gray-500">
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap text-sm text-center leading-5 text-gray-500">
                    {order.user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap text-sm text-center leading-5 text-gray-500">
                    {order.user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap text-sm text-center leading-5 text-gray-500">
                    {order.user.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap text-sm text-center leading-5 text-gray-500">
                    {order.total.toFixed(2)} AED
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap text-sm text-center leading-5 text-gray-500">
                    {order.status === 'Order Cancelled' ? (
                      'Cancelled'
                    ) : (
                      <Select
                        defaultValue={order.status}
                        style={{ width: 150 }}
                        onChange={(newStatus) =>
                          handleStatusChange(order._id, newStatus)
                        }
                      >
                        <Option value="Processing">Processing</Option>
                        <Option value="Ready to Ship">Ready to Ship</Option>
                        <Option value="Order Shipped">Order Shipped</Option>
                        <Option value="Order Delivered">Order Delivered</Option>
                        <Option value="Order Cancelled">Order Cancelled</Option>
                        <Option value="Unable to Process">Unable to Process</Option>
                        <Option value="Refunded">Refunded</Option>
                      </Select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap text-sm text-center leading-5 text-gray-500 grid gap-4">
                    {order.status === 'Order Cancelled' ? (
                      <span>Actions Disabled</span>
                    ) : (
                      <>
                        <button onClick={() => handleViewClick(order)} className="text-indigo-600 hover:text-indigo-900">
                          View
                        </button>
                        <Link href={`/admin/bill/${order._id}`} target="_blank">
                          <button className="text-green-600 hover:text-green-900">
                            Print
                          </button>
                        </Link>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Modal
          title="Order Details"
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setModalVisible(false)}>
              Close
            </Button>,
          ]}
          className="max-w-3xl mx-auto"
        >
          {selectedOrder && (
            <div>
              <h2 className="text-2xl font-semibold">Product Details</h2>
              <Table
                columns={columns}
                dataSource={selectedOrder.products}
                rowKey={(record) => record._id}
                className="w-full mt-4"
              />
              <h3 className="text-xl font-semibold mt-6">Payment : {selectedOrder.paymentMethod}</h3>
              <h2 className="text-2xl font-semibold mt-6">User Address</h2>
              <p className="mb-2">Address: {selectedOrder.user.address}</p>
              <p className="mb-2">City: {selectedOrder.user.city}</p>
              <p>Zip Code: {selectedOrder.user.zip}</p>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default withAuth(Dashboard);
