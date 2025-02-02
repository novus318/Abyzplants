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
    pots: {
      potName: string;
      potPrice: number;
    }[];
  }[];
  offerPercentage: number;
  quantity: number;
  photo?: {
    image1: string;
  };
}

interface CategoriesScrollProps {
  categoryName?: string;
  categoryId?: number;
}

const CategoriesScroll: React.FC<CategoriesScrollProps> = ({ categoryName, categoryId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1280 },
      items: 4,
      partialVisibilityGutter: 40,
    },
    tablet: {
      breakpoint: { max: 1280, min: 768 },
      items: 3,
      partialVisibilityGutter: 32,
    },
    mobile: {
      breakpoint: { max: 768, min: 0 },
      items: 2,
      partialVisibilityGutter: 16,
    },
  };

  useEffect(() => {
    axios
      .get<{ products: Product[] }>(`${apiUrl}/api/product/get-ProductbyCategory/${categoryId}`)
      .then((response) => {
        setProducts(response.data.products);
        setLoading(false);
      })
      .catch((error) => {
        window.location.reload();
      });
  }, [categoryId]);

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        products?.length > 0 && (
          <section className="bg-white py-8 md:py-12">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
              <h2 className="text-lg md:text-2xl font-semibold text-primary mb-4 md:mb-6">
                {categoryName}
              </h2>
              
              <Carousel
                responsive={responsive}
                containerClass="carousel-container"
                itemClass="px-2"
                arrows
                rewindWithAnimation
                customTransition="transform 300ms ease-in-out"
              >
                {products.map((item) => (
                  <Link href={`/details/${item._id}`} key={item._id}>
                    <div className="group relative bg-secondary/20 rounded-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
                      {/* Image Container with 5:7 Aspect Ratio */}
                      <div className="relative pt-[90%]">
                        <img
                          src={item.photo?.image1}
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
                        <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                        
                        {/* Price Section */}
                        <div className="mt-auto">
                          {item.offerPercentage > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-xs line-through">
                                {item.sizes[0].pots[0] 
                                  ? `${(Number(item.sizes[0].price) + Number(item.sizes[0].pots[0].potPrice)).toFixed(1)} AED`
                                  : `${Number(item.sizes[0].price).toFixed(1)} AED`}
                              </span>
                              <span className="text-primary text-sm md:text-base font-semibold">
                                {(
                                  ((100 - item.offerPercentage) / 100) * 
                                  (Number(item.sizes[0].price) + 
                                  (item.sizes[0].pots[0]?.potPrice || 0))
                                ).toFixed(1)} AED
                              </span>
                            </div>
                          ) : (
                            <span className="text-primary text-sm md:text-base font-semibold">
                              {item.sizes[0].pots[0] 
                                ? `${(Number(item.sizes[0].price) + Number(item.sizes[0].pots[0].potPrice)).toFixed(1)} AED`
                                : `${Number(item.sizes[0].price).toFixed(1)} AED`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Restock Overlay */}
                      {item.quantity === 0 && (
                        <div className="absolute inset-0 bg-secondary/70 flex items-center justify-center">
                          <span className="text-destructive font-medium text-sm md:text-base">
                            Restocking Soon
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </Carousel>
            </div>
          </section>
        )
      )}
    </>
  );
};

export default CategoriesScroll;