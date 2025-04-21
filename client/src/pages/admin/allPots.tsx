import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Spinner from '@/components/Spinner';
import AdminSidebar from '@/components/AdminSidebar';
import { withAuth } from '@/components/withAuth';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

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
    .get<{ totalCount: number }>(`${apiUrl}/api/pot/get-potCount`)
    .then((response) => {
      setTotalCount(response.data.totalCount);
    })
    .catch((error) => {
    });
    axios.get<{ products: Product[] }>(`${apiUrl}/api/pot/get-pot`)
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
      const response = await axios.get(`${apiUrl}/api/pot/get-pot?page=${nextPage}`);
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
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50/50">
          <AdminSidebar />
          <ScrollArea className="flex-1 h-screen">
            <main className="p-6 md:ml-64">
              <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-semibold text-gray-900">All Pots</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your pot catalog</p>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Pot Management</CardTitle>
                    <CardDescription>View and manage all your pots</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Input
                        type="text"
                        placeholder="Search by pot code"
                        value={searchText}
                        onChange={handleSearchInputChange}
                        className="max-w-sm"
                      />
                      <p className="text-sm text-gray-500">Total Pots: {totalCount}</p>
                    </div>

                    {searchResults.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No matching pots found</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {searchResults.map((item) => (
                          <Link href={`/admin/editPot/${item._id}`} key={item._id}>
                            <Card className="overflow-hidden transition-all hover:shadow-lg">
                              <div className="relative">
                                {item.offerPercentage > 0 && (
                                  <Badge className="absolute top-2 right-2 bg-primary">
                                    {item.offerPercentage}% OFF
                                  </Badge>
                                )}
                                <img
                                  src={item.images?.image1}
                                  alt={item.name}
                                  className="w-full object-cover h-48 md:h-56 lg:h-64 xl:h-72 hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <CardContent className="p-4">
                                <h3 className="font-semibold mb-2 uppercase text-xs md:text-sm lg:text-base xl:text-lg truncate">
                                  {item.name}
                                </h3>
                                <p className="text-gray-700 mb-2 text-xs md:text-sm lg:text-base xl:text-lg line-clamp-2">
                                  {item.description}
                                </p>
                                <div className="flex items-center mb-2">
                                  {item.offerPercentage > 0 ? (
                                    <>
                                      <span className="text-red-500 font-semibold text-sm md:text-sm lg:text-base xl:text-lg mr-2">
                                        <s>{Number(item.sizes[0]?.price).toFixed(1)}</s>
                                      </span>
                                      <span className="text-primary font-semibold text-sm md:text-sm lg:text-base xl:text-lg">
                                        {(
                                          ((100 - item.offerPercentage) / 100) * Number(item.sizes[0]?.price)
                                        ).toFixed(1)}{' '}
                                        AED
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-red-500 font-semibold text-sm md:text-sm lg:text-base xl:text-lg">
                                      {Number(item.sizes[0]?.price).toFixed(2)} AED
                                    </span>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchResults.length !== totalCount && (
                      <div className="flex justify-center mt-4">
                        <Button onClick={fetchNextPage}>
                          Load More
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </main>
          </ScrollArea>
        </div>
      )}
    </>
  )
}

export default withAuth(AllProducts);