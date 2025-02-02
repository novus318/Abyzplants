import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import Spinner from './Spinner';
import { Badge } from './ui/badge';

interface Product {
  _id: string;
  name: string;
  description: string;
  sizes: {
    name: string;
    price: number;
  }[];
  images:{
    image1:string;
    image2:string;
    image3:string;
    image4:string;
    image5:string;
    image6:string;
    image7:string;
  }
  offerPercentage: number;
  code: string;
}

const BestPots = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    axios
      .get<{ products: Product[] }>(`${apiUrl}/api/pot/get-pot`)
      .then((response) => {
        setProducts(response.data.products);
        setLoading(false);
      })
      .catch((error) => {
        window.location.reload();
      });
  }, []);

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5,
      partialVisibilityGutter: 40,
    },
    tablet: {
      breakpoint: { max: 1024, min: 564 },
      items: 44,
      partialVisibilityGutter: 30,
    },
    mobile: {
      breakpoint: { max: 564, min: 0 },
      items: 2,
      partialVisibilityGutter: 20,
    },
  };

  return (
        <>
        {products.length > 0 && (
          <section className="bg-white py-8">
          <div className="container m-auto px-4">
            <h2 className="text-lg md:text-2xl font-semibold text-primary mb-4 md:mb-6">Best Selling Pots</h2>
            <Carousel
              responsive={responsive}
              containerClass="carousel-container"
              additionalTransfrom={0}
              sliderClass=""
              itemClass="px-2"
            >
              {products?.length === 0 ? (
                <p>No products available</p>
              ) : (
                products?.map((item: any) => (
                  <Link href={`/potDetails/${item._id}`} key={item._id}>
                        <div className="group relative bg-secondary/20 rounded-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
                      {/* Image Container with 5:7 Aspect Ratio */}
                      <div className="relative pt-[90%]">
                        <img
                          src={item.images?.image1}
                          alt={item.name}
                          className="absolute top-0 left-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        
                        {/* Discount Badge */}
                        {item.offerPercentage > 0 && (
                          <Badge variant='destructive' className="absolute top-1 right-1">
                            {item.offerPercentage}% OFF
                          </Badge>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1 truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-1">
                          {item.description}
                        </p>
                        
                        {/* Price Section */}
                        <div className="mt-auto">
                          {item.offerPercentage > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-xs line-through">
                              {Number(item.sizes[0]?.price).toFixed(1)}
                              </span>
                              <span className="text-primary text-sm md:text-base font-semibold">
                              {(
                                      ((100 - item.offerPercentage) / 100) * Number(item.sizes[0]?.price)
                                    ).toFixed(1)}{' '}
                                    AED
                              </span>
                            </div>
                          ) : (
                            <span className="text-primary text-sm md:text-base font-semibold">
                            {Number(item.sizes[0].price).toFixed(2)} AED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Restock Overlay */}
                      {item.quantity === 0 && (
                        <div className="absolute inset-0 bg-secondary bg-opacity-90 flex items-center justify-center">
                          <span className="text-destructive font-medium text-sm md:text-base">
                            Restocking Soon
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                )))}
            </Carousel>
          </div>
        </section>
        )}
        </>
     )}

export default BestPots;
