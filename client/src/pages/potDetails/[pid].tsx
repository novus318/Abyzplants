import React, { useEffect, useState } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import axios from 'axios';
import Link from 'next/link';
import { FaArrowRight, FaExclamationCircle, FaMinus, FaPlus, FaShare } from 'react-icons/fa';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { useRouter } from 'next/router';
import Spinner from '@/components/Spinner';
import { useCart } from '@/store/cartContext';
import toast from 'react-hot-toast';
import ContactIcon from '@/components/ContactIcon';
import { Select } from 'antd';

const { Option } = Select;
interface ProductSize {
  name: string;
  price: number;
}
interface Product {
  _id: string;
  code: string;
  name: string;
  sizeOption: string;
  images: {
    [key: string]: string;
    image1: string;
    image2: string;
    image3: string;
    image4: string;
    image5: string;
    image6: string;
    image7: string;
    imageName1: string;
    imageName2: string;
    imageName3: string;
    imageName4: string;
    imageName5: string;
    imageName6: string;
    imageName7: string;
  }
  description: string;
  quantity: number;
  offerPercentage: number;
  category: {
    _id: string;
    name: string;
  };
  sizes: ProductSize[];
  specifications: String[];
  colors: {
    name: string;
  }[];
}

interface CartItem {
  _id: string;
  code: string;
  name: string;
  image: string;
  sizes: ProductSize[]
  quantity: number;
  offerPercentage: number;
  color: string;
}

