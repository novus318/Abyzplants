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
import { Badge } from '@/components/ui/badge';

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
      setSelectedSizes(data.product.sizes[0])
      setSelectedPots(data?.product.sizes[0]?.pots[0])
      if (data.product.photo) {
        setSelectedImage(data.product.photo.image1);
      }
      setLoading(false);
      getSimilarProduct(data?.product._id, data?.product.category._id);
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
                      <h4 className="text-4xl font-semibold mb-2 text-primary">{product.name}</h4>
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
                            <span className="text-primary ml-2">
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
                                ? 'bg-primary text-white'
                                : 'bg-gray-200 text-primary'
                                } py-2 px-4 rounded-md m-2 hover:ring-secondary-foreground hover:ring-2 transition-colors duration-300`}
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
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-200 text-primary'
                                  } py-2 px-4 rounded-md m-2 hover:ring-secondary-foreground hover:ring-2 transition-colors duration-300`}
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
                            <FaMinus className="text-primary text-2xl" />
            </span>
                          <span className="text-2xl">{quantity}</span>
                          <span onClick={handleIncrementQuantity} className="cursor-pointer ring-[#a14f3a27] ring-1 rounded-sm p-1">
                            <FaPlus className="text-primary text-2xl" />
            </span>
                        </div>
          </div>

                      <div className="mt-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                        {product.quantity > 0 ? (
              <>
                            <button
                              type="button"
                              className="bg-primary text-white py-2 px-4 md:px-6 rounded-md hover:bg-secring-secondary-foreground transition-colors duration-300"
                              onClick={handleAddToCart}
                            >
                              Add to Cart
                            </button>
                            <button
                              type="button"
                              className="bg-[#a14e3a] text-white py-2 px-4 md:px-6 rounded-md hover-bg-secring-secondary-foreground transition-colors duration-300"
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
                                <span className="text-primary mr-1 md:mr-2 my-auto">
                                  <FaArrowRight />
                                </span>
                                <p className="text-xs md:text-sm lg:text-base text-gray-700">{point}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
                      <div className="mt-4 md:mt-8">
                        <span className="text-sm md:text-base lg:text-lg text-primary font-semibold">Details:</span>
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
                <h2 className="text-lg md:text-2xl font-semibold text-primary mb-4 md:mb-6">Similar Products</h2>
                <Carousel
                  responsive={responsive}
                  containerClass="carousel-container"
                  additionalTransfrom={0}
                  sliderClass=""
                  itemClass='px-2'
                >
                  {SimilarProducts?.map((item) => (
                    <Link href={`/similar/${item._id}`} key={item._id}>
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
                          <Badge variant='destructive' className="absolute top-1 right-1">
                            {item.offerPercentage}% OFF
                          </Badge>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1 truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-2">
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
                        <div className="absolute inset-0 bg-secondary/70 flex items-center justify-center">
                          <span className="text-destructive font-medium text-sm md:text-base">
                            Restocking Soon
                          </span>
                        </div>
                      )}
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
