import Spinner from '@/components/Spinner';
import axios from 'axios';
import { useRouter } from 'next/router';
import logo from '@/images/logo.webp'
import React, { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { withAuth } from '@/components/withAuth';

interface Order {
  _id: string;
  products: {
    _id: string;
    code: string;
    name: string;
    status: string;
    price: number;
    offer: number;
    quantity: number;
    size: string;
    pots:
    {
      potName: string;
      potPrice: number;
    }
  }[];
  total: number;
  paymentMethod: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    zip: string;
    city: string;
  };
}

const Bill: React.FC = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { pid } = router.query;
  const componentRef = useRef(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;


  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  useEffect(() => {
    if (pid) {
      axios
        .get(`${apiUrl}/api/order/get-orderById/${pid}`)
        .then((response) => {
          setOrder(response.data.order);
          setLoading(false);
        })
        .catch((error) => { });
    }
  }, [pid]);

  return (
    <>
      {loading ? (
        <Spinner />
      ) : order ? (<div className='bg-gray-400 min-h-screen pt-10'>
        <div className="text-center mb-4">
          <button
            className="bg-gray-100 text-black p-2 rounded-md"
            onClick={handlePrint}
          >
            Print Bill
          </button>
        </div>
        <div ref={componentRef} className="bg-white p-4 px-8 h-full w-full text-black print:block">
          <div className="text-center py-2">
            <img src={logo.src} alt="Your Logo" className="w-auto h-10 mx-auto mb-4" />
          </div>
          <div className="my-5">
            <div className="flex justify-between mb-2">
              <div className="text-black">
                <p className="font-semibold text-2xl mb-2">Abyzplants</p>
                <p className="text-sm">
                  Explore a world of greenery at Abyzplants<br />Shop with us for quality, care, and exceptional greenery.
                </p>
                <p className="text-lg">
                  International City - Dubai - United Arab Emirates
                </p>
                <p className="text-sm">
                  Contact us: info@abyzplants.com
                </p>
                <p className="text-sm">
                  Phone: +971 58 953 7998
                </p>
              </div>
              <div>
                <p className="font-bold text-right text-lg">Date</p>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="max-w-xs">
                <p className="font-bold text-lg">Customer :</p>
                <p>Name: {order.user.name}</p>
                <p>Email: {order.user.email}</p>
                <p>Phone: {order.user.phone}</p>
                <p className="whitespace-normal">
                  Address: {order.user.city}
                  <br />
                  {order.user.address}-{order.user.zip}
                </p>
              </div>
              <div className="mt-4 text-right">
                <p className="font-bold text-lg">Payment Method</p>
                <p className='font-medium text-base'>{order.paymentMethod}</p>
              </div>
            </div>
            <div className="mt-5">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-b">Code</th>
                    <th className="border-b">Name</th>
                    <th className="border-b">Price</th>
                    <th className="border-b">Quantity</th>
                    <th className="border-b">Size</th>
                    <th className="border-b">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products.map((product, i) => (
                    product.status !== 'Order Cancelled' && (
                      <tr key={i}>
                        <td className="border text-center">{product.code}</td>
                        <td className="border text-center">{product.name}</td>
                        <td className="border text-center">
                          {product.pots?.potPrice ?
                            (<>
                              {product.offer
                                ? ((Number(product.price) + Number(product.pots.potPrice)) * (1 - product.offer / 100)).toFixed(2)
                                : (Number(product.price) + Number(product.pots.potPrice)).toFixed(2)}
                            </>) :
                            (<>
                              {product.offer
                                ? (product.price * (1 - product.offer / 100)).toFixed(2)
                                : product.price.toFixed(2)}
                            </>)}
                        </td>
                        <td className="border text-center">{product.quantity}</td>
                        <td className="border text-center">{product.size} {product.pots && `/ ${product.pots.potName}`}</td>
                        <td className="border text-center">
                          {product.pots?.potPrice ? (<>
                            {(((Number(product.price) + Number(product.pots.potPrice)) * (1 - product.offer / 100)) * product.quantity).toFixed(2)}</>) :
                            (<>{((product.price * (1 - product.offer / 100)) * product.quantity).toFixed(2)}</>)} AED
                        </td>
                      </tr>
                    )
                  ))}
                  <br />
                  <tr>
                    <td></td>
                    <td></td>
                    <td className="text-center font-bold">Total Quantity:</td>
                    <td className="border text-center font-bold">
                      {order.products.reduce((total, product) => {
                        return product.status !== 'Order Cancelled' ? total + product.quantity : total;
                      }, 0)}
                    </td>
                    <td className="text-center font-bold">Subtotal:</td>
                    <td className="border text-center font-bold">
                      {order.products
                        .filter(product => product.status !== 'Order Cancelled')
                        .reduce((total, product) => {
                          const productSubtotal = product.pots?.potPrice
                            ? (((Number(product.price) + Number(product.pots.potPrice)) * (1 - product.offer / 100)) * product.quantity)
                            : ((product.price * (1 - product.offer / 100)) * product.quantity);
                          return total + productSubtotal;
                        }, 0)
                        .toFixed(2)} AED
                    </td>

                  </tr>
                  <br />
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td className='font-bold text-lg text-right'>Shipping :</td>
                    <td className="font-semibold text-lg text-center">
                      {order.products
                        .filter(product => product.status !== 'Order Cancelled')
                        .reduce((total, product) => {
                          const productSubtotal = product.pots?.potPrice
                            ? (((Number(product.price) + Number(product.pots.potPrice)) * (1 - product.offer / 100)) * product.quantity)
                            : ((product.price * (1 - product.offer / 100)) * product.quantity);
                          return total + productSubtotal;
                        }, 0) < 100 ? '13 AED' : 'Free'}
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td className='font-bold text-lg text-right'>Total :</td>
                    <td className='font-semibold border text-lg text-center'>{(() => {
                      const subtotal = order.products
                        .filter(product => product.status !== 'Order Cancelled')
                        .reduce((total, product) => {
                          const productSubtotal = product.pots?.potPrice
                            ? (((Number(product.price) + Number(product.pots.potPrice)) * (1 - product.offer / 100)) * product.quantity)
                            : ((product.price * (1 - product.offer / 100)) * product.quantity);
                          return total + productSubtotal;
                        }, 0);

                      const shippingCost = subtotal < 100 ? 13 : 0;
                      const totalAmount = (subtotal + shippingCost).toFixed(2);

                      return `${totalAmount} AED`;
                    })()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>


      </div>

      ) : (
        <p>No order data available.</p>
      )}
    </>
  );
};

export default withAuth(Bill);
