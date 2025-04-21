'use client'
import AdminSidebar from '@/components/AdminSidebar';
import React, { useState, ChangeEvent, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { withAuth } from '@/components/withAuth';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50/50">
          <AdminSidebar />
          <ScrollArea className="flex-1 h-screen">
            <main className="p-6 md:ml-64">
              <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Create & Update Banner</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your website banners</p>
                  </div>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Banner Images</CardTitle>
                      <CardDescription>Upload and manage your website banners</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {['image1', 'image2', 'image3'].map((imageKey) => (
                        <div key={imageKey} className="space-y-4">
                          <Label htmlFor={imageKey} className="text-base font-medium">
                            Banner {imageKey.slice(-1)}
                          </Label>
                          <div className="space-y-4">
                            {(formik.values[imageKey as keyof BannerData] ? (
                              <img
                                src={URL.createObjectURL(formik.values[imageKey as keyof BannerData] as File)}
                                alt={`Banner ${imageKey.slice(-1)}`}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            ) : (
                              <img
                                src={banners[imageKey as keyof typeof banners]}
                                alt={`Banner ${imageKey.slice(-1)}`}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            ))}
                            <div className="flex items-center gap-4">
                              <Label
                                htmlFor={`file-${imageKey}`}
                                className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                              >
                                {formik.values[imageKey as keyof BannerData] ? 'Change Image' : 'Upload Image'}
                                <Input
                                  type="file"
                                  id={`file-${imageKey}`}
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, imageKey as keyof BannerData)}
                                  className="hidden"
                                />
                              </Label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button type="submit" size="lg">
                      Update Banners
                    </Button>
                  </div>
                </form>
              </div>
            </main>
          </ScrollArea>
        </div>
      )}
    </>
  );
};

export default withAuth(Banner);
