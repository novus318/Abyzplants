import React, { useState, useEffect, Fragment } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Link from 'next/link';
import axios from 'axios';
import Spinner from '@/components/Spinner';
import { Menu, Transition } from '@headlessui/react';
import ContactIcon from '@/components/ContactIcon';
import Layout from '@/components/Layout';


interface Product {
  _id: string;
  name: string;
  image: string;
  description: string;
  category: {
    name:string;
    _id:number;
  }
  price: number;
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
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/category/get-category`);
        setCategories(response.data.category);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        window.location.reload()
      }
    };

    fetchCategories();
  }, []);

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
    <Layout title='Abyzplants - All Plants'
    description=
      'Abyz Plants, the definitive online destination for exceptional indoor and outdoor plants in the UAE, with quick delivery options. Our online plant store guarantees the quality of every plant, making it effortless to purchase for your home, office. With the widest variety of options available,and a delightful selection of home accessories. Whether it is for offices, malls, hotels, or any setting, count on us for the freshest, healthiest plants. Explore our (Gift a Plant) option and revel in our swift and reliable delivery service.'
    keywords=
      'Abyzplants,Abyzplants UAE,abyzplants uae,Abyzplants dubai,abyzplants dubai,abyzplants,Buy indoor plants online,Buy outdoor plants online,where to buy indoor plants,where to buy outdoor plants,buy indoor plants in Dubai,buy indoor plants in Abu Dhabi,plant stores near me, what are the best indoor plants to buy,indoor plants for my home, flowering indoor plants for home,flowering indoor plants for my office,where can I buy indoor plants for my home,nearest online plant store in Dubai,indoor plant stores near me,online indoor plants,which are the best indoor plants to buy in winter,which are the best indoor plants to buy in summer,outdoor plants in Dubai,where to buy outdoor plants in Dubai,where to buy outdoor plants online,buy outdoor plants online,buy seeds online,buy soil & fertilizers online,buy indoor fertilizers online,buy potting soil online,buy soil for my home,buy plant insecticides,buy plant pesticides,where to buy plant food,where to buy indoor plant pots,where to buy plant pots, where to buy airplants,where to buy large indoor plants, how to water my plants,where to by plant care accessories,indoor plants online,outdoor plants online,flowering plants online,plants gifts online,plant pots online,buy plant pots in Dubai,buy tall indoor plants online,buy tall tree online,buy fertilizers online'
    author= 'Muhammed Nizamudheen M'
    canonicalUrl= 'https://abyzplants.com/plants' >
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div>
          <Header />
          <ContactIcon/>
          <div className="container mx-auto px-8 py-8">
            <h2 className="text-3xl font-semibold text-[#5f9231] mb-2 mt-16 text-center">Best Selling Plants</h2>
            <Menu as="div" className="px-5">
                  <div>
                    <Menu.Button className='absolute right-0 rounded-md p-2 border border-gray-300 mt-9 mr-2' >
                     categories
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-20 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {categories?.map((category) => (
                      <Menu.Item key={category._id}>
                          <a
                            href={`/category/${category._id}`}
                            className='block px-4 py-2 text-sm text-gray-700 hover:text-[#79bd3f]'
                          >
                            {category.name}
                          </a>
                        
                      </Menu.Item>
                    ))}
                    </Menu.Items>
                  </Transition>
                </Menu>
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
                      src={item.image}
                      alt={item.name}
                      className="w-full h-auto object-cover sm:h-48 md:h-56 lg:h-64 xl:h-72 hover:scale-105"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 uppercase sm:text-xs md:text-sm lg:text-base xl:text-lg">
                        {item.name.substring(0, 10)}..
                      </h3>
                      <p className="text-gray-700 mb-2 sm:text-xs md:text-sm lg:text-base xl:text-lg">
                        {item.description.substring(0, 25)}...
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
                ))
              )}
            </div>
          </div>
          <Footer />
        </div>
      )}
    </>
    </Layout>
  );
};

export default Plants;
