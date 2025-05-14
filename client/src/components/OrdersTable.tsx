import { format } from "date-fns"
import { Eye, AlertCircle, CheckCircle2, Clock, Package2, XCircle, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"



export function OrdersTable({ orders}: any) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter()
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Processing":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            <Clock className="mr-1 h-3 w-3" /> Processing
          </Badge>
        )
      case "Ready to Ship":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
            <Package2 className="mr-1 h-3 w-3" /> Ready to Ship
          </Badge>
        )
      case "Order Shipped":
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200">
            <Package2 className="mr-1 h-3 w-3" /> Shipped
          </Badge>
        )
      case "Delivered":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Delivered
          </Badge>
        )
      case "Cancelled":
      case "Order Cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            <XCircle className="mr-1 h-3 w-3" /> Cancelled
          </Badge>
        )
      case "Partially Cancelled":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
            <AlertCircle className="mr-1 h-3 w-3" /> Partially Cancelled
          </Badge>
        )
      case "Return Requested":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
            <AlertCircle className="mr-1 h-3 w-3" /> Return Requested
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(amount)
  }

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
          {orders.map((order:any) => (
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
                        {order.products.map((product:any) => (
                          <div key={product._id} className="flex gap-4 p-2 border rounded-md">
                            <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                              <img
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=64&width=64"
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
                                  <div>{getStatusBadge(product.status)}</div>
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
