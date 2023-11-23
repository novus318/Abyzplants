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
  pots:
  {
    potName: string;
    potPrice: number;
  }[]
}
interface Product {
  _id: string;
  code: string;
  name: string;
  photo: {
    image1: string;
    image2: string;
    image3: string;
  }
  description: string;
  quantity: number;
  offerPercentage: number;
  category: {
    _id: string;
    name: string;
  };
  sizes: ProductSize[];
  plantCare: String[];
}

interface CartItem {
  _id: string;
  code: string;
  name: string;
  image: string;
  sizes: ProductSize[]
  pots: ProductSize['pots']
  quantity: number;
  offerPercentage: number;
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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { addToCart } = useCart();
  const [selectedSizeError, setSelectedSizeError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [SimilarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<Product['sizes']>([]);
  const [selectedPots, setSelectedPots] = useState<ProductSize['pots']>([]);

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

          const item: CartItem = {
            _id: product._id,
            code: product.code,
            name: product.name,
            sizes: selectedSizes,
            pots: selectedPots,
            offerPercentage: product.offerPercentage,
            quantity: quantity,
            image: selectedImage,
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
            pots: selectedPots,
            quantity: quantity,
            image: selectedImage,
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
      setSelectedPots((selectedSize as any).pots[0]);
    }
  };

  const handleThumbnailClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };


  const getSimilarProduct = async (pid: string, cid: string) => {
    try {
      const { data } = await axios.get(
        `${apiUrl}/api/product/related-product/${pid}/${cid}`
      );
      setSimilarProducts(data.products);
    } catch (error) {

    }
  };

  const getSingleProduct = async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/api/product/get-product/${pid}`);
      setProduct(data.product);
      getSimilarProduct(data?.product._id, data?.product.category._id);
      setSelectedSizes(data.product.sizes[0])
      setSelectedPots(data?.product.sizes[0]?.pots[0])
      if (data.product.photo) {
        setSelectedImage(data.product.photo.image1);
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
                    {product && (
                      <>
                        <img
                          src={product.photo?.image1}
                          alt='ThumbnailImage1'
                          className="w-24 h-28 object-cover rounded-lg hover:opacity-70 transition-opacity duration-300 cursor-pointer shadow-md"
                          onClick={() => handleThumbnailClick(product.photo?.image1)}
                        />
                        <img
                          src={product.photo?.image2}
                          alt='ThumbnailImage2'
                          className="w-24 h-28 object-cover rounded-lg hover:opacity-70 transition-opacity duration-300 cursor-pointer shadow-md"
                          onClick={() => handleThumbnailClick(product.photo?.image2)}
                        />
                        <img
                          src={product.photo?.image3}
                          alt='ThumbnailImage3'
                          className="w-24 h-28 object-cover rounded-lg hover:opacity-70 transition-opacity duration-300 cursor-pointer shadow-md"
                          onClick={() => handleThumbnailClick(product.photo?.image3)}
                        /></>
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
                              {(selectedPots as any)?.potPrice ? (
                                (
                                  ((100 - product.offerPercentage) / 100) * (Number((selectedSizes as any)?.price) + Number((selectedPots as any).potPrice))
                                ).toFixed(2)
                              ) : (
                                (((100 - product.offerPercentage) / 100) * (selectedSizes as any)?.price).toFixed(2)
                              )} AED
                            </span>

                            <span className="text-gray-500 ml-2 line-through">
                              {(selectedPots as any)?.potPrice ? (
                                (
                                  Number((selectedSizes as any)?.price) +
                                  Number((selectedPots as any)?.potPrice)
                                ).toFixed(2)
                              ) : (
                                Number((selectedSizes as any)?.price).toFixed(2)
                              )} AED
                            </span>
                            <span className="text-[#5f9231] ml-2">
                              {product.offerPercentage}% OFF
                            </span>
                          </>
                        ) : (
                          <span className="text-[#a14e3a] font-semibold">
                            {(selectedPots as any)?.potPrice ? (
                              (
                                Number((selectedSizes as any)?.price) +
                                Number((selectedPots as any)?.potPrice)
                              ).toFixed(2)
                            ) : (
                              Number((selectedSizes as any)?.price).toFixed(2)
                            )} AED
                          </span>
                        )}

                      </p>

                      <div className="mt-4">
                        <p className="text-sm text-gray-600">choose size</p>
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
                      {(selectedSizes as any)?.pots.length >0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600">choose pot</p>
                          <div className="flex flex-wrap">
                            {(selectedSizes as any)?.pots?.map((pot: any, index: any) => (
                              <button
                                key={index}
                                className={`${selectedPots === pot
                                  ? 'bg-[#5f9231] text-white'
                                  : 'bg-gray-200 text-[#5f9231]'
                                  } py-2 px-4 rounded-md m-2 hover:ring-[#8d4533] hover:ring-2 transition-colors duration-300`}
                                onClick={() => setSelectedPots(pot)}
                              >
                                {pot.potName}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

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
                      {product.plantCare?.length > 0 && (
                        <div className="bg-[#f5f5f5] p-4 md:p-6 rounded-lg shadow-md my-2">
                          <h2 className="text-sm md:text-base lg:text-lg font-semibold mb-4">Plant Care</h2>
                          <ul className="space-y-2">
                            {product?.plantCare?.map((point, index) => (
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
                    <Link href={`/similar/${item._id}`} key={item._id}>
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
