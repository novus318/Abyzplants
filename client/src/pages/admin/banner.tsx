'use client'
import AdminSidebar from '@/components/AdminSidebar';
import React, { useState, ChangeEvent, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { withAuth } from '@/components/withAuth';

interface BannerData {
  image1: File | null,
  image2: File | null,
  image3: File | null,
}
interface Banner {
  _id: string;
  images:{
    image1: string,
    image2: string,
    image3: string,
  }
}

const Banner = () => {
  const [loading, setLoading] = useState(false);
  const [bannerId, setBannerId] = useState<Banner['_id']>('')
  const [banners, setBanners] = useState<Banner['images']>({
    image1:'',
    image2:'',
    image3:'',
  });
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const formik = useFormik<BannerData>({
    initialValues: {
      image1: null,
      image2: null,
      image3: null,
    },
    onSubmit: async (values: any) => {
      setLoading(true);

      const formData = new FormData();
      formData.append('image1', values.image1);
      formData.append('image2', values.image2);
      formData.append('image3', values.image3);

      try {
        const response = await axios.put(`${apiUrl}/api/pot/update-banner/${bannerId}`, formData);
        if (response.data.success) {
          fetchBanners()
          setLoading(false);
          toast.success('Banner updated successfully!');
        } else {
          setLoading(false);
          toast.error(response.data.message);
        }
      } catch (error) {
        setLoading(false);
        toast.error('Something went wrong while updating the banner');
      }
    },
  });
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/pot/get-Banner`);
      if (response.data.success) {
        setBanners(response.data.banners[0].images);
        setBannerId(response.data.banners[0]._id)
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Error fetching banners');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageUpload = (
    e: ChangeEvent<HTMLInputElement>,
    imageKey: keyof BannerData
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      formik.setFieldValue(imageKey, file);
    }
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col md:flex-row">
          <AdminSidebar />
          <main className="flex-1 p-4 md:ml-64">
            <h1 className="text-3xl font-semibold mb-6">Create & Update Banner</h1>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="mb-4">
                <label htmlFor="image1" className="block text-gray-700 text-sm font-semibold mb-2">
                  Banner 1
                </label>
                {formik.values.image1 ? (
                 <>
                 {formik.values.image1 && (
                  <img
                    src={URL.createObjectURL(formik.values.image1)}
                    alt="Image 1"
                    className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                  />)}
                  </>
                ):(
                  <img
                  src={banners.image1}
                  alt="Image 1"
                  className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                />
                ) }
                <label className="cursor-pointer border border-gray-300 rounded-md p-2 mt-2">
                  {formik.values.image1 ? 'Change Image' : 'Upload Image'}
                  <input
                    type="file"
                    id="image1"
                    name="image1"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'image1')}
                    onBlur={formik.handleBlur}
                    hidden
                  />
                </label>
              </div>
              <div className="mb-4">
                <label htmlFor="image2" className="block text-gray-700 text-sm font-semibold mb-2">
                  Banner 2
                </label>
                {formik.values.image2 ? (
                 <>
                 {formik.values.image2 && (
                  <img
                    src={URL.createObjectURL(formik.values.image2)}
                    alt="Image 1"
                    className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                  />)}
                  </>
                ):(
                  <img
                  src={banners.image2}
                  alt="Image 1"
                  className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                />
                ) }
                <label className="cursor-pointer border border-gray-300 rounded-md p-2 mt-2">
                  {formik.values.image2 ? 'Change Image' : 'Upload Image'}
                  <input
                    type="file"
                    id="image2"
                    name="image2"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'image2')}
                    onBlur={formik.handleBlur}
                    hidden
                  />
                </label>
              </div>
              <div className="mb-4">
                <label htmlFor="image3" className="block text-gray-700 text-sm font-semibold mb-2">
                  Banner 3
                </label>
                {formik.values.image3 ? (
                 <>
                 {formik.values.image3 && (
                  <img
                    src={URL.createObjectURL(formik.values.image3)}
                    alt="Image 1"
                    className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                  />)}
                  </>
                ):(
                  <img
                  src={banners.image3}
                  alt="Image 1"
                  className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                />
                ) }
                <label className="cursor-pointer border border-gray-300 rounded-md p-2 mt-2">
                  {formik.values.image3 ? 'Change Image' : 'Upload Image'}
                  <input
                    type="file"
                    id="image3"
                    name="image3"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'image3')}
                    onBlur={formik.handleBlur}
                    hidden
                  />
                </label>
              </div>
              <div className="mb-4">
                <button
                  type="submit"
                  className="bg-[#5f9231] hover:bg-[#4b7427] text-white font-semibold py-2 px-4 rounded-md"
                >
                  Create & Update Banner
                </button>
              </div>
            </form>
          </main>
        </div>
      )}
    </>
  );
};

export default withAuth(Banner);
