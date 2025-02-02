import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Spinner from './Spinner';
import { Button } from './ui/button';

type Category = {
  _id?: number;
  photo?: any;
  name?: string | undefined;
};

const Categories = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
      {loading ? (
        <Spinner />
      ) : (
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold text-primary mb-8 text-center">
              <span className='text-4xl text-primary'>Explore</span> Our Plant Categories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories?.map((category) => (
                <Link href={`/category/${category._id}`} key={category._id}>
                  <div
                    className="bg-secondary/30 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <img
                      src={category.photo}
                      alt={category.name || 'Category Image'}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className="px-4 my-2">
                      <h3 className="text-lg font-semibold truncate mb-1">
                        {category.name}
                      </h3>
                      <Button size='sm' className="w-full bg-primary hover:bg-primary-dark transition-colors duration-300 mb-2">
                        Explore
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Categories;