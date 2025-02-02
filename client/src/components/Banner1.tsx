import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Link from 'next/link';

const BannerSlider = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  return (
    <Carousel
      showArrows={false}
      showStatus={false}
      showIndicators={true}
      showThumbs={false}
      infiniteLoop={true}
      useKeyboardArrows={true}
      autoPlay={true}
      interval={3000}
      stopOnHover={true}
      swipeable={true}
      dynamicHeight={false}
      emulateTouch={true}
      ariaLabel="Banner Slider"
      className="w-full overflow-hidden"
    >
      {/* Slide 1 */}
      <Link href="/plants" aria-label="Explore Plants">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <img
            className="w-full h-auto rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg transform transition-transform duration-300 hover:scale-105"
            src={`${apiUrl}/api/Bannerimages/image1_6564c5af0541c45f21e2d36c.webp`}
            alt="Banner 1 - Explore our plant collection"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Slide 2 */}
      <Link href="/plants" aria-label="Explore Plants">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <img
            className="w-full h-auto rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg transform transition-transform duration-300 hover:scale-105"
            src={`${apiUrl}/api/Bannerimages/image2_6564c5af0541c45f21e2d36c.webp`}
            alt="Banner 2 - Discover our plant varieties"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Slide 3 */}
      <Link href="/plants" aria-label="Explore Plants">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <img
            className="w-full h-auto rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg transform transition-transform duration-300 hover:scale-105"
            src={`${apiUrl}/api/Bannerimages/image3_6564c5af0541c45f21e2d36c.webp`}
            alt="Banner 3 - Find the perfect plants for your home"
            loading="lazy"
          />
        </div>
      </Link>
    </Carousel>
  );
};

export default BannerSlider;