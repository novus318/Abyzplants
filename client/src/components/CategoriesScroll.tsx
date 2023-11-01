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
  price: number;
  offerPercentage: number;
}
interface CategoriesScrollProps {
    categoryName?: string;
    categoryId?: number;
  }


  const CategoriesScroll: React.FC<CategoriesScrollProps> = ({categoryName,categoryId }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const responsive = {
        desktop: {
          breakpoint: { max: 3000, min: 1024 },
          items: 4,
          partialVisibilityGutter: 40,
        },
        tablet: {
          breakpoint: { max: 1024, min: 564 },
          items: 3,
          partialVisibilityGutter: 30,
        },
        mobile: {
          breakpoint: { max: 564, min: 0 },
          items: 2,
          partialVisibilityGutter: 20,
        },
      };
      useEffect(() => {
        axios
          .get<{ products: Product[] }>(`http://localhost:8080/api/product/get-ProductbyCategory/${categoryId}`)
          .then((response) => {
            setProducts(response.data.products);
            setLoading(false)
          })
          .catch((error) => {
            window.location.reload();
          });
      }, [categoryId]);
  return (
    <>
      {loading ? (
        <Spinner />
      ) : (<>
        {products?.length > 0 && (
        <section className="bg-white py-8">
          <div className="container m-auto px-4">
              <h2 className="text-3xl font-semibold text-[#5f9231] mb-6 uppercase">{categoryName}</h2>
              <Carousel
              responsive={responsive}
              containerClass="carousel-container"
              additionalTransfrom={0}
              sliderClass=""
              itemClass="p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6"
            >
              {products?.map((item: any) => (
                  <Link href={`/details/${item._id}`} key={item._id}>
                    <div
                      key={item._id}
                      className="relative bg-gray-100 rounded-lg overflow-hidden shadow-md transform transition-transform duration-300 hover:shadow-2xl"
                    >
                      {item.offerPercentage > 0 && (
                        <div className="absolute top-2 right-2 bg-[#5f9231] text-white rounded-full p-1 text-sm font-semibold">
                          {item.offerPercentage}% OFF
                        </div>
                      )}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-auto object-cover sm:h-48 md:h-56 lg:h-64 xl:h-72 hover:scale-105"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 uppercase sm:text-xs md:text-sm lg:text-base xl:text-lg">
                          {item.name.substring(0, 10)}..
                        </h3>
                        <p className="text-gray-700 mb-2 sm:text-xs md:text-sm lg:text-base xl:text-lg">
                          {item.description.substring(0, 43)}...
                        </p>
                        <div className="flex items-center mb-2">
                          {item.offerPercentage > 0 ? (
                            <>
                              <span className="text-[#a14e3a] font-semibold sm:text-xs md:text-sm lg:text-base xl:text-lg mr-2">
                                <s>{Number(item.price).toFixed(1)}</s>
                              </span>
                              <span className="text-[#5f9231] font-semibold sm:text-xs md:text-sm lg:text-base xl:text-lg">
                                {(
                                  ((100 - item.offerPercentage) / 100) * item.price
                                ).toFixed(1)}{' '}
                                AED
                              </span>
                            </>
                          ) : (
                            <span className="text-[#a14e3a] font-semibold sm:text-xs md:text-sm lg:text-base xl:text-lg">
                              {Number(item.price).toFixed(2)} AED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </Carousel>
          </div>
        </section>
    )}</> )}
    </>
  )
}

export default CategoriesScroll