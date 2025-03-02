'use client';
import AdminSidebar from '@/components/AdminSidebar';
import React, { useState, ChangeEvent, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { withAuth } from '@/components/withAuth';

interface ProductData {
  name: string;
  code: string;
  description: string;
  sizes: {
    name: string;
    price: string;
    pots: {
      potName: string;
      potPrice: number;
    }[];
  }[];
  plantCare: string[];
  category: string;
  quantity: number;
  offerPercentage: number;
  images: {
    image1?: File | null;
    image2?: File | null;
    image3?: File | null;
  };
}

type Category = {
  name: string;
  _id?: number;
};

const CreateProduct = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Product name is required'),
    code: Yup.string()
      .required('Product code is required')
      .test('code-length', 'Product code must be exactly 5 characters', (value) => value.length === 5),
    description: Yup.string().required('Description is required'),
    category: Yup.string().required('Category is required'),
    plantCare: Yup.array()
      .of(Yup.string())
      .test('max', 'You can add up to 5 plant care points', (value) => !value || value.length <= 5),
    quantity: Yup.number().required('Quantity is required').positive().integer(),
    offerPercentage: Yup.number().required('Offer Percentage is required').min(0).max(100),
  });

  const formik = useFormik<ProductData>({
    initialValues: {
      name: '',
      code: '',
      description: '',
      plantCare: [],
      sizes: [],
      category: '',
      quantity: 0,
      offerPercentage: 0,
      images: {
        image1: null,
        image2: null,
        image3: null,
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('code', values.code);
      formData.append('description', values.description);
      formData.append('plantCare', JSON.stringify(values.plantCare));
      formData.append('sizes', JSON.stringify(values.sizes));
      formData.append('category', values.category);
      formData.append('quantity', values.quantity.toString());
      formData.append('offerPercentage', values.offerPercentage.toString());

      if (values.images.image1) formData.append('image1', values.images.image1);
      if (values.images.image2) formData.append('image2', values.images.image2);
      if (values.images.image3) formData.append('image3', values.images.image3);

      try {
        const response = await axios.post(`${apiUrl}/api/product/create-product`, formData);
        if (response.data.success) {
          toast.success('Product created successfully!');
          formik.resetForm();
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleImageUpload = (
    e: ChangeEvent<HTMLInputElement>,
    imageKey: keyof ProductData['images']
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 665600) {
        toast.error('Image size should be less than 650 KB');
      } else {
        formik.setFieldValue(`images.${imageKey}`, file);
      }
    }
  };

  const handlePlantCareChange = (e: ChangeEvent<HTMLTextAreaElement>, index: number) => {
    const updatedPlantCare = [...formik.values.plantCare];
    updatedPlantCare[index] = e.target.value;
    formik.setFieldValue('plantCare', updatedPlantCare);
  };

  const addSize = () => {
    formik.setFieldValue('sizes', [...formik.values.sizes, { name: '', price: '', pots: [] }]);
  };

  const removeSize = (index: number) => {
    const updatedSizes = formik.values.sizes.filter((_, i) => i !== index);
    formik.setFieldValue('sizes', updatedSizes);
  };

  const addPot = (sizeIndex: number) => {
    const updatedSizes = [...formik.values.sizes];
    updatedSizes[sizeIndex].pots.push({ potName: '', potPrice: 0 });
    formik.setFieldValue('sizes', updatedSizes);
  };

  const removePot = (sizeIndex: number, potIndex: number) => {
    const updatedSizes = [...formik.values.sizes];
    updatedSizes[sizeIndex].pots = updatedSizes[sizeIndex].pots.filter((_, i) => i !== potIndex);
    formik.setFieldValue('sizes', updatedSizes);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/category/get-category`);
        setCategories(response.data.category);
      } catch (error) {
        toast.error('Error fetching categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col md:flex-row">
          <AdminSidebar />
          <main className="flex-1 p-6 md:ml-64 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-semibold text-gray-800 mb-8">Create Product</h1>
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              {/* Product Name, Code, Category, Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formik.values.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.name}</div>
                  )}
                </div>
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                    Product Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formik.values.code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                  {formik.touched.code && formik.errors.code && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.code}</div>
                  )}
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    onChange={handleInputChange}
                    value={formik.values.category}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.category && formik.errors.category && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.category}</div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formik.values.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  rows={4}
                  required
                />
                {formik.touched.description && formik.errors.description && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.description}</div>
                )}
              </div>

              {/* Plant Care */}
              <div>
                <label htmlFor="plantCare" className="block text-sm font-medium text-gray-700 mb-2">
                  Plant Care (Up to 5 points)
                </label>
                {formik.values.plantCare.map((point, index) => (
                  <div key={index} className="flex items-center gap-3 mb-3">
                    <textarea
                      name={`plantCare[${index}]`}
                      value={point}
                      onChange={(e) => handlePlantCareChange(e, index)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      rows={2}
                    />
                    <button
                      type="button"
                      className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-all"
                      onClick={() =>
                        formik.setFieldValue(
                          'plantCare',
                          formik.values.plantCare.filter((_, i) => i !== index)
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {formik.values.plantCare.length < 5 && (
                  <button
                    type="button"
                    className="bg-secondary-foreground text-white px-4 py-2 rounded-lg hover:bg-secondary-foreground/80 transition-all"
                    onClick={() => formik.setFieldValue('plantCare', [...formik.values.plantCare, ''])}
                  >
                    Add Plant Care Point
                  </button>
                )}
              </div>

              {/* Sizes and Pots */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sizes
                </label>
                {formik.values.sizes.map((size, sizeIndex) => (
                  <div key={sizeIndex} className="mb-6 p-4 border border-gray-300 rounded-lg bg-white">
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="text"
                        placeholder="Size Name"
                        value={size.name}
                        onChange={(e) => {
                          const updatedSizes = [...formik.values.sizes];
                          updatedSizes[sizeIndex].name = e.target.value;
                          formik.setFieldValue('sizes', updatedSizes);
                        }}
                        className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={size.price}
                        onChange={(e) => {
                          const updatedSizes = [...formik.values.sizes];
                          updatedSizes[sizeIndex].price = e.target.value;
                          formik.setFieldValue('sizes', updatedSizes);
                        }}
                        className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-all"
                        onClick={() => removeSize(sizeIndex)}
                      >
                        Remove Size
                      </button>
                    </div>
                    <div className="ml-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pots
                      </label>
                      {size.pots.map((pot, potIndex) => (
                        <div key={potIndex} className="flex items-center gap-3 mb-3">
                          <input
                            type="text"
                            placeholder="Pot Name"
                            value={pot.potName}
                            onChange={(e) => {
                              const updatedSizes = [...formik.values.sizes];
                              updatedSizes[sizeIndex].pots[potIndex].potName = e.target.value;
                              formik.setFieldValue('sizes', updatedSizes);
                            }}
                            className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          />
                          <input
                            type="number"
                            placeholder="Pot Price"
                            value={pot.potPrice}
                            onChange={(e) => {
                              const updatedSizes = [...formik.values.sizes];
                              updatedSizes[sizeIndex].pots[potIndex].potPrice = parseFloat(e.target.value);
                              formik.setFieldValue('sizes', updatedSizes);
                            }}
                            className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          />
                          <button
                            type="button"
                            className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-all"
                            onClick={() => removePot(sizeIndex, potIndex)}
                          >
                            Remove Pot
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="bg-secondary-foreground text-white px-4 py-2 rounded-lg hover:bg-secondary-foreground/80 transition-all"
                        onClick={() => addPot(sizeIndex)}
                      >
                        Add Pot
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="bg-secondary-foreground text-white px-4 py-2 rounded-lg hover:bg-secondary-foreground/80 transition-all"
                  onClick={addSize}
                >
                  Add Size
                </button>
              </div>

              {/* Quantity and Offer Percentage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formik.values.quantity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                  {formik.touched.quantity && formik.errors.quantity && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.quantity}</div>
                  )}
                </div>
                <div>
                  <label htmlFor="offerPercentage" className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Percentage
                  </label>
                  <input
                    type="number"
                    id="offerPercentage"
                    name="offerPercentage"
                    value={formik.values.offerPercentage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                  {formik.touched.offerPercentage && formik.errors.offerPercentage && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.offerPercentage}</div>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['image1', 'image2', 'image3'].map((imageKey, index) => (
                  <div key={imageKey} className="mb-4">
                    {formik.values.images[imageKey as keyof ProductData['images']] && (
                      <img
                        src={URL.createObjectURL(formik.values.images[imageKey as keyof ProductData['images']] as File)}
                        alt="Product Image"
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                      />
                    )}
                    <label className="cursor-pointer mt-2 block text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all">
                      {formik.values.images[imageKey as keyof ProductData['images']] ? 'Change Image' : 'Upload Image'}
                      <input
                        type="file"
                        id={imageKey}
                        name={imageKey}
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, imageKey as keyof ProductData['images'])}
                        hidden
                      />
                    </label>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  className="w-full bg-secondary-foreground text-white px-6 py-3 rounded-lg hover:bg-secondary-foreground/80 transition-all"
                >
                  Create Product
                </button>
              </div>
            </form>
          </main>
        </div>
      )}
    </>
  );
};

export default withAuth(CreateProduct);