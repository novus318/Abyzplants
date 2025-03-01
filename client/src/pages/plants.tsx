import React, { useState, useEffect, Fragment, useRef } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Link from 'next/link';
import axios from 'axios';
import Spinner from '@/components/Spinner';
import { Menu, Transition } from '@headlessui/react';
import ContactIcon from '@/components/ContactIcon';
import Layout from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import CardSpinner from '@/components/CardSpinner';

interface Product {
  _id: string;
  name: string;
  photo: {
    image1: string;
    image2: string;
    image3: string;
  };
  description: string;
  category: {
    name: string;
    _id: number;
  };
  quantity: any;
  sizes: {
    name: string;
    price: number;
    pots: {
      potName: string;
      potPrice: number;
    }[];
  }[];
  offerPercentage: number;
}

type Category = {
  name: string;
  _id?: number;
};

const Plants: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [sortOrder, setSortOrder] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingNextPage, setLoadingNextPage] = useState(false);
  const loader = useRef(null);

  useEffect(() => {
    // Fetch total product count
    axios
      .get<{ totalCount: number }>(`${apiUrl}/api/product/get-plantsCount`)
      .then((response) => {
        setTotalCount(response.data.totalCount);
      })
      .catch((error) => {
        console.error('Error fetching product count:', error);
      });

    // Fetch initial products
    axios
      .get<{ products: Product[] }>(`${apiUrl}/api/product/get-plants`)
      .then((response) => {
        setProducts(response.data.products);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        window.location.reload();
      });

    // Fetch categories
    axios
      .get<{ category: Category[] }>(`${apiUrl}/api/category/get-PlantsCategory`)
      .then((response) => {
        setCategories(response.data.category);
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
      });
  }, [apiUrl]);

  // Fetch next page of products
  const fetchNextPage = async () => {
    if (loadingNextPage || products.length >= totalCount) return;

    setLoadingNextPage(true);
    try {
      const nextPage = currentPage + 1;
      const response = await axios.get(`${apiUrl}/api/product/get-plants?page=${nextPage}`);
      const newProducts = response.data.products;

      if (newProducts.length > 0) {
        setProducts((prevProducts) => [...prevProducts, ...newProducts]);
        setCurrentPage(nextPage);
      }
    } catch (error) {
      console.error('Error fetching next page of products:', error);
    }
    setLoadingNextPage(false);
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loadingNextPage && products.length < totalCount) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => {
      if (loader.current) {
        observer.unobserve(loader.current);
      }
    };
  }, [loader, loadingNextPage, products, totalCount]);

  // Sort products
  useEffect(() => {
    if (sortOrder) {
      const sorted = products.slice().sort((a, b) => {
        if (sortOrder === 'lowToHigh') {
          return a.sizes[0].price - b.sizes[0].price;
        } else {
          return b.sizes[0].price - a.sizes[0].price;
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

  // Save scroll position before navigating to product details
  const handleProductClick = (productId: string) => {
    localStorage.setItem('scrollPosition', window.scrollY.toString());
    window.location.href = `/details/${productId}`;
  };

  // Restore scroll position on component mount
  useEffect(() => {
    const savedScrollPosition = localStorage.getItem('scrollPosition');
    if (savedScrollPosition) {
      window.scrollTo(0, parseInt(savedScrollPosition));
      localStorage.removeItem('scrollPosition');
    }
  }, []);

  return (
    <Layout
      title="Abyzplants - All Plants"
      description="Abyz Plants, the definitive online destination for exceptional indoor and outdoor plants in the UAE, with quick delivery options. Our online plant store guarantees the quality of every plant, making it effortless to purchase for your home, office. With the widest variety of options available, and a delightful selection of home accessories. Whether it is for offices, malls, hotels, or any setting, count on us for the freshest, healthiest plants. Explore our (Gift a Plant) option and revel in our swift and reliable delivery service."
      keywords="Abyzplants, Abyzplants UAE, abyzplants uae, Abyzplants dubai, abyzplants dubai, abyzplants, Buy indoor plants online, Buy outdoor plants online, where to buy indoor plants, where to buy outdoor plants, buy indoor plants in Dubai, buy indoor plants in Abu Dhabi, plant stores near me, what are the best indoor plants to buy, indoor plants for my home, flowering indoor plants for home, flowering indoor plants for my office, where can I buy indoor plants for my home, nearest online plant store in Dubai, indoor plant stores near me, online indoor plants, which are the best indoor plants to buy in winter, which are the best indoor plants to buy in summer, outdoor plants in Dubai, where to buy outdoor plants in Dubai, where to buy outdoor plants online, buy outdoor plants online, buy seeds online, buy soil & fertilizers online, buy indoor fertilizers online, buy potting soil online, buy soil for my home, buy plant insecticides, buy plant pesticides, where to buy plant food, where to buy indoor plant pots, where to buy plant pots, where to buy airplants, where to buy large indoor plants, how to water my plants, where to by plant care accessories, indoor plants online, outdoor plants online, flowering plants online, plants gifts online, plant pots online, buy plant pots in Dubai, buy tall indoor plants online, buy tall tree online, buy fertilizers online"
      author="Muhammed Nizamudheen M"
      canonicalUrl="https://abyzplants.com/plants"
    >
      <>
        {loading ? (
          <Spinner />
        ) : (
          <div>
            <Header />
            <ContactIcon />
            <div className="container mx-auto px-8 py-8">
              <h2 className="text-3xl font-semibold text-secondary-foreground mb-2 mt-16 text-center">
                Best Selling Plants
              </h2>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Sort by Price:</h3>
                <div className="flex items-center space-x-4">
                  <button
                    className={`${sortOrder === 'lowToHigh'
                      ? 'bg-secondary-foreground text-white'
                      : 'border border-gray-300'
                      } rounded-md p-1`}
                    onClick={() => handleSortOrderChange(sortOrder === 'lowToHigh' ? '' : 'lowToHigh')}
                  >
                    Low to High
                  </button>
                  <button
                    className={`${sortOrder === 'highToLow'
                      ? 'bg-secondary-foreground text-white'
                      : 'border border-gray-300'
                      } rounded-md p-1`}
                    onClick={() => handleSortOrderChange(sortOrder === 'highToLow' ? '' : 'highToLow')}
                  >
                    High to Low
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredProducts.length === 0 ? (
                  <div className="h-[550px] flex items-center justify-center">
                    <p>No plants available</p>
                  </div>
                ) : (
                  filteredProducts.map((item) => (
                    <div onClick={() => handleProductClick(item._id)} key={item._id}>
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
                    </div>
                  ))
                )}
              </div>

              {/* Infinite Scroll Loader */}
              {filteredProducts.length !== totalCount && (
                <div ref={loader} className="text-center mt-4">
                  {loadingNextPage && <CardSpinner />}
                </div>
              )}
            </div>
            <Footer />
          </div>
        )}
      </>
    </Layout>
  );
};

export default Plants;