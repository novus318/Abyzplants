import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Spinner from './Spinner';


type Category = {
  _id?: number;
  photo?:any;
  name?: string | undefined;
};
const Categories = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [categories,setCategories] = useState<Category[]>([]);
  const [loading,setLoading] = useState(true)

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/category/get-category`);
      setCategories(response.data.category);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);
  return (
   <>
   {loading ? (<Spinner/>):( <section className="bg-white py-8 m-auto">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-semibold text-[#5f9231] mb-6">Explore Our Categories in plants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories?.map((category) => (
            <Link href={`/category/${category._id}`} key={category._id}>
            <div
              key={category._id}
              className="bg-gray-100 rounded-lg overflow-hidden shadow-md transition-transform transform hover:scale-105 hover:shadow-lg"
            >
              <img
                src={category.photo}
                alt='photo'
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 truncate">{category?.name}</h3>
                <button className="bg-[#5f9231] text-white py-1 px-3 rounded hover:bg-[#8d4533] transition-colors duration-300">
                  Explore
                </button>
              </div>
            </div></Link>
          ))}
        </div>
      </div>
    </section>)}</>
  );
};

export default Categories;