const Similar: React.FC = () => {
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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { addToCart } = useCart();
  const [selectedSizeError, setSelectedSizeError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [SimilarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<Product['sizes']>([]);


  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [currentURL, setCurrentURL] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  const handleColorSelection = (color: string) => {
    for (let index = 1; index <= 7; index++) {
      const imageNameKey = `imageName${index}`;
      const imageKey = `image${index}`;

      // Check if the selected color matches the imageName
      if (product?.images[imageNameKey] === color) {
        // If a match is found, set the selected image
        setSelectedImage(product?.images[imageKey]);
        break; // Exit the loop since we found a match
      }
    }
    setSelectedColor(color);
  };

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

          const item: CartItem = {
            _id: product._id,
            code: product.code,
            name: product.name,
            sizes: selectedSizes,
            offerPercentage: product.offerPercentage,
            quantity: quantity,
            image: selectedImage,
            color:selectedColor,
          };
          addToCart(item as any);
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

          const item: CartItem = {
            _id: product._id,
            code: product.code,
            name: product.name,
            offerPercentage: product.offerPercentage,
            sizes: selectedSizes,
            quantity: quantity,
            image: selectedImage,
            color:selectedColor,
          };
          addToCart(item as any);
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

  const handleSizeSelection = (size: ProductSize) => {
    const selectedSize = product?.sizes.find((s: any) => s.name === size.name);
    if (selectedSize) {
      setSelectedSizes(selectedSize as any);
    }
  };

  const handleThumbnailClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };


  const getSingleProduct = async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/api/pot/get-pot/${pid}`);
      setProduct(data.product);
      setSelectedSizes(data.product.sizes[0])
      if (data.product.images) {
        setSelectedImage(data.product.images.image1);
      }
      const matchingColor = data.product.colors.find(
        (color: any) => color.name === data.product.images.imageName1
      );

      if (matchingColor) {
        console.log(matchingColor.name)
        setSelectedColor(matchingColor.name)
      }
      setLoading(false);
    } catch (error) {

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
                    {product && (
                      <>
                        {product?.images?.image1 && (<img
                          src={product.images?.image1}
                          alt='ThumbnailImage1'
                          className="w-24 h-28 object-cover rounded-lg hover:opacity-70 transition-opacity duration-300 cursor-pointer shadow-md"
                          onClick={() => handleThumbnailClick(product.images?.image1)}
                        />)}
                        {product?.images?.image2 && (<img
                          src={product.images?.image2}
                          alt='ThumbnailImage2'
                          className="w-24 h-28 object-cover rounded-lg hover:opacity-70 transition-opacity duration-300 cursor-pointer shadow-md"
                          onClick={() => handleThumbnailClick(product.images?.image2)}
                        />)}
                        {product?.images?.image3 && (<img
                          src={product.images?.image3}
                          alt='ThumbnailImage3'
                          className="w-24 h-28 object-cover rounded-lg hover:opacity-70 transition-opacity duration-300 cursor-pointer shadow-md"
                          onClick={() => handleThumbnailClick(product.images?.image3)}
                        />)}
                        {product?.images?.image4 && (<img
                          src={product.images?.image4}
                          alt='ThumbnailImage4'
                          className="w-24 h-28 object-cover rounded-lg hover:opacity-70 transition-opacity duration-300 cursor-pointer shadow-md"
                          onClick={() => handleThumbnailClick(product.images?.image4)}
                        />)}
                        {product?.images?.image5 && (<img
                          src={product.images?.image5}
                          alt='ThumbnailImage5'
                          className="w-24 h-28 object-cover rounded-lg hover:opacity-70 transition-opacity duration-300 cursor-pointer shadow-md"
                          onClick={() => handleThumbnailClick(product.images?.image5)}
                        />)}
                        {product?.images?.image6 && (<img
                          src={product.images?.image6}
                          alt='ThumbnailImage6'
                          className="w-24 h-28 object-cover rounded-lg hover:opacity-70 transition-opacity duration-300 cursor-pointer shadow-md"
                          onClick={() => handleThumbnailClick(product.images?.image6)}
                        />)}
                        {product?.images?.image7 && (<img
                          src={product.images?.image7}
                          alt='ThumbnailImage7'
                          className="w-24 h-28 object-cover rounded-lg hover:opacity-70 transition-opacity duration-300 cursor-pointer shadow-md"
                          onClick={() => handleThumbnailClick(product.images?.image7)}
                        />)}
                      </>
                    )}
                  </div>
                </div>
                <div className="md:order-1 md:pt-4">
                  {product && (
                    <>
                      <h4 className="text-4xl font-semibold mb-2 text-[#5f9231]">{product.name}</h4>
                      <p className="text-gray-600 text-lg">{product?.category?.name}</p>
                      <p className="text-xl mt-4">
                        {product.offerPercentage ? (
                          <>
                            <span className="text-[#a14e3a] font-semibold">
                              {(((100 - product.offerPercentage) / 100) * (selectedSizes as any)?.price).toFixed(2)}
                              AED
                            </span>

                            <span className="text-gray-500 ml-2 line-through">
                              {Number((selectedSizes as any)?.price).toFixed(2)}
                              AED
                            </span>
                            <span className="text-[#5f9231] ml-2">
                              {product.offerPercentage}% OFF
                            </span>
                          </>
                        ) : (
                          <span className="text-[#a14e3a] font-semibold">

                            {Number((selectedSizes as any)?.price).toFixed(2)}
                            AED
                          </span>
                        )}

                      </p>

                      <div className="mt-4">
                        <p className="text-sm text-gray-600">choose {product.sizeOption}</p>
                        {selectedSizeError && (
                          <p className="text-red-500">{selectedSizeError}</p>
                        )}
                        <div className="flex flex-wrap">
                          {product?.sizes.map((size: any, index: any) => (
                            <button
                              key={index}
                              className={`${(selectedSizes as any)?.name === size.name
                                ? 'bg-[#5f9231] text-white'
                                : 'bg-gray-200 text-[#5f9231]'
                                } py-2 px-4 rounded-md m-2 hover:ring-[#8d4533] hover:ring-2 transition-colors duration-300`}
                              onClick={() => handleSizeSelection(size)}
                            >
                              {size.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap mt-4">
                        {product?.colors.map((color: any, index: any) => (
                          <button
                            key={index}
                            className={`${color.name === 'Steel' ? 'bg-steel' :
                              color.name === 'Steel' ? 'bg-[#4682b4]' :
                                color.name === 'Mix color' ? 'bg-[#bcbcbc]' :
                                  color.name === 'Green' ? 'bg-[#4caf50]' :
                                    color.name === 'Yellow' ? 'bg-[#ffeb3b]' :
                                      color.name === 'Blue' ? 'bg-[#2195f3f6]' :
                                        color.name === 'Orange' ? 'bg-[#ff9800]' :
                                          color.name === 'Purple' ? 'bg-[#9c27b0]' :
                                            color.name === 'Red' ? 'bg-[#f44336]' :
                                              color.name === 'Grey' ? 'bg-[#757575]' :
                                                color.name === 'Brown' ? 'bg-[#795548]' :
                                                  color.name === 'Maroon' ? 'bg-[#800000]' :
                                                    color.name === 'Olive' ? 'bg-[#808000]' :
                                                      color.name === 'Silver' ? 'bg-[#c0c0c0]' :
                                                        color.name === 'Pink' ? 'bg-[#e91e63]' :
                                                          color.name === 'Cyan' ? 'bg-[#00bcd4]' :
                                                            color.name === 'Rust' ? 'bg-[#b7410e]' :
                                                              color.name === 'Gold' ? 'bg-[#ffd700]' :
                                                                color.name === 'Charcoal' ? 'bg-[#36454f]' :
                                                                  color.name === 'Magenta' ? 'bg-[#ff00ff]' :
                                                                    color.name === 'Bronze' ? 'bg-[#cd7f32]' :
                                                                      color.name === 'Cream' ? 'bg-[#fffdd0]' :
                                                                        color.name === 'Violet' ? 'bg-[#8a2be2]' :
                                                                          color.name === 'Navy blue' ? 'bg-[#001f3f]' :
                                                                            color.name === 'Mustard' ? 'bg-[#ffdb58]' :
                                                                              color.name === 'Black' ? 'bg-[#000000]' :
                                                                                color.name === 'Teal' ? 'bg-[#008080]' :
                                                                                  color.name === 'Tan' ? 'bg-[#d2b48c]' :
                                                                                    color.name === 'Lavender' ? 'bg-[#e6e6fa]' :
                                                                                      color.name === 'Mauve' ? 'bg-[#e0b0ff]' :
                                                                                        color.name === 'Peach' ? 'bg-[#ffdab9]' :
                                                                                          color.name === 'Coral' ? 'bg-[#ff7f50]' :
                                                                                            color.name === 'Burgundy' ? 'bg-[#800020]' :
                                                                                              color.name === 'Indigo' ? 'bg-[#4b0082]' : ''
                              } p-4 rounded-full m-2 transition-colors duration-300 ${selectedColor === color.name ? 'ring-[#8d4533c8] ring-2' : ''}`}
                            onClick={() => handleColorSelection(color.name)}
                          />
                        ))}
                      </div>


                      <div className="mt-4">
                        <p className="text-sm text-gray-600">Quantity</p>
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

                      <div className="mt-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                        {product.quantity > 0 ? (
                          <>
                            <button
                              type="button"
                              className="bg-[#5f9231] text-white py-2 px-4 md:px-6 rounded-md hover:bg-[#8d4533] transition-colors duration-300"
                              onClick={handleAddToCart}
                            >
                              Add to Cart
                            </button>
                            <button
                              type="button"
                              className="bg-[#a14e3a] text-white py-2 px-4 md:px-6 rounded-md hover-bg-[#8d4533] transition-colors duration-300"
                              onClick={handleBuyNow}
                            >
                              Buy now
                            </button>
                          </>
                        ) : (
                          <div className="restocking-soon flex items-center text-red-500 text-lg font-medium">
                            Restocking Soon
                            <FaExclamationCircle className="icon text-red-500 ml-2" />
                          </div>
                        )}
                        <button
                          type="button"
                          className="bg-[#333] text-white py-2 px-4 md:px-6 rounded-md hover:bg-[#444] flex items-center space-x-2 transition-colors duration-300"
                          onClick={handleShare}
                        >
                          <FaShare className="text-lg mr-2" />
                          Share
                        </button>
                      </div>

                      <div className="my-3">
                        <label className="text-base font-semibold">Select Delivery Location:</label>
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
                      {product.specifications?.length > 0 && (
                        <div className="bg-[#f5f5f5] p-4 md:p-6 rounded-lg shadow-md my-2">
                          <h2 className="text-sm md:text-base lg:text-lg font-semibold mb-4">Specifications</h2>
                          <ul className="space-y-2">
                            {product?.specifications?.map((point, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-[#5f9231] mr-1 md:mr-2 my-auto">
                                  <FaArrowRight />
                                </span>
                                <p className="text-xs md:text-sm lg:text-base text-gray-700">{point}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="mt-4 md:mt-8">
                        <span className="text-sm md:text-base lg:text-lg text-[#5f9231] font-semibold">Details:</span>
                        <p className="text-sm md:text-base lg:text-lg text-gray-600 mt-2">
                          {product.description}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </>)}
    </>
  );
};

export default Similar;
