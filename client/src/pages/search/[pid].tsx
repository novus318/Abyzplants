import React, { useState, useEffect, Fragment } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Link from 'next/link';
import axios from 'axios';
import Spinner from '@/components/Spinner';
import { useRouter } from 'next/router';
import ContactIcon from '@/components/ContactIcon';
import { Badge } from '@/components/ui/badge';

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
  quantity:any
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
  quantity:any;
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
    .get<{ products: Product[],pots:Pot[],totalCount:any}>(`${apiUrl}/api/product/searchProducts/${pid}`)
    .then((response) => {
      setProducts(response.data.products);
      setPots(response.data.pots)
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
            <h2 className="text-xl font-semibold text-secondary-foreground mb-2 mt-14 text-center uppercase">results: {totalCount}</h2>
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
                {filteredProducts?.map((item) => (
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
                            <Badge variant="destructive" className="absolute top-1 right-1">
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
                          <div className="absolute inset-0 bg-secondary bg-opacity-90 flex items-center justify-center">
                            <span className="text-destructive font-medium text-sm md:text-base">
                              Restocking Soon
                            </span>
                          </div>
                        )}
                      </div>
                  </Link>
                ))}
                {filteredPots?.map((item) => (
                   <Link href={`/potDetails/${item._id}`} key={item._id}>
                   <div
                             key={item._id}
                     className="group relative bg-gray-50 rounded-lg overflow-hidden shadow-md transform transition-transform duration-300 hover:shadow-xl h-full flex flex-col"
                   >
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
                         <div className="absolute top-2 right-2 bg-pritext-primary text-white rounded-full p-1 text-sm font-semibold">
                           {item.offerPercentage}% OFF
                         </div>
                       )}
                     </div>
                 
                     {/* Product Info */}
                     <div className="p-3 flex flex-col flex-grow">
                       <h3 className="font-semibold uppercase text-xs md:text-sm truncate">
                         {item.name}
                       </h3>
                       <p className="text-gray-700 text-xs md:text-sm truncate">
                         {item.description}
                       </p>
                       {/* Price Section */}
                       <div className="mt-auto">
                         {item.offerPercentage > 0 ? (
                               <>
                             <span className="text-secondary-foreground font-semibold text-sm md:text-sm lg:text-base xl:text-lg mr-2">
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
                           <span className="text-primary font-semibold text-sm md:text-sm lg:text-base xl:text-lg">
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