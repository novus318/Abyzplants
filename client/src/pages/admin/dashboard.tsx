import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import AdminSidebar from '@/components/AdminSidebar';
import { withAuth } from '../../components/withAuth';
import { Input } from "@/components/ui/input"
import { OrdersTable } from '@/components/OrdersTable';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [totalOrders, setTotalOrders] = useState(0);

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
        setTotalPages(response.data.pagination.totalPages);
        setTotalOrders(response.data.pagination.totalOrders);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, itemsPerPage, searchQuery]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6 ml-64">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage and track all customer orders</p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by order ID or customer name..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-medium">All Orders ({totalOrders})</h2>
            </div>
            <OrdersTable orders={orders} onStatusChange={fetchOrders}/>
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum:any;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default withAuth(Dashboard);