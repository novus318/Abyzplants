import React, { useEffect, useState } from 'react';
import { Disclosure } from '@headlessui/react';
import Logo from '@/images/logo.webp';
import UAEFlag from '@/images/image1.webp';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { debounce } from 'lodash';
import { ScrollArea } from './ui/scroll-area';

const navigation = [
  { name: 'Home', href: '/', current: false },
  { name: 'All plants', href: '/plants', current: false },
  { name: 'Pots', href: '/pots', current: false },
  { name: 'Contact Us', href: '/contact', current: false },
];

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const toggleSearchBar = () => {
    setSearchVisible((prevState) => !prevState);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearchInput(inputValue);

    if (inputValue.trim() === '') {
      setSuggestions([]);
      return;
    }

    if (inputValue.length >= 3) {
      debouncedFetchSuggestions(inputValue);
    }
  };

  const debouncedFetchSuggestions = debounce(async (keyword: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/product/searchNames`, {
        params: { keyword },
      });
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  const handleSearchSubmit = (word: string) => {
    const trimmedSearchInput = word.trim();
    if (trimmedSearchInput !== '') {
      const decodedInput = decodeURIComponent(trimmedSearchInput);
      router.push(`/search/${decodedInput}`).then(() => window.location.reload());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
    fetchCategories();
  }, []);

  return (
    <>
      <Disclosure as="nav" className="fixed top-0 w-full bg-white z-10 shadow-sm">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="relative flex items-center justify-between h-16">
                <div className="flex items-center md:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 text-primary hover:text-secondary-foreground">
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
                    <img className="h-12 w-auto" src={Logo.src} alt="Company Logo" />
                  </div>
                </Link>
                <img
                  className="h-6 w-auto rounded-md md:hidden"
                  src={UAEFlag.src}
                  alt="UAE Flag"
                />
                   <Button variant="ghost" size="icon" className="relative md:hidden">
                        <Link href="/cart">
                          <FaShoppingBag className="text-secondary-foreground h-6 w-6" />
                          <Badge className="absolute -top-0.5 -right-0.5 bg-primary text-white !p-0 !px-0.5 !py-0.5 h-4">
                            {cart?.length}
                          </Badge>
                        </Link>
                      </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSearchBar}
                  className="text-secondary-foreground hover:text-primary md:hidden"
                >
                  <FaSearch className="h-5 w-5" />
                </Button>
                <div className="hidden md:flex md:items-center md:space-x-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-secondary-foreground hover:text-primary font-medium"
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSearchBar}
                    className="hidden md:flex text-secondary-foreground hover:text-primary"
                  >
                    <FaSearch className="h-5 w-5" />
                  </Button>
                </div>
                <div className="hidden md:flex md:items-center md:space-x-4">
                  {auth.user ? (
                    <>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="" alt="User Profile" />
                              <AvatarFallback>{(auth.user.name || 'PR').substring(0, 2)}</AvatarFallback>
                            </Avatar>
                          </Button>
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
                      <Button variant="ghost" size="icon" className="relative">
                        <Link href="/cart">
                          <FaShoppingBag className="text-secondary-foreground h-6 w-6" />
                          <Badge className="absolute -top-0.5 -right-0.5 bg-primary text-white !p-0 !px-0.5 !py-0.5 h-4">
                            {cart?.length}
                          </Badge>
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <Link href="/login">
                      <Button variant="default" className="bg-primary hover:bg-primary-dark">
                        Login
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <Disclosure.Panel className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 text-secondary-foreground hover:text-primary font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
                {auth.user ? (
                  <>
                    <Link
                      href="/profile"
                      className="block px-3 py-2 text-secondary-foreground hover:text-primary font-medium"
                    >
                      Your Profile
                    </Link>
                    <Link
                      href="/order"
                      className="block px-3 py-2 text-secondary-foreground hover:text-primary font-medium"
                    >
                      Orders
                    </Link>
                    <Button onClick={handleLogout} className="w-full text-left">
                      Sign out
                    </Button>
                  </>
                ) : (
                  <Link href="/login">
                    <Button variant="default" className="w-full mt-2 bg-primary hover:bg-primary-dark">
                      Login
                    </Button>
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
            className="fixed top-16 right-0 w-full bg-white p-4 shadow-md z-50"
          >
            <div className="relative">
              {/* Search Input */}
              <Input
                type="search"
                placeholder="Search..."
                value={searchInput}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
              />

              {/* Loading State */}
              {loading && (
                <p className="text-sm text-gray-500 mt-2">Loading...</p>
              )}

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 ? (
                <div className="absolute w-full bg-white mt-1 rounded-md shadow-lg max-h-60 overflow-hidden">
                  <ScrollArea className="max-h-[300px]">
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
                  </ScrollArea>
                </div>
              ) : (
                // Fallback Message when no suggestions are found
                !loading && (
                  <p className="text-sm text-gray-500 mt-2">No suggestions found.</p>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}