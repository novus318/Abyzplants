import { format } from "date-fns"
import { Eye, AlertCircle, CheckCircle2, Clock, Package2, XCircle, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { OrderService } from "@/lib/orderService"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"



export function OrdersTable({ orders, onStatusChange }: any) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const router = useRouter()

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "MMM dd, yyyy")
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-AE", {
            style: "currency",
            currency: "AED",
        }).format(amount)
    }


    const handleApproveReturn = async (orderId: string, productId: string) => {
        try {
            // Replace 'admin123' with actual admin ID from your auth context
            await OrderService.approveReturn(orderId, productId, 'admin123');
            toast({
                title: "Return Approved",
                description: "The return request has been approved.",
                variant: "default",
            });
            onStatusChange(); // Refresh the orders list
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to approve return.",
                variant: "destructive",
            });
        }
    };

    // Handle reject return
    const handleRejectReturn = async (orderId: string, productId: string) => {
        try {
            await OrderService.rejectReturn(orderId, productId, 'admin123');
            toast({
                title: "Return Rejected",
                description: "The return request has been rejected.",
                variant: "default",
            });
            onStatusChange();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to reject return.",
                variant: "destructive",
            });
        }
    };

    // Handle complete return
    const handleCompleteReturn = async (orderId: string, productId: string) => {
        try {
            await OrderService.completeReturn(orderId, productId, 'admin123');
            toast({
                title: "Return Completed",
                description: "The return process has been completed.",
                variant: "default",
            });
            onStatusChange();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to complete return.",
                variant: "destructive",
            });
        }
    };

    // Handle status change
    const handleStatusChange = async (orderId: string, status: string, productId?: string) => {
        try {
            await OrderService.changeOrderStatus(orderId, status, productId);
            toast({
                title: "Status Updated",
                description: "The status has been updated successfully.",
                variant: "default",
            });
            onStatusChange();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update status.",
                variant: "destructive",
            });
        }
    };
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order: any) => (
                        <TableRow key={order._id}>
                            <TableCell className="font-medium">{order._id.substring(order._id.length - 6)}</TableCell>
                            <TableCell>{order.user.name}</TableCell>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            <TableCell>{order.products.length}</TableCell>
                            <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                            <TableCell className="text-right gap-2 flex justify-end">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Eye className="mr-2 h-4 w-4" />
                                            View
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl">
                                        <DialogHeader>
                                            <DialogTitle>Order Details</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid grid-cols-2 gap-4 py-4">
                                            <div>
                                                <h3 className="font-semibold text-xs text-muted-foreground">Order Information</h3>
                                                <div className="mt-2 space-y-2 text-xs">
                                                    <p>
                                                        <span className="font-medium">Order ID:</span> {order._id}
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">Date:</span> {formatDate(order.createdAt)}
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">Status:</span> {order.orderStatus}
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">Payment Method:</span> {order.paymentMethod}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-xs text-muted-foreground">Customer Information</h3>
                                                <div className="mt-2 space-y-2 text-xs">
                                                    <p>
                                                        <span className="font-medium">Name:</span> {order.user.name}
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">Email:</span> {order.user.email}
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">Phone:</span> {order.user.phone}
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">Address:</span> {order.user.address}, {order.user.city},{" "}
                                                        {order.user.zip}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <Separator />
                                        <h3 className="font-semibold mt-4">Order Items</h3>
                                        <ScrollArea className="h-[300px] mt-2">
                                            <div className="space-y-4">
                                                {order.products.map((product: any) => (
                                                    <div key={product._id} className="flex gap-4 p-2 border rounded-md">
                                                        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                                            <img
                                                                src={product.image || "/placeholder.svg"}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    ; (e.target as HTMLImageElement).src = "/placeholder.svg?height=64&width=64"
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <h4 className="font-medium">{product.name}</h4>
                                                                <p className="font-medium">{formatCurrency(product.totalPrice)}</p>
                                                            </div>
                                                            <div className="text-sm text-muted-foreground mt-1">
                                                                <p>Size: {product.size}</p>
                                                                {product.pots && (
                                                                    <p>
                                                                        Pot: {product.pots.potName} (+{formatCurrency(product.pots.potPrice)})
                                                                    </p>
                                                                )}
                                                                <div className="flex justify-between mt-2">
                                                                    <p>
                                                                        Qty: {product.quantity} × {formatCurrency(product.price)}
                                                                    </p>
                                                                    <div> {product.status === 'Return Requested' && (
                                                                        <div className="flex gap-2 mt-2">
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={() => handleApproveReturn(order._id, product._id)}
                                                                            >
                                                                                Approve Return
                                                                            </Button>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => handleRejectReturn(order._id, product._id)}
                                                                            >
                                                                                Reject Return
                                                                            </Button>
                                                                        </div>
                                                                    )}

                                                                        {product.status === 'Return Approved' && (
                                                                            <Button
                                                                                size="sm"
                                                                                className="mt-2"
                                                                                onClick={() => handleCompleteReturn(order._id, product._id)}
                                                                            >
                                                                                Mark as Return Received
                                                                            </Button>
                                                                        )}

                                                                        {/* Status change dropdown example */}
                                                                        <Select
                                                                            value={product.status}
                                                                            onValueChange={(value) => handleStatusChange(order._id, value, product._id)}
                                                                        >
                                                                            <SelectTrigger className="mt-2 p-2 border rounded">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="Processing">Processing</SelectItem>
                                                                                <SelectItem value="Ready to Ship">Ready to Ship</SelectItem>
                                                                                <SelectItem value="Order Shipped">Order Shipped</SelectItem>
                                                                                <SelectItem value="Order Delivered">Order Delivered</SelectItem>
                                                                                <SelectItem value="Return Requested">Return Requested</SelectItem>
                                                                                <SelectItem value="Order Cancelled">Order Cancelled</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                        <Separator />
                                        <div className="mt-4 space-y-2">
                                            <div className="flex justify-between">
                                                <span>Subtotal</span>
                                                <span>{formatCurrency(order.total - order.shippingFee)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Shipping</span>
                                                <span>{formatCurrency(order.shippingFee)}</span>
                                            </div>
                                            {order.refundedAmount > 0 && (
                                                <div className="flex justify-between text-red-500">
                                                    <span>Refunded</span>
                                                    <span>-{formatCurrency(order.refundedAmount)}</span>
                                                </div>
                                            )}
                                            <Separator />
                                            <div className="flex justify-between font-bold">
                                                <span>Total</span>
                                                <span>{formatCurrency(order.total)}</span>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/admin/bill/${order._id}`)}
                                >
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
