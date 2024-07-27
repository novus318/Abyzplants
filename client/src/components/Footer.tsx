import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import winndeal from '@/images/winndeal.webp';

const Footer = () => {
  return (
    <footer className="bg-[#292929] text-white py-4">
      <div className="container mx-auto flex flex-col-reverse md:flex-row justify-between px-4">
        <div className="md:w-1/3 mb-2 md:mb-0 text-center">
          <h3 className="text-lg font-semibold mb-2">Abyzplants.com</h3>
          <p className="text-gray-300 text-xs">
            Abyz Plants the definitive online destination for exceptional indoor and outdoor plants
            and a delightful selection of home accessories. Whether it is for offices,malls,hotels or any setting
            count on us for the freshest & healthiest plants. Explore our (Gift a Plant) option and revel in our swift and reliable delivery service.
          </p>
        </div>
        <div className="md:w-1/3 mb-4 md:mb-0 text-center">
          <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
          <ul className="flex flex-wrap justify-center">
            <li className="mb-2 pr-4">
              <a href="#" className="text-gray-300 hover:text-[#5f9231] transition-colors duration-300">
                Home
              </a>
            </li>
            <li className="mb-2 pr-4">
              <a href="#" className="text-gray-300 hover:text-[#5f9231] transition-colors duration-300">
                Plants
              </a>
            </li>
            <li className="mb-2 pr-4">
              <a href="#" className="text-gray-300 hover:text-[#5f9231] transition-colors duration-300">
                Contact Us
              </a>
            </li>
          </ul>
        </div>
        <div className="md:w-1/3 text-center mb-2">
          <h3 className="text-lg font-semibold mb-2">Connect With Us</h3>
          <div className="flex space-x-4 justify-center">
            <a href="https://www.facebook.com/profile.php?id=61553170792288" target="_blank" className="text-white hover:text-[#5f9231] transition-colors duration-300">
              <FaFacebook size={30} />
            </a>
            <a href="https://www.instagram.com/abyz_plants/"  target="_blank" className="text-white hover:text-[#5f9231] transition-colors duration-300">
              <FaInstagram size={30} />
            </a>
            <a href="#" className="text-white hover:text-[#5f9231] transition-colors duration-300">
              <FaLinkedin size={30} />
            </a>
            <a href="https://wa.me/+971523653085"
              target="_blank"
              className="text-white hover:text-[#5f9231] transition-colors duration-300">
              <FaWhatsapp size={30} />
            </a>
          </div>
        </div>
      </div>
      <div className="mt-6 text-center text-[#f2fafd] text-xs md:text-sm">
        &copy; {new Date().getFullYear()} Developed and designed by{' '}
        <a
          href="https://www.winndeal.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#e8ba79] hover:text-[#f2fafd] transition-colors duration-300"
        >
          <img src={winndeal.src} alt="winndeal" className="inline h-4 ml-1" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
