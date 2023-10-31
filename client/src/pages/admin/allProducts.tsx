import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Spinner from '@/components/Spinner';
import AdminSidebar from '@/components/AdminSidebar';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  offerPercentage: number;
  code: string;
  image:string;
}
const allProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  useEffect(() => {
    axios.get<{ products: Product[] }>('http://localhost:8080/product/get-product')
      .then((response) => {
        setProducts(response.data.products);
        setSearchResults(response.data.products);
        setLoading(false)
      })
      .catch((error) => {
        window.location.reload()
      });
  }, []);

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

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-14">
                {searchResults.length === 0 ? (
                  <p>No matching products found</p>
                ) : (
                  searchResults.map((item) => (
              <Link href={`/admin/editProduct/${item._id}`} key={item._id}>
                <div
                  key={item._id}
                  className="relative bg-gray-100 rounded-lg overflow-hidden shadow-md transform transition-transform hover:scale-105 duration-300 hover:shadow-2xl"
                >
                  {item.offerPercentage > 0 && (
                    <div className="absolute top-2 right-2 bg-[#5f9231] text-white rounded-full p-1 text-sm font-semibold">
                      {item.offerPercentage}% OFF
                    </div>
                  )}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-72 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                    <p className="text-gray-700 mb-2">{item.description.substring(0, 45)}...</p>
                    <div className="flex items-center mb-2">
                      {item.offerPercentage > 0 ? (
                        <>
                          <span className="text-[#a14e3a] font-semibold text-lg mr-2">
                            <s>{Number(item.price).toFixed(2)} AED</s>
                          </span>
                          <span className="text-[#5f9231] font-semibold text-lg">
                            {(((100 - item.offerPercentage) / 100) * item.price).toFixed(2)} AED
                          </span>
                        </>
                      ) : (
                        <span className="text-[#a14e3a] font-semibold text-lg">
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
      </main>
      </div>)}
    </>
  )
}

export default allProducts