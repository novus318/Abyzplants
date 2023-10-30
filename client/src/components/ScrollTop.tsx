'use client'
import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

const ScrollTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleScroll = () => {
    if (window.scrollY > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    isVisible && (
      <button
        className="fixed bottom-5 z-50 right-2 md:bottom-10 md:right-2 lg:bottom-14 lg:right-5 bg-[#5f9231] text-white px-2 py-2 rounded-full shadow-md hover:bg-[#a14e3a] transition-colors duration-300"
        onClick={scrollToTop}
      >
        <FaArrowUp size={20} />
      </button>
    )
  );
};

export default ScrollTop;
