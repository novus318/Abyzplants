import React, { Fragment, useEffect, useState } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import Logo from '@/images/logo.webp';
import UAEFlag from '@/images/image1.webp';
import UserProfile from '@/images/user.webp';
import Link from 'next/link';
import { useAuth } from '@/store/authContext';
import { useRouter } from 'next/router';
import { Dropdown, Menu as AntdMenu, Badge } from 'antd';
import axios from 'axios';
import { useCart } from '@/store/cartContext';
import { FaSearch, FaShoppingBag } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { string } from 'yup';

const { SubMenu } = AntdMenu;
const navigation = [
  { name: 'Home', href: '/', current: false },
  { name: 'Contact Us', href: '/contact', current: false },
];

function classNames(...classes:any) {
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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [searchVisible, setSearchVisible] = useState(false);

  const toggleSearchBar = () => {
    setSearchVisible((prevState) => !prevState);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearchInput(inputValue);
  
    if (inputValue.trim() === '') {
      setSuggestions([]);
    } else {
      if(inputValue.length >= 3){
        const filteredSuggestions = names.filter((name) =>
        name.toLowerCase().includes(inputValue.toLowerCase())
      );
      const limitedSuggestions = filteredSuggestions.slice(0, 5);
      setSuggestions(limitedSuggestions as any);
      }
    }
  };
  const handleSearchSubmit = (word:any) => {
    const trimmedSearchInput = word.trim();
    if (trimmedSearchInput !== '') {
      const decodedInput = decodeURIComponent(trimmedSearchInput);
      router.push(`/search/${decodedInput}`).then(() => window.location.reload());
    }
  };
  

  const handleKeyPress = (e:any) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(searchInput);
    }
  };
  

  const getCategoryMenu = () => (
    <AntdMenu>
      {categories.map((category) => (
        <AntdMenu.Item key={category._id}>
          <Link href={`/category/${category._id}`}>{category.name}</Link>
        </AntdMenu.Item>
      ))}
    </AntdMenu>
  );

  const handleLogout = () => {
    setAuth({
      ...auth,
      user: null,
      token: '',
    });
    localStorage.removeItem('user');
    router.push('/');
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
  }, []);

  return (
    <>
      <Disclosure as="nav" className="fixed top-0 w-full bg-white z-10">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="relative flex items-center justify-between h-20">
                <img
                  className="md:h-8 w-auto rounded-md hidden md:block"
                  src={UAEFlag.src}
                  alt="UAE Flag"
                />
                <div className="md:hidden">
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
                <Link href="/">
                  <div className="flex-shrink-0">
                    <img
                      className="h-8 md:h-10 w-auto"
                      src={Logo.src}
                      alt="Your Company"
                    />
                  </div>
                </Link>
                <img
                  className="h-5 md:h-8 w-auto rounded-md md:hidden"
                  src={UAEFlag.src}
                  alt="UAE Flag"
                />
                {auth?.user && (
                  <Link href="/cart" className="py-2 md:hidden">
                    <Badge count={cart?.length} size="small" color="#79bd3f" showZero>
                      <div className="text-[#a14e3a] text-xl">
                        <FaShoppingBag />
                      </div>
                    </Badge>
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={toggleSearchBar}
                    className="text-[#a14e3a] hover:text-[#79bd3f] px-3 py-2 text-xl font-medium netflix"
                  >
                    <FaSearch />
                  </button>
                </div>
                <div className="hidden md:flex md:space-x-4">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        'text-[#a14e3a] hover:text-[#79bd3f]',
                        'px-3 py-2 text-xl font-medium netflix'
                      )}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      {item.name}
                    </a>
                  ))}
                  <Link
                    href="/plants"
                    className={classNames(
                      'text-[#a14e3a] hover:text-[#79bd3f]',
                      'px-3 py-2 text-xl font-medium netflix'
                    )}
                  >
                    Plants
                  </Link>
                  {auth.user ? (
                    <>
                      <Menu as="div" className="relative px-5">
                        <div>
                          <Menu.Button className="relative flex rounded-full">
                            <span className="absolute -inset-1.5" />
                            <span className="sr-only">Open user menu</span>
                            <img
                              className="h-10 w-10 rounded-full"
                              src={UserProfile.src}
                              alt="pro"
                            />
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href="/profile"
                                  className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                >
                                  Your Profile
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href="/order"
                                  className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                >
                                  Orders
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <a
                                  onClick={handleLogout}
                                  className={classNames(active ? 'bg-gray-100 cursor-pointer' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                >
                                  Sign out
                                </a>
                              )}
                            </Menu.Item>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                      <Link href="/cart" className="px-3 py-2">
                        <Badge count={cart?.length} size="small" color="#79bd3f" showZero>
                          <div className="text-[#a14e3a] text-2xl">
                            <FaShoppingBag />
                          </div>
                        </Badge>
                      </Link>
                    </>
                  ) : (
                    <Link href="/login" className="px-4 py-2 netflix font-medium rounded-3xl bg-[#a14e3a] text-white hover:bg-[#79bd3f] transition-colors duration-300 ease-in-out">
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <Disclosure.Panel className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      'text-[#a14e3a] hover-text-[#79bd3f]',
                      'block px-3 py-2 text-lg font-medium netflix'
                    )}
                  >
                    {item.name}
                  </a>
                ))}
                <Dropdown overlay={getCategoryMenu()} placement="bottomLeft">
                  <a
                    className={classNames(
                      'text-[#a14e3a] hover:text-[#79bd3f]',
                      'block px-3 py-2 text-lg font-medium netflix'
                    )}
                  >
                    Plants
                  </a>
                </Dropdown>
                {auth.user ? (
                  <>
                    <Link
                      href="/profile"
                      className={classNames(
                        'text-[#a14e3a] hover-text-[#79bd3f]',
                        'block px-3 py-2 text-lg font-medium netflix'
                      )}
                    >
                      Your Profile
                    </Link>
                    <Link
                      href="/order"
                      className={classNames(
                        'text-[#a14e3a] hover:text-[#79bd3f]',
                        'block px-3 py-2 text-lg font-medium netflix'
                      )}
                    >
                      Orders
                    </Link>
                    <a
                      onClick={handleLogout}
                      className={classNames(
                        'text-[#a14e3a] hover:text-[#79bd3f]',
                        'block px-3 py-2 text-lg font-medium netflix'
                      )}
                    >
                      Sign out
                    </a>
                  </>
                ) : (
                  <Link href="/login" className="block w-full mt-2 py-2 netflix font-medium rounded-3xl bg-[#a14e3a] text-white hover:bg-[#79bd3f] transition-colors duration-300 px-6 ease-in-out">
                    Login
                  </Link>
                )}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <AnimatePresence>
        {searchVisible && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="fixed top-0 right-0 h-16 bg-white w-full p-4 mt-16 z-50"
          >
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-2 border rounded-md focus:outline-none"
              value={searchInput}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress} 
            />
            {suggestions.length > 0 && (
              <div className="bg-white pt-2 rounded-md">
                <ul>
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="py-1 px-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSearchSubmit(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
