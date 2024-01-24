import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Spinner from '@/components/Spinner';
import AdminSidebar from '@/components/AdminSidebar';
import { withAuth } from '@/components/withAuth';

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
  photo:{
    image1:string;
    image2:string;
    image3:string;
  }
  offerPercentage: number;
  code: string;
  image:string;
}
const AllProducts = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  useEffect(() => {
    axios
    .get<{ totalCount: number }>(`${apiUrl}/api/product/get-productCount`)
    .then((response) => {
      setTotalCount(response.data.totalCount);
    })
    .catch((error) => {
    });
    axios.get<{ products: Product[] }>(`${apiUrl}/api/product/get-product`)
      .then((response) => {
        setProducts(response.data.products);
        setSearchResults(response.data.products);
        setLoading(false)
      })
      .catch((error) => {
        window.location.reload()
      });
  }, [apiUrl]);
  const fetchNextPage = async () => {
    try {
      const nextPage = currentPage + 1;
      const response = await axios.get(`${apiUrl}/api/product/get-product?page=${nextPage}`);
      const newProducts = response.data.products;

      if (newProducts.length > 0) {
        setProducts((prevProducts) => [...prevProducts, ...newProducts]);
        setSearchResults((prevProducts) => [...prevProducts, ...newProducts]);
        setCurrentPage(nextPage);
      }
    } catch (error) {
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchText(text);
  
    if (text.trim() === '') {
      setSearchResults(products);
    } else {
      const results = products.filter((product) =>
        product.code && product.code.toLowerCase().includes(text.toLowerCase())
      );
      setSearchResults(results);
    }
  };
  
  
  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-4 ml-64">
            <div className="container mx-auto px-8 py-8">
              <h2 className="text-3xl font-semibold text-[#5f9231] mb-6">All Products</h2>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by product code"
                  value={searchText}
                  onChange={handleSearchInputChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
              <p className="mb-4 text-gray-600">Total Plants: {totalCount}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {searchResults.length === 0 ? (
                  <p>No matching products found</p>
                ) : (
                  searchResults.map((item) => (
              <Link href={`/admin/editProduct/${item._id}`} key={item._id}>
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
                            {item.sizes[0]?.pots[0] ? (<span className="text-[#a14e3a] font-semibold text-sm md:text-sm lg:text-base xl:text-lg">
                            {(Number(item.sizes[0].price) + Number(item.sizes[0].pots[0].potPrice)).toFixed(1)} AED
                            </span>):(<span className="text-[#a14e3a] font-semibold text-sm md:text-sm lg:text-base xl:text-lg">
                              {Number(item.sizes[0]?.price).toFixed(2)} AED
                            </span>)}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
              </Link>
            ))
          )}
        </div>
        {searchResults.length !== totalCount && (
                <div className="text-center mt-4">
                  <button
                    className="bg-[#5f9231] text-white py-2 px-4 rounded-md"
                    onClick={fetchNextPage}
                  >
                    Load More
                  </button>
                </div>
              )}
      </div>
      </main>
      </div>)}
    </>
  )
}

export default withAuth(AllProducts);