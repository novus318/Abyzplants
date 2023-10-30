'use client';
import React, { Fragment, useEffect, useState } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import Logo from '@/images/logo.webp';
import UAEFlag from '@/images/image1.webp';
import UserProfile from '@/images/user.webp';
import Link from 'next/link';
import { useAuth } from '@/store/authContext';
import { useRouter } from 'next/router';
import { Dropdown, Menu as AntdMenu } from 'antd';
import axios from 'axios';
import Image from 'next/image';

const { SubMenu } = AntdMenu;
const navigation = [
  { name: 'Home', href: '/', current: false },
  { name: 'Contact Us', href: '/contact', current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
interface Product {
  _id: string;
  name: string;
  description: string;
  category: {
    name:string;
    _id:number;
  }
  price: number;
  offerPercentage: number;
}
type Category = {
  name: string;
  _id?: number;
};
export default function Header() {
  const router = useRouter();
  const { auth, setAuth } = useAuth()
  const [categories, setCategories] = useState<Category[]>([]);



  

  const getCategoryMenu = () => (
    <AntdMenu>
      {categories.map((category) => (
        <AntdMenu.Item key={category._id}>
          <Link href={`/category/${category._id}`}>
            {category.name}
          </Link>
        </AntdMenu.Item>
      ))}
    </AntdMenu>
  );

  const handleLogout = () => {
    setAuth({
      ...auth,
      user: null,
      token: ''
    })
    localStorage.removeItem('user')
    router.push('/');
  }
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8080/category/get-category');
        setCategories(response.data.category);
  
      } catch (error) {
        window.location.reload()
      }
    };

    fetchCategories();
  }, []);

  return (
    <Disclosure as="nav" className="fixed top-0 w-full bg-white z-10">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-between h-20">
              <Image
                className="h-8 w-auto rounded-md"
                src={UAEFlag}
                alt="UAE Flag"
              />
              <Link href='/'>
                <div className="flex-shrink-0">
                  <Image
                    className="h-10 w-auto"
                    src={Logo}
                    alt="Your Company"
                  />
                </div>
              </Link>
              <div className="hidden md:flex md:space-x-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      'text-[#a14e3a] hover:text-[#79bd3f]',
                      'px-3 py-2 text-xl font-medium netflix',
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
                    'px-3 py-2 text-xl font-medium netflix',
                  )}
                >
                  Plants
                </Link>
                {auth.user ? (<>
                  <Menu as="div" className="relative px-5">
                    <div>
                      <Menu.Button className="relative flex rounded-full">
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">Open user menu</span>
                        <Image
                          className="h-10 w-10 rounded-full"
                          src={UserProfile}
                          alt=""
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
                              href="/cart"
                              className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                            >
                              Cart
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

                </>) : (<Link href='/login' className="px-4 py-2 netflix font-medium rounded-3xl bg-[#a14e3a] text-white hover:bg-[#79bd3f] transition-colors duration-300 ease-in-out">
                  Login
                </Link>)}
              </div>
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
            </div>
          </div>


          <Disclosure.Panel className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    'text-[#a14e3a] hover:text-[#79bd3f]',
                    'block px-3 py-2 text-lg font-medium netflix',
                  )}
                >
                  {item.name}
                </a> 
              ))}
                  <Dropdown overlay={getCategoryMenu()} placement="bottomLeft">
                <a
                  className={classNames(
                    'text-[#a14e3a] hover:text-[#79bd3f]',
                    'block px-3 py-2 text-lg font-medium netflix',
                  )}
                >
                  Plants
                </a>
              </Dropdown>
              {auth.user ? (
                <>
                  <Link
                    href='/profile'
                    className={classNames(
                      'text-[#a14e3a] hover:text-[#79bd3f]',
                      'block px-3 py-2 text-lg font-medium netflix',
                    )}
                  >
                    Your Profile
                  </Link>
                  <Link
                    href='/cart'
                    className={classNames(
                      'text-[#a14e3a] hover:text-[#79bd3f]',
                      'block px-3 py-2 text-lg font-medium netflix',
                    )}
                  >
                    Cart
                  </Link>
                  <Link
                    href='/order'
                    className={classNames(
                      'text-[#a14e3a] hover:text-[#79bd3f]',
                      'block px-3 py-2 text-lg font-medium netflix',
                    )}
                  >
                    Orders
                  </Link>
                  <a
                    onClick={handleLogout}
                    className={classNames(
                      'text-[#a14e3a] hover:text-[#79bd3f]',
                      'block px-3 py-2 text-lg font-medium netflix',
                    )}
                  >
                    Sign out
                  </a>
                </>
              ) : (<Link href='/login' className="block w-full mt-2 py-2 netflix font-medium rounded-3xl bg-[#a14e3a] text-white hover:bg-[#79bd3f] transition-colors duration-300 px-6 ease-in-out">
                Login
              </Link>)}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
