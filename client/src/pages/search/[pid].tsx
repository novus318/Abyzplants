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
interface Pot {
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

const Search = () => {
  const router = useRouter();
  const { pid } = router.query;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [products, setProducts] = useState<Product[]>([]);
  const [pots, setPots] = useState<Pot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredPots, setFilteredPots] = useState<Pot[]>([]);
  const [sortOrder, setSortOrder] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
   if(pid){
    axios
    .get<{ product: Product[],pot:Pot[],totalCount:any}>(`${apiUrl}/api/product/searchProducts/${pid}`)
    .then((response) => {
      setProducts(response.data.product);
      setPots(response.data.pot)
      setTotalCount(response.data.totalCount)
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
          return a.sizes[0].price - b.sizes[0].price;
        } else {
          return b.sizes[0].price - a.sizes[0].price;
        }
      });
      const sortedPots = pots.slice().sort((a, b) => {
        if (sortOrder === 'lowToHigh') {
          return a.sizes[0].price - b.sizes[0].price;
        } else {
          return b.sizes[0].price - a.sizes[0].price;
        }
      });

      setFilteredProducts(sorted);
      setFilteredPots(sortedPots);
    } else {
      setFilteredProducts(products);
      setFilteredPots(pots)
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
            <h2 className="text-3xl font-semibold text-[#5f9231] mb-2 mt-14 text-center uppercase">results: {totalCount}</h2>
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
            <p className="mb-4 text-gray-600">Total Plants: {totalCount}</p>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {totalCount === 0 ? (
                <div className="h-[550px] flex items-center justify-center">
                  <p>No plants available</p>
                </div>
              ) : (
                <>
                {filteredProducts.map((item) => (
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
                        src={item.photo?.image1}
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
                    </div>
                  </Link>
                ))}
                {filteredPots.map((item) => (
                    <Link href={`/potDetails/${item._id}`} key={item._id}>
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
                        src={item.images?.image1}
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
                                  <s>{Number(item.sizes[0]?.price).toFixed(1)}</s>
                              </span>
                              <span className="text-[#5f9231] font-semibold text-sm md:text-sm lg:text-base xl:text-lg">
                                {(
                                  ((100 - item.offerPercentage) / 100) * Number(item.sizes[0]?.price)
                                ).toFixed(1)}{' '}
                                AED
                              </span>
                            </>
                          ) : (
                           <span className="text-[#a14e3a] font-semibold text-sm md:text-sm lg:text-base xl:text-lg">
                              {Number(item.sizes[0].price).toFixed(2)} AED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    </Link>
                  ))}</>
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