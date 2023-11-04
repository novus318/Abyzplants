import React, { useState, useEffect, Fragment } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Link from 'next/link';
import axios from 'axios';
import Spinner from '@/components/Spinner';
import { useRouter } from 'next/router';
import ContactIcon from '@/components/ContactIcon';

interface Product {
  _id: string;
  name: string;
  photo:{
    image1: string;
    image2: string;
    image3: string;
  }
  description: string;
  category: {
    name:string;
    _id:number;
  }
  price: number;
  offerPercentage: number;
}

const Search = () => {
  const router = useRouter();
  const { pid } = router.query;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [sortOrder, setSortOrder] = useState('');

  useEffect(() => {
   if(pid){
    axios
    .get<{ products: Product[]}>(`${apiUrl}/api/product/searchProducts/${pid}`)
    .then((response) => {
      setProducts(response.data.products);
      setLoading(false);
    })
    .catch((error) => {
     setLoading(false)
    });
   }
  }, [pid]);

  useEffect(() => {
    if (sortOrder) {
      const sorted = products.slice().sort((a, b) => {
        if (sortOrder === 'lowToHigh') {
          return a.price - b.price;
        } else {
          return b.price - a.price;
        }
      });

      setFilteredProducts(sorted);
    } else {
      setFilteredProducts(products);
    }
  }, [sortOrder, products]);

  const handleSortOrderChange = (order: string) => {
    setSortOrder(order);
  };
  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div>
          <Header />
          <ContactIcon/>
          <div className="container mx-auto px-8 py-8">
            <h2 className="text-3xl font-semibold text-[#5f9231] mb-2 mt-14 text-center uppercase">results: {products.length}</h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Sort by Price:</h3>
              <div className="flex items-center space-x-4">
                <button
                  className={`${sortOrder === 'lowToHigh'
                    ? 'bg-[#5f9231] text-white'
                    : 'border border-gray-300'
                    } rounded-md p-2`}
                  onClick={() => handleSortOrderChange(sortOrder === 'lowToHigh' ? '' : 'lowToHigh')}
                >
                  Low to High
                </button>
                <button
                  className={`${sortOrder === 'highToLow'
                    ? 'bg-[#5f9231] text-white'
                    : 'border border-gray-300'
                    } rounded-md p-2`}
                  onClick={() => handleSortOrderChange(sortOrder === 'highToLow' ? '' : 'highToLow')}
                >
                  High to Low
                </button>
              </div>
            </div>
            <p className="mb-4 text-gray-600">Total Plants: {filteredProducts.length}</p>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.length === 0 ? (
                <div className="h-[550px] flex items-center justify-center">
                  <p>No plants available</p>
                </div>
              ) : (
                filteredProducts.map((item) => (
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
                        src={item.photo.image1}
                        alt={item.name}
                        className="w-full object-cover h-48 md:h-56 lg:h-64 xl:h-72 hover:scale-105"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 uppercase text-xs md:text-sm lg:text-base xl:text-lg">
                          {item.name.substring(0, 13)}..
                        </h3>
                        <p className="text-gray-700 mb-2 text-xs md:text-sm lg:text-base xl:text-lg">
                          {item.description.substring(0, 43)}...
                        </p>
                        <div className="flex items-center mb-2">
                          {item.offerPercentage > 0 ? (
                            <>
                              <span className="text-[#a14e3a] font-semibold text-sm md:text-sm lg:text-base xl:text-lg mr-2">
                                <s>{Number(item.price).toFixed(1)}</s>
                              </span>
                              <span className="text-[#5f9231] font-semibold text-sm md:text-sm lg:text-base xl:text-lg">
                                {(
                                  ((100 - item.offerPercentage) / 100) * item.price
                                ).toFixed(1)}{' '}
                                AED
                              </span>
                            </>
                          ) : (
                            <span className="text-[#a14e3a] font-semibold text-sm md:text-sm lg:text-base xl:text-lg">
                              {Number(item.price).toFixed(2)} AED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
          <Footer />
        </div>
      )}
    </>
  );
};

export default Search;