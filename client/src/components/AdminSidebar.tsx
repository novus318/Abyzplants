import React from 'react';
import Sidebar from 'react-sidebar';
import { FaPlus, FaList, FaUsers } from 'react-icons/fa';
import Link from 'next/link';

const AdminSidebar = () => {
  const sidebarStyles = {
    root: {
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 1000,
      backgroundColor: '#292929',
      width: '250px',
      color: 'white',
    },
    sidebar: {
      width: '100%',
      padding: '20px',
      paddingTop: '40px',
    },
    content: {
      padding: '20px',
    },
  };

  return (
    <Sidebar
      sidebar={
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-white">Admin Panel</h2>
          <ul className="list-none p-0 m-0">
            <li className="mb-3">
              <Link href="/admin/dashboard" className="text-white flex items-center">
                <FaPlus className="mr-2" /> Orders
              </Link>
            </li>
            <li className="mb-3">
              <Link href="/admin/createCategory" className="text-white flex items-center">
                <FaPlus className="mr-2" /> Create Category
              </Link>
            </li>
            <li className="mb-3">
              <Link href="/admin/createProduct" className="text-white flex items-center">
                <FaPlus className="mr-2" /> Create Product
              </Link>
            </li>
            <li className="mb-3">
              <Link href="/admin/createPot" className="text-white flex items-center">
                <FaPlus className="mr-2" /> Create Pot
              </Link>
            </li>
            <li className="mb-3">
              <Link href="/admin/allProducts" className="text-white flex items-center">
                <FaList className="mr-2" /> All Products
              </Link>
            </li>
            <li className="mb-3">
              <Link href="/admin/Users" className="text-white flex items-center">
                <FaUsers className="mr-2" /> Users
              </Link>
            </li>
          </ul>
        </div>
      }
      styles={sidebarStyles as any}
      docked={true}
    >
      {null}
    </Sidebar>
  );
};

export default AdminSidebar;
