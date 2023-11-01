import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import banner1 from '@/images/banner1.webp'
import banner2 from '@/images/banner2.webp'
import banner3 from '@/images/banner3.webp'
import Link from 'next/link';


const BannerSlider = () => {
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
      >
        <Link href='/plants'>
        <div className='px-4 py-9'>
          <img
          className='sm:rounded-[2rem] md:rounded-[3rem] lg:rounded-[5rem] rounded-[2rem] shadow-lg'
            src={banner3.src}
            alt="Slide 1"
          />
        </div>
        </Link>
        <Link href='/plants'>
        <div className='px-3 py-9'>
          <img
          className='sm:rounded-[2rem] md:rounded-[3rem] lg:rounded-[5rem] rounded-[2rem] shadow-lg'
            src={banner2.src}
            alt="Slide 2"
          />
        </div>
        </Link>
        <Link href='/plants'>
        <div className='px-3 py-9'>
          <img
          className='sm:rounded-[2rem] md:rounded-[3rem] lg:rounded-[5rem] rounded-[2rem] shadow-lg'
            src={banner1.src}
            alt="Slide 3"
          />
        </div>
        </Link>
      </Carousel>
    );
  };
  
  export default BannerSlider;
  
  

