import React, { useEffect, useState } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import axios from 'axios';
import Link from 'next/link';
import { FaArrowRight, FaMinus, FaPlus, FaShare } from 'react-icons/fa';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { useRouter } from 'next/router';
import Spinner from '@/components/Spinner';
import { useCart } from '@/store/cartContext';
import toast from 'react-hot-toast';
import ContactIcon from '@/components/ContactIcon';
import { Select } from 'antd';

const { Option } = Select;
interface Product {
  _id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  offerPercentage: number;
  category: {
    _id: string;
    name: string;
  };
  sizes: string[];
  plantCare: String[];
}

interface Image {
  url: string;
}
interface CartItem {
  _id: string;
  code: string;
  name: string;
  price: any;
  size: string;
  quantity: number;
}

const Details: React.FC = () => {
  const locations = [
    { name: 'Dubai', days: '2-3 working days' },
    { name: 'Abu Dhabi', days: '2-4 working days' },
    { name: 'Sharjah', days: '2-3 working days' },
    { name: 'Ras Al Khaimah', days: '3-5 working days' },
    { name: 'Fujairah', days: '5-7 working days' },
    { name: 'Al Ain', days: '5-7 working days' },
    { name: 'Umm Al Quwain', days: '3-5 working days' },
    { name: 'Ajman', days: '2-3 working days' },
  ];
  const router = useRouter();
  const { pid } = router.query;
  const { addToCart } = useCart();
  const [selectedSizeError, setSelectedSizeError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [SimilarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [currentURL, setCurrentURL] = useState('');

  useEffect(() => {
    setCurrentURL(window.location.href);
  }, [router.asPath]);
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

  const handleLocationChange = (locationName: string) => {
    const selectedLocation = locations.find((location) => location.name === locationName);
    if (selectedLocation) {
      setSelectedLocation(selectedLocation);
    }
  };

  const handleBuyNow = () => {
    try {
      if (selectedSizes.length === 0) {
        setSelectedSizeError('Please select a size');
      }
      else {
        const userFromLocalStorage = localStorage.getItem('user');

        if (!userFromLocalStorage) {
          const currentRoute = router.asPath;
          router.push(`/login?redirect=${encodeURIComponent(currentRoute)}`);
          return;
        }
        else if (product) {
          const price = product.offerPercentage
            ? (((100 - product.offerPercentage) / 100) * product.price).toFixed(2)
            : Number(product.price).toFixed(2);

          const item: CartItem = {
            _id: product._id,
            code: product.code,
            name: product.name,
            size: selectedSizes[0],
            price: price,
            quantity: quantity,
          };
          addToCart(item);
          router.push('/cart')
          setSelectedSizeError(null)
        }
      }
    } catch (error) {

    }
  }
  const handleAddToCart = () => {
    try {
      if (selectedSizes.length === 0) {
        setSelectedSizeError('Please select a size');
      }
      else {
        const userFromLocalStorage = localStorage.getItem('user');

        if (!userFromLocalStorage) {
          const currentRoute = router.asPath;
          router.push(`/login?redirect=${encodeURIComponent(currentRoute)}`);
          return;
        }
        else if (product) {
          const price = product.offerPercentage
            ? (((100 - product.offerPercentage) / 100) * product.price).toFixed(2)
            : Number(product.price).toFixed(2);

          const item: CartItem = {
            _id: product._id,
            code: product.code,
            name: product.name,
            size: selectedSizes[0],
            price: price,
            quantity: quantity,
          };
          addToCart(item);
          toast.success('Item added to cart')
          setSelectedSizeError(null)
        }
      }
    } catch (error) {

    }
  };


  const handleIncrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleDecrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleSizeSelection = (size: string) => {
    // If the selected size is already in the array, deselect it
    if (selectedSizes.includes(size)) {
      setSelectedSizes([]);
    } else {
      // Select the new size and clear any previously selected sizes
      setSelectedSizes([size]);
    }
  };

  const handleThumbnailClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };


  const getSimilarProduct = async (pid: string, cid: string) => {
    try {
      const { data } = await axios.get(
        `http://localhost:8080/product/related-product/${pid}/${cid}`
      );
      setSimilarProducts(data.products);
    } catch (error) {

    }
  };

  const getSingleProduct = async () => {
    try {
      const { data } = await axios.get<Product>(`http://localhost:8080/product/get-product/${pid}`);
      setProduct(data);
      getSimilarProduct(data?._id, data?.category._id);
      if (data._id) {
        setSelectedImage(`http://localhost:8080/product/product-photo1/${data._id}`);
      }
      setLoading(false);
    } catch (error) {
      window.location.reload();
    }
  };
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Share this product',
          url: currentURL,
        });
      } catch (error: any) {
        if (error.name === 'AbortError') {
        }
      }
    }
  };


  useEffect(() => {
    if (pid) getSingleProduct();
  }, [pid]);

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <Header />
          <ContactIcon />
          <div className="bg-white p-10">
            <div className="max-w-screen-xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:pt-24">
                <div className="pt-14 md:pt-2">
                  <div className="w-[18rem] md:w-[25rem] h-auto shadow-lg rounded-lg m-auto overflow-hidden transition-transform transform hover:scale-105 duration-300">
                    {selectedImage && <img src={selectedImage} alt="Product Image" className="w-full h-full object-cover" />}
                  </div>
                  <div className="mt-6 flex justify-center gap-4">
                    {product && [...Array(3)].map((_, index) => (
                      <img
                        key={index}
                        src={`http://localhost:8080/product/product-photo${index + 1}/${product._id}`}
                        alt={`Thumbnail Image ${index}`}
                        className="w-24 h-28 object-cover rounded-lg hover:opacity-70 transition-opacity duration-300 cursor-pointer shadow-md"
                        onClick={() => handleThumbnailClick(`http://localhost:8080/product/product-photo${index + 1}/${product._id}`)}
                      />
                    ))}
                  </div>
                </div>
                <div className="md:order-1 md:pt-4">
                  {product && (
                    <>
                      <h4 className="text-4xl font-semibold mb-2 text-[#5f9231]">{product.name}</h4>
                      <p className="text-gray-600 text-lg">{product.category.name}</p>
                      <p className="text-xl mt-4">
                        {product.offerPercentage ? (
                          <>
                            <span className="text-[#a14e3a] font-semibold">
                              {(((100 - product.offerPercentage) / 100) * product.price).toFixed(2)} AED
                            </span>
                            <span className="text-gray-500 ml-2 line-through">
                              {Number(product.price).toFixed(2)} AED
                            </span>
                            <span className="text-[#5f9231] ml-2">
                              {product.offerPercentage}% OFF
                            </span>
                          </>
                        ) : (
                          <span className="text-[#a14e3a] font-semibold">
                            {Number(product.price).toFixed(2)} AED
                          </span>
                        )}
                      </p>

                      <div className="mt-4">
                        <p className="text-xl">Size</p>
                        {selectedSizeError && (
                          <p className="text-red-500">{selectedSizeError}</p>
                        )}
                        <div className="flex flex-wrap">
                          {product.sizes.map((size, index) => (
                            <button
                              key={index}
                              className={`${selectedSizes.includes(size)
                                ? 'bg-[#5f9231] text-white'
                                : 'bg-gray-200 text-[#5f9231]'
                                } py-2 px-4 rounded-md m-2 hover:ring-[#8d4533] hover:ring-2 transition-colors duration-300`}
                              onClick={() => handleSizeSelection(size)}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-xl">Quantity</p>
                        <div className="flex items-center space-x-4 py-3">
                          <span onClick={handleDecrementQuantity} className="cursor-pointer ring-[#a14f3a27] ring-1 rounded-sm p-1">
                            <FaMinus className="text-[#5f9231] text-2xl" />
                          </span>
                          <span className="text-2xl">{quantity}</span>
                          <span onClick={handleIncrementQuantity} className="cursor-pointer ring-[#a14f3a27] ring-1 rounded-sm p-1">
                            <FaPlus className="text-[#5f9231] text-2xl" />
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex space-x-4">
                        <button
                          type="button"
                          className="bg-[#5f9231] text-white py-2 px-4 rounded-md hover:bg-[#8d4533] transition-colors duration-300"
                          onClick={handleAddToCart}
                        >
                          Add to Cart
                        </button>
                        <button
                          type="button"
                          className="bg-[#a14e3a] text-white py-2 px-4 rounded-md hover-bg-[#8d4533] transition-colors duration-300"
                          onClick={handleBuyNow}
                        >
                          Buy now
                        </button>
                        <button
                          type="button"
                          className="bg-[#333] text-white py-2 px-4 rounded-md hover:bg-[#444] transition-colors duration-300"
                          onClick={handleShare}
                        >
                          <FaShare /> Share
                        </button>
                      </div>
                      <div className="my-3">
                        <label className="text-lg font-semibold">Select Delivery Location:</label>
                        <Select
                          value={selectedLocation.name}
                          onChange={(value) => handleLocationChange(value)}
                          className="block w-full mt-2"
                          style={{ width: '100%' }}
                        >
                          {locations.map((location) => (
                            <Option key={location.name} value={location.name}>
                              {location.name}
                            </Option>
                          ))}
                        </Select>
                      </div>

                      <p className="text-lg">
                        <strong>{selectedLocation.name}:</strong> {selectedLocation.days}
                      </p>
                      {product.plantCare.length > 0 && (<div className="bg-[#f5f5f5] p-6 rounded-lg shadow-md my-6">
                        <h2 className="text-2xl font-semibold mb-4">Plant Care</h2>
                        <ul className="grid grid-cols-1 gap-4">
                          {product.plantCare.map((point, index) => (
                            <li key={index} className="flex items-center">
                              <span className="text-[#5f9231] mr-2"><FaArrowRight /></span>
                              <p className="text-gray-700">{point}</p>
                            </li>
                          ))}
                        </ul>
                      </div>)}
                      <div className="mt-8">
                        <span className="text-xl text-[#5f9231] font-semibold">Details:</span>
                        <p className="text-gray-600 mt-2 text-lg">
                          {product.description}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          {SimilarProducts.length > 0 &&
            <section className="bg-white py-8">
              <div className="container m-auto px-4">
                <h2 className="text-3xl font-semibold text-[#5f9231] mb-6">Similar Products</h2>
                <Carousel
                  responsive={responsive}
                  containerClass="carousel-container"
                  additionalTransfrom={0}
                  sliderClass=""
                  itemClass='p-1 sm:p-1 md:p-3 lg:p-4 xl:p-5'
                >
                  {SimilarProducts?.map((item) => (
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
                          src={`http://localhost:8080/product/product-photo1/${item._id}`}
                          alt={item.name}
                          className="w-full hover:scale-105 h-auto object-cover sm:h-48 md:h-56 lg:h-64 xl:h-72"
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
          }
          <Footer />
        </>)}
    </>
  );
};

export default Details
