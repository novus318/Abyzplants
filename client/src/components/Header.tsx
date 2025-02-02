import React, { Fragment, useEffect, useState } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import Logo from '@/images/logo.webp';
import UAEFlag from '@/images/image1.webp';
import UserProfile from '@/images/user.webp';
import Link from 'next/link';
import { useAuth } from '@/store/authContext';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useCart } from '@/store/cartContext';
import { FaSearch, FaShoppingBag } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const navigation = [
  { name: 'Home', href: '/', current: false },
  { name: 'Contact Us', href: '/contact', current: false },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

type Category = {
  name: string;
  _id?: number;
};

export default function Header() {
  const router = useRouter();
  const { auth, setAuth } = useAuth();
  const { cart } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [names, setNames] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searchVisible, setSearchVisible] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const toggleSearchBar = () => {
    setSearchVisible((prevState) => !prevState);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearchInput(inputValue);

    if (inputValue.trim() === '') {
      setSuggestions([]);
    } else {
      if (inputValue.length >= 3) {
        const filteredSuggestions = names.filter((name) =>
          name.toLowerCase().includes(inputValue.toLowerCase())
        );
        const limitedSuggestions = filteredSuggestions.slice(0, 5);
        setSuggestions(limitedSuggestions as any);
      }
    }
  };

  const handleSearchSubmit = (word: any) => {
    const trimmedSearchInput = word.trim();
    if (trimmedSearchInput !== '') {
      const decodedInput = decodeURIComponent(trimmedSearchInput);
      router.push(`/search/${decodedInput}`).then(() => window.location.reload());
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' || e.key === 'Search') {
      handleSearchSubmit(searchInput);
    }
  };

  const handleLogout = () => {
    setAuth({
      ...auth,
      user: null,
      token: '',
    });
    localStorage.removeItem('user');
    router.push('/');
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/category/get-category`);
      setCategories(response.data.category);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    const fetchNames = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/product/searchNames`);
        setNames(response.data.productNames);
      } catch (error) {
        console.error('Error fetching names:', error);
      }
    };
    fetchNames();
    fetchCategories();
  }, []);

  return (
    <>
      <Disclosure as="nav" className="fixed top-0 w-full bg-white z-10 shadow-sm">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="relative flex items-center justify-between h-16">
                {/* Mobile Menu Button */}
                <div className="flex items-center md:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 text-[#79bd3f] hover:text-[#a14e3a]">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16m-7 6h7"
                        />
                      </svg>
                    )}
                  </Disclosure.Button>
                </div>

                {/* Logo */}
                <Link href="/">
                  <div className="flex-shrink-0">
                    <img className="h-8 w-auto" src={Logo.src} alt="Company Logo" />
                  </div>
                </Link>

                {/* UAE Flag (Mobile) */}
                <img
                  className="h-6 w-auto rounded-md md:hidden"
                  src={UAEFlag.src}
                  alt="UAE Flag"
                />

                {/* Search Icon (Mobile) */}
                <button
                  onClick={toggleSearchBar}
                  className="text-[#a14e3a] hover:text-[#79bd3f] md:hidden"
                >
                  <FaSearch className="h-5 w-5" />
                </button>

                {/* Desktop Navigation */}
                <div className="hidden md:flex md:items-center md:space-x-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-[#a14e3a] hover:text-[#79bd3f] font-medium"
                    >
                      {item.name}
                    </Link>
                  ))}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="text-[#a14e3a] hover:text-[#79bd3f] font-medium">
                      Plants
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {categories.map((category) => (
                        <DropdownMenuItem key={category._id}>
                          <Link href={`/category/${category._id}`}>{category.name}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Link href="/pots" className="text-[#a14e3a] hover:text-[#79bd3f] font-medium">
                    Pots
                  </Link>
                </div>

                {/* User Menu and Cart */}
                <div className="hidden md:flex md:items-center md:space-x-4">
                  {auth.user ? (
                    <>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center">
                          <img
                            className="h-8 w-8 rounded-full"
                            src={UserProfile.src}
                            alt="User Profile"
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Link href="/profile">Your Profile</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href="/order">Orders</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleLogout}>
                            Sign out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Link href="/cart">
                        <Badge className="bg-[#79bd3f] text-white">
                          {cart?.length}
                        </Badge>
                        <FaShoppingBag className="text-[#a14e3a] h-6 w-6" />
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="px-4 py-2 rounded-full bg-[#a14e3a] text-white hover:bg-[#79bd3f] transition-colors duration-300"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Menu Panel */}
            <Disclosure.Panel className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 text-[#a14e3a] hover:text-[#79bd3f] font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
                <DropdownMenu>
                  <DropdownMenuTrigger className="block w-full px-3 py-2 text-[#a14e3a] hover:text-[#79bd3f] font-medium text-left">
                    Plants
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {categories.map((category) => (
                      <DropdownMenuItem key={category._id}>
                        <Link href={`/category/${category._id}`}>{category.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link
                  href="/pots"
                  className="block px-3 py-2 text-[#a14e3a] hover:text-[#79bd3f] font-medium"
                >
                  Pots
                </Link>
                {auth.user ? (
                  <>
                    <Link
                      href="/profile"
                      className="block px-3 py-2 text-[#a14e3a] hover:text-[#79bd3f] font-medium"
                    >
                      Your Profile
                    </Link>
                    <Link
                      href="/order"
                      className="block px-3 py-2 text-[#a14e3a] hover:text-[#79bd3f] font-medium"
                    >
                      Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full px-3 py-2 text-[#a14e3a] hover:text-[#79bd3f] font-medium text-left"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="block w-full mt-2 px-4 py-2 rounded-full bg-[#a14e3a] text-white hover:bg-[#79bd3f] text-center"
                  >
                    Login
                  </Link>
                )}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* Search Bar */}
      <AnimatePresence>
        {searchVisible && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="fixed top-16 right-0 w-full bg-white p-4 shadow-md z-50"
          >
            <div className="relative">
              <input
                type="search"
                placeholder="Search..."
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#79bd3f]"
                value={searchInput}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
              />
              {suggestions.length > 0 && (
                <div className="absolute w-full bg-white mt-1 rounded-md shadow-lg">
                  <ul>
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSearchSubmit(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}