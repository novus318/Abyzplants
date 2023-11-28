import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import banner1 from '@/images/banner.webp'
import banner2 from '@/images/banner2.webp'
import banner3 from '@/images/banner3.webp'
import Link from 'next/link';
import axios from 'axios';


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
      >
        <Link href='/plants'>
        <div className='px-4 py-9'>
          <img
          className='sm:rounded-[2rem] md:rounded-[3rem] lg:rounded-[5rem] rounded-[2rem] shadow-lg'
            src={`${apiUrl}/api/Bannerimages/image1_6564c5af0541c45f21e2d36c.webp`}
            alt={banner3.src}
          />
        </div>
        </Link>
        <Link href='/plants'>
        <div className='px-3 py-9'>
          <img
          className='sm:rounded-[2rem] md:rounded-[3rem] lg:rounded-[5rem] rounded-[2rem] shadow-lg'
            src={`${apiUrl}/api/Bannerimages/image2_6564c5af0541c45f21e2d36c.webp`}
            alt={banner2.src}
          />
        </div>
        </Link>
        <Link href='/plants'>
        <div className='px-3 py-9'>
          <img
          className='sm:rounded-[2rem] md:rounded-[3rem] lg:rounded-[5rem] rounded-[2rem] shadow-lg'
            src={`${apiUrl}/api/Bannerimages/image3_6564c5af0541c45f21e2d36c.webp`}
            alt={banner1.src}
          />
        </div>
        </Link>
      </Carousel>
    );
  };
  
  export default BannerSlider;
  
  

