import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import Spinner from './Spinner';

interface Product {
  _id: string;
  name: string;
  description: string;
  sizes: {
    name: string;
    price: number;
    pots:
    {
      potName: string;
      potPrice: number;
    }[]
  }[];
  offerPercentage: number;
}

const BestSellers = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    axios
      .get<{ products: Product[] }>(`${apiUrl}/api/product/get-product`)
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
      items: 4,
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
      {loading ? (
        <Spinner />
      ) : (
        <section className="bg-white py-8">
          <div className="container m-auto px-4">
            <h2 className="text-2xl font-semibold text-[#5f9231] mb-2">Best Sellers</h2>
            <Carousel
              responsive={responsive}
              containerClass="carousel-container"
              additionalTransfrom={0}
              sliderClass=""
              itemClass="p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6"
            >
              {products?.length === 0 ? (
                <p>No products available</p>
              ) : (
                products?.map((item: any) => (
                  <Link href={`/details/${item._id}`} key={item._id}>
               <div
                      key={item._id}
                      className={`relative bg-gray-50 rounded-lg overflow-hidden shadow-md transform transition-transform duration-300 hover:shadow-xl ${
                        item.quantity === 0 ? 'opacity-50' : ''
                      }`}
                    >
                      {item.offerPercentage > 0 && (
                        <div className="absolute top-2 right-2 bg-[#5f9231] text-white rounded-full p-1 text-sm font-semibold">
                          {item.offerPercentage}% OFF
                        </div>
                      )}
                      <img
                        src={item.photo?.image1}
                        alt={item.name}
                        className="w-full object-cover hover:scale-105"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold uppercase text-xs md:text-sm truncate">
                          {item.name}
                        </h3>
                        <p className="text-gray-700 text-xs  truncate">
                          {item.description}
                        </p>
                        <div className="flex items-center">
                          {item.offerPercentage > 0 ? (
                            <>
                              <span className="text-[#a14e3a] font-semibold text-sm md:text-sm  mr-2">
                                {item.sizes[0].pots[0] ?
                                 (<s>{(Number(item.sizes[0].price) + Number(item.sizes[0].pots[0].potPrice)).toFixed(1)}</s>):(
                                  <s>{Number(item.sizes[0].price).toFixed(1)}</s>
                                )}
                              </span>
                              {item.sizes[0]?.pots[0] ? (
                                <span className="text-[#5f9231] font-semibold text-sm md:text-sm lg:text-base xl:text-lg">
                                {(
                                  ((100 - item.offerPercentage) / 100) * (Number(item.sizes[0].price) +
                                  Number(item.sizes[0].pots[0].potPrice))
                                ).toFixed(1)} AED
                              </span>                              
                              ):
                              (<span className="text-[#5f9231] font-semibold text-sm md:text-sm lg:text-base xl:text-lg">
                                {(
                                  ((100 - item.offerPercentage) / 100) * Number(item.sizes[0].price)
                                ).toFixed(1)}{' '}
                                AED
                              </span>)}
                            </>
                          ) : (
                            <>
                            {item.sizes[0].pots[0] ? (<span className="text-[#a14e3a] font-semibold text-sm md:text-sm lg:text-base xl:text-lg">
                            {(Number(item.sizes[0].price) + Number(item.sizes[0].pots[0].potPrice)).toFixed(1)} AED
                            </span>):(<span className="text-[#a14e3a] font-semibold text-sm md:text-sm lg:text-base xl:text-lg">
                              {Number(item.sizes[0].price).toFixed(2)} AED
                            </span>)}
                            </>
                          )}
                        </div>
                      </div>
                      {item.quantity === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70 text-white text-lg font-semibold">
                          Restocking Soon
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
  );
};

export default BestSellers;
