import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import AdminSidebar from '@/components/AdminSidebar';
import { withAuth } from '../../components/withAuth';
import { Button } from 'antd';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"

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
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  offer: number;
  quantity: number;
  size: string;
  pots: {
    potName: string;
    potPrice: number;
  }
  code: string;
  status: string;
  color: string;
}

const Dashboard: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('thisWeek');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await Axios.get(`${apiUrl}/api/order/get-allOrders`, {
          params: {
            page: currentPage,
            pageSize: itemsPerPage,
            search: searchQuery
          }
        });
        
        if (response.data.success) {
          const sortedOrders = response.data.orders.sort((a: Order, b: Order) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setOrders(sortedOrders);
          setFilteredOrders(sortedOrders);
          setTotalPages(response.data.pagination?.totalPages || 1);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, itemsPerPage, searchQuery]);

  useEffect(() => {
    filterOrdersByDate(dateFilter);
  }, [dateFilter, orders]);

  const filterOrdersByDate = (filter: string) => {
    const today = new Date();
    let filtered = [...orders];

    switch (filter) {
      case 'today':
        filtered = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getDate() === today.getDate() &&
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getFullYear() === today.getFullYear()
          );
        });
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        filtered = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getDate() === yesterday.getDate() &&
            orderDate.getMonth() === yesterday.getMonth() &&
            orderDate.getFullYear() === yesterday.getFullYear()
          );
        });
        break;
      case 'thisWeek':
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - today.getDay());
        filtered = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= firstDayOfWeek;
        });
        break;
      case 'thisMonth':
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        filtered = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= firstDayOfMonth;
        });
        break;
      case 'last6Months':
        const firstDayOfLast6Months = new Date(
          today.getFullYear(),
          today.getMonth() - 6,
          today.getDate()
        );
        filtered = orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= firstDayOfLast6Months;
        });
        break;
      default:
        break;
    }

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleViewClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const formatDateTime = (dateTime: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };

    return new Date(dateTime).toLocaleString(undefined, options);
  };

  const handleStatusChange = async (orderId: string, productId: string, newStatus: string, size: any, color: any) => {
    try {
      const response = await Axios.put(`${apiUrl}/api/order/orders/${orderId}/${productId}`, { 
        newStatus, 
        size, 
        color 
      });
      
      if (response.data.success) {
        const updatedOrders = orders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);
        setFilteredOrders(updatedOrders);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={i === currentPage}
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      if (startPage > 1) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={i === currentPage}
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (endPage < totalPages) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    return items;
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-4 ml-64">
        <h1 className="text-3xl font-semibold mb-4">Orders</h1>
        
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Search by Order ID, Customer, Email, etc."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md"
          />
          
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Date Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="last6Months">Last 6 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading...</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Order ID</TableHead>
                    <TableHead className="text-center">Date & Time</TableHead>
                    <TableHead className="text-center">Customer</TableHead>
                    <TableHead className="text-center">Email</TableHead>
                    <TableHead className="text-center">Phone Number</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="text-center">
                          {order._id.substring(16)}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDateTime(order.createdAt)}
                        </TableCell>
                        <TableCell className="text-center">
                          {order.user?.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {order.user?.email}
                        </TableCell>
                        <TableCell className="text-center">
                          {order.user?.phone}
                        </TableCell>
                        <TableCell className="text-center">
                          {order.total.toFixed(2)} AED
                        </TableCell>
                        <TableCell className="text-center space-x-2">
                          <Button 
                            onClick={() => handleViewClick(order)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </Button>
                          <Link href={`/admin/bill/${order._id}`} target="_blank">
                            <Button className="text-green-600 hover:text-green-900">
                              Print
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {renderPaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Product Details</h2>
                  <div className="rounded-md border mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center">Name</TableHead>
                          <TableHead className="text-center">Code</TableHead>
                          <TableHead className="text-center">Price</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-center">Size</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.products.map((product) => (
                          <TableRow
                            key={product._id}
                            className={
                              product.status === 'Order Cancelled' ? 'bg-red-100' :
                              product.status === 'Return' ? 'bg-yellow-100' :
                              product.status === 'Order Delivered' || product.status === 'Refunded' ? 'bg-green-100' :
                              'bg-gray-100'
                            }
                          >
                            <TableCell className="text-center">{product.name}</TableCell>
                            <TableCell className="text-center">{product.code}</TableCell>
                            <TableCell className="text-center">
                              {product.pots?.potPrice ? 
                                (product.offer
                                  ? ((Number(product.price) + Number(product.pots.potPrice)) * (1 - product.offer / 100)).toFixed(2)
                                  : (Number(product.price) + Number(product.pots.potPrice)).toFixed(2)) :
                                (product.offer
                                  ? (product.price * (1 - product.offer / 100)).toFixed(2)
                                  : product.price.toFixed(2))} AED
                            </TableCell>
                            <TableCell className="text-center">{product.quantity}</TableCell>
                            <TableCell className="text-center">
                              {product.size || 'N/A'} 
                              {product.pots?.potPrice && ` / ${product.pots.potName}`} 
                              {product.color && ` / ${product.color}`}
                            </TableCell>
                            <TableCell className="text-center">
                              <Select
                                value={product.status}
                                onValueChange={(newStatus) => 
                                  handleStatusChange(
                                    selectedOrder._id, 
                                    product._id, 
                                    newStatus,
                                    product.size,
                                    product.color
                                  )
                                }
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {product.status === 'Order Cancelled' ? (
                                    selectedOrder.paymentMethod === 'Cash on Delivery' ? (
                                      <SelectItem value="Order Cancelled">Cancelled</SelectItem>
                                    ) : (
                                      <SelectItem value="Refunded">Refunded</SelectItem>
                                    )
                                  ) : product.status === 'Return' ? (
                                    <SelectItem value="Refunded">Refunded</SelectItem>
                                  ) : (
                                    <>
                                      <SelectItem value="Processing">Processing</SelectItem>
                                      <SelectItem value="Ready to Ship">Ready to Ship</SelectItem>
                                      <SelectItem value="Order Shipped">Order Shipped</SelectItem>
                                      <SelectItem value="Order Delivered">Order Delivered</SelectItem>
                                      <SelectItem value="Order Cancelled">Order Cancelled</SelectItem>
                                      <SelectItem value="Unable to Process">Unable to Process</SelectItem>
                                      <SelectItem value="Refunded">Refunded</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Payment: {selectedOrder.paymentMethod}</h3>
                </div>

                <div>
                  <h2 className="text-xl font-semibold">User Address</h2>
                  <div className="mt-2 space-y-1">
                    <p>Address: {selectedOrder.user?.address}</p>
                    <p>City: {selectedOrder.user?.city}</p>
                    <p>Zip Code: {selectedOrder.user?.zip}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default withAuth(Dashboard);