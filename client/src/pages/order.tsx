import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Spinner from '@/components/Spinner';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { format } from 'date-fns';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';

interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  totalPrice: number;
  offer: number;
  quantity: number;
  cancelledQuantity: number;
  size: string;
  color: string;
  pots: {
    potName: string;
    potPrice: number;
  };
  status: string;
  returnedQuantity: number;
  returnHistory: Array<{
    date: string;
    quantity: number;
    reason: string;
    status: string;
    refundAmount: number;
  }>;
  cancellationHistory: Array<{
    date: string;
    quantity: number;
    reason: string;
    refundAmount: number;
  }>;
}

interface Order {
  _id: string;
  products: Product[];
  total: number;
  paymentMethod: string;
  createdAt: string;
  orderStatus: string;
}

const Order = () => {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<Order[] | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('thisWeek');

  // Return Dialog State
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [returnReason, setReturnReason] = useState('');
  const [returnProcessing, setReturnProcessing] = useState(false);

  // Cancel Dialog State
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelProcessing, setCancelProcessing] = useState(false);
  const [cancelQuantity, setCancelQuantity] = useState(1);

  // History Dialog State
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

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
    return format(new Date(dateString), 'MMMM d, yyyy h:mm a');
  };

  const openReturnDialog = (orderId: string, product: Product) => {
    setSelectedOrderId(orderId);
    setSelectedProduct(product);
    setReturnQuantity(1);
    setReturnReason('');
    setReturnDialogOpen(true);
  };

  const openCancelDialog = (orderId: string, product: Product) => {
    setSelectedOrderId(orderId);
    setSelectedProduct(product);
    setCancelReason('');
    setCancelDialogOpen(true);
  };

  const openHistoryDialog = (product: Product) => {
    setSelectedProduct(product);
    setHistoryDialogOpen(true);
  };

  const handleReturnSubmit = async () => {
    if (!selectedProduct || !returnReason) return;
    
    setReturnProcessing(true);
    try {
      const response = await axios.post(`${apiUrl}/api/order/request-return`, {
        orderId: selectedOrderId,
        productId: selectedProduct._id,
        quantity: returnQuantity,
        reason: returnReason
      });

      if (response.data.success) {
        toast.success('Return request submitted successfully');
        setReturnDialogOpen(false);
        await fetchOrders();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit return request');
    } finally {
      setReturnProcessing(false);
    }
  };

  const handleCancelSubmit = async () => {
    if (!selectedProduct || !cancelReason) return;
    
    setCancelProcessing(true);
    try {
      const response = await axios.post(`${apiUrl}/api/order/cancel-product`, {
        orderId: selectedOrderId,
        productId: selectedProduct._id,
        quantity: cancelQuantity,
        reason: cancelReason
      });

      if (response.data.success) {
        toast.success('Product cancellation requested successfully');
        setCancelDialogOpen(false);
        await fetchOrders();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel product');
    } finally {
      setCancelProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing':
      case 'Ready to Ship':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Order Shipped':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'Order Delivered':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Order Cancelled':
      case 'Return Rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'Partially Cancelled':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'Return Requested':
      case 'Return Approved':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'Return Received':
      case 'Refunded':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getActionButtons = (order: Order, product: Product) => {
    const availableToReturn = product.quantity - (product.returnedQuantity || 0);
    const canReturn = ['Order Delivered', 'Return Requested', 'Return Approved'].includes(product.status) && availableToReturn > 0;
    const canCancel = ['Processing', 'Ready to Ship', 'Partially Cancelled'].includes(product.status);

    return (
      <div className="flex flex-wrap gap-2 text-xs">
        {canCancel && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive hover:bg-destructive/10"
            onClick={() => openCancelDialog(order._id, product)}
          >
            Cancel
          </Button>
        )}

        {canReturn && (
          <Button
            variant="outline"
            size="sm"
            className="text-primary border-primary hover:bg-primary/10"
            onClick={() => openReturnDialog(order._id, product)}
          >
            {product.status === 'Return Requested' || product.status === 'Return Approved' 
              ? 'Update Return' 
              : 'Return'}
          </Button>
        )}

        {(product.returnHistory?.length > 0 || product.cancellationHistory?.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openHistoryDialog(product)}
          >
            View History
          </Button>
        )}
      </div>
    );
  };

  const calculateRefundAmount = (product: Product, qty: number) => {
    if (!product) return 0;
    
    // Calculate base price (product + pot if exists)
    const basePrice = product.price + (product.pots?.potPrice || 0);
    
    // Apply discount if exists
    const discountedPrice = product.offer 
      ? basePrice * (1 - product.offer / 100)
      : basePrice;
    
    return (discountedPrice * qty).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background">
          <Header />
      <main className="container mx-auto max-w-4xl py-8 px-2 mt-10">
        <h1 className="text-3xl font-semibold text-primary mb-8 text-center">Your Orders</h1>
        
        <div className="flex flex-wrap justify-center gap-1 mb-6">
          {['thisWeek', 'lastWeek', 'thisMonth', 'thisYear'].map((filter) => (
            <Button
              key={filter}
              size="sm"
              variant={selectedFilter === filter ? 'default' : 'outline'}
              onClick={() => handleFilterChange(filter)}
              className="capitalize text-xs"
            >
              {filter.replace(/([A-Z])/g, ' $1').trim()}
            </Button>
          ))}
              </div>

              <ScrollArea className="h-[calc(100vh-300px)]">
  {orderData?.length ? (
    <div className="space-y-4">
      {orderData.map((order) => (
        <div
          key={order._id}
          className="bg-card rounded-lg shadow-sm border p-4 md:p-6 space-y-4"
        >
          {/* Order Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Order #{order._id.substring(order._id.length - 6).toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTo12HourTime(order.createdAt)}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="outline">{order.paymentMethod}</Badge>
                <Badge>{order.orderStatus}</Badge>
              </div>
            </div>
            <div className="text-base font-semibold text-primary">
              {order.total.toFixed(2)} AED
            </div>
          </div>

          {/* Product List */}
          <div className="space-y-2">
            <h3 className="font-medium text-base">Products</h3>
            {order.products.map((product, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row gap-4 border-b pb-4 last:border-b-0"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-md shrink-0"
                />

                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold text-sm text-gray-900">
                    {product.name}
                  </h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      Size: {product.size}{" "}
                      {product.pots && `• ${product.pots.potName}`}
                    </p>
                    {product.color && <p>Color: {product.color}</p>}
                    <div className="flex flex-wrap items-center gap-2">
                      <p>Quantity: {product.quantity}</p>
                      {product.cancelledQuantity > 0 && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Cancelled: {product.cancelledQuantity}
                        </Badge>
                      )}
                      {product.returnedQuantity > 0 && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Returned: {product.returnedQuantity}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs md:text-sm font-medium">
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
                  <p className="text-xs md:text-sm font-medium">
                    Total Price: {(product?.totalPrice || 0).toFixed(2)} AED
                  </p>
                </div>

                <div className="flex md:flex-col justify-between md:items-end gap-2 md:gap-3">
                  <Badge className={getStatusColor(product.status)}>
                    {product.status}
                  </Badge>
                  {getActionButtons(order, product)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center text-muted-foreground py-16">
      No orders found for the selected period.
    </div>
  )}
</ScrollArea>

      </main>
      <Footer />

      {/* Return Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Product Return</DialogTitle>
            <DialogDescription>
              Fill out the form to request a return for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Return Quantity</label>
              <Select
                value={returnQuantity.toString()}
                onValueChange={(value) => setReturnQuantity(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select quantity" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: Math.min(selectedProduct?.quantity - (selectedProduct?.returnedQuantity || 0), 10) }, 
                    (_, i) => i + 1
                  ).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Available to return: {selectedProduct?.quantity - (selectedProduct?.returnedQuantity || 0)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for Return</label>
              <Select
                value={returnReason}
                onValueChange={setReturnReason}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Damaged Product">Damaged Product</SelectItem>
                  <SelectItem value="Wrong Item Shipped">Wrong Item Shipped</SelectItem>
                  <SelectItem value="Product Not as Described">Product Not as Described</SelectItem>
                  <SelectItem value="Changed Mind">Changed Mind</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {returnReason && (
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm font-medium text-blue-800">
                  Estimated Refund: {calculateRefundAmount(selectedProduct!, returnQuantity)} AED
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Note: Shipping fees are not refundable
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setReturnDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReturnSubmit}
              disabled={!returnReason || returnProcessing}
            >
              {returnProcessing ? 'Submitting...' : 'Submit Return Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cancel Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel {selectedProduct?.name}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity to Cancel</label>
              <Select
                value={cancelQuantity.toString()}
                onValueChange={(value) => setCancelQuantity(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select quantity" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: Math.min(selectedProduct?.quantity - (selectedProduct?.cancelledQuantity || 0), 10) }, 
                    (_, i) => i + 1
                  ).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Available to cancel: {selectedProduct?.quantity - (selectedProduct?.cancelledQuantity || 0)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for Cancellation</label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please specify the reason for cancellation"
                className="min-h-[100px]"
              />
            </div>

            {cancelReason && (
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm font-medium text-blue-800">
                  Estimated Refund: {calculateRefundAmount(selectedProduct!, cancelQuantity)} AED
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCancelDialogOpen(false)}
            >
              Go Back
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelSubmit}
              disabled={!cancelReason || cancelProcessing}
            >
              {cancelProcessing ? 'Processing...' : 'Confirm Cancellation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order History</DialogTitle>
            <DialogDescription>
              History for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="return" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="return">Return History</TabsTrigger>
              <TabsTrigger value="cancel">Cancellation History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="return">
              <ScrollArea className="h-96 rounded-md border p-4">
                {selectedProduct?.returnHistory?.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {selectedProduct.returnHistory.map((item: any, index: number) => (
                      <AccordionItem key={index} value={`return-${index}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-4">
                            <span className="font-medium">
                              {format(new Date(item.date), 'MMM d, yyyy h:mm a')}
                            </span>
                            <Badge variant="outline">
                              {item.status}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pl-2">
                            <p><span className="font-medium">Quantity:</span> {item.quantity}</p>
                            <p><span className="font-medium">Reason:</span> {item.reason}</p>
                            {item.refundAmount > 0 && (
                              <p><span className="font-medium">Refund Amount:</span> {item.refundAmount} AED</p>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No return history available
                  </p>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="cancel">
              <ScrollArea className="h-96 rounded-md border p-4">
                {selectedProduct?.cancellationHistory?.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {selectedProduct.cancellationHistory.map((item: any, index: number) => (
                      <AccordionItem key={index} value={`cancel-${index}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-4">
                            <span className="font-medium">
                              {format(new Date(item.date), 'MMM d, yyyy h:mm a')}
                            </span>
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Cancelled
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pl-2">
                            <p><span className="font-medium">Quantity:</span> {item.quantity}</p>
                            <p><span className="font-medium">Reason:</span> {item.reason}</p>
                            {item.refundAmount > 0 && (
                              <p><span className="font-medium">Refund Amount:</span> {item.refundAmount} AED</p>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No cancellation history available
                  </p>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
        </div>
  );
};

export default Order;