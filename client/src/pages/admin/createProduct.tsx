'use client'
import AdminSidebar from '@/components/AdminSidebar';
import React, { useState, ChangeEvent, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface ProductData {
  name: string;
  code:string;
  description: string;
  price: string;
  sizes: string[];
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
  const [unit, setUnit] = useState('cm');

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Product name is required'),
    code: Yup.string()
    .required('Product code is required')
    .test('code-length', 'Product code must be exactly 5 characters', (value) => {
      return value.length === 5;
    }),
    description: Yup.string().required('Description is required'),
    price: Yup.string().required('Price is required'),
    category: Yup.string().required('Category is required'),
    plantCare: Yup.array()
      .of(Yup.string())
      .test('max', 'You can add up to 5 plant care points', function (value) {
        if (typeof value === 'undefined') {

          return true;
        }
        return value.length <= 5;
      }),
    quantity: Yup.number()
      .required('Quantity is required')
      .positive()
      .integer(),
    offerPercentage: Yup.number()
      .required('Offer Percentage is required')
      .min(0)
      .max(100),
  });


  const formik = useFormik<ProductData>({
    initialValues: {
      name: '',
      code:'',
      description: '',
      plantCare: [],
      price: '',
      sizes: [],
      category: '',
      quantity: 0,
      offerPercentage: 0,
      images: {},
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      const sortedSizes = [...values.sizes].sort((size1, size2) => {
        const size1Digits = parseInt(size1.split('-')[0]);
        const size2Digits = parseInt(size2.split('-')[0]);
        return size1Digits - size2Digits;
      });
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('code', values.code);
      formData.append('description', values.description);
      formData.append('plantCare', JSON.stringify([...values.plantCare]));
      formData.append('price', values.price);
      formData.append('sizes', JSON.stringify(sortedSizes));
      formData.append('category', values.category);
      formData.append('quantity', values.quantity.toString());
      formData.append('offerPercentage', values.offerPercentage.toString());

      if (values.images.image1) {
        formData.append('image1', values.images.image1);
      }
      if (values.images.image2) {
        formData.append('image2', values.images.image2);
      }
      if (values.images.image3) {
        formData.append('image3', values.images.image3);
      }

      try {
        const response = await axios.post('http://localhost:8080/product/create-product', formData);
        if (response.data.success) {
          toast.success('Product created successfully!');
          formik.resetForm();
          setLoading(false);
        }else if(response.status === 400){
          setLoading(false);
          toast.error(response.data.message);
        }
         else {
          setLoading(false);
          toast.error(response.data.message);
        }
      } catch (error) {
        setLoading(false);
        toast.error('code already exist or something went wrong');
      }
    },
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const updatedSizes = checkbox.checked
        ? [...formik.values.sizes, value]
        : formik.values.sizes.filter((size) => size !== value);

      formik.setFieldValue('sizes', updatedSizes);
    } else {
      formik.setFieldValue(name, value);
    }
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8080/category/get-category');
        setCategories(response.data.category);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast.error('Error fetching categories');
      }
    };

    fetchCategories();
  }, []);


  const handlePlantCareChange = (
    e: ChangeEvent<HTMLTextAreaElement>,
    index: number
  ) => {
    const updatedPlantCare = [...formik.values.plantCare];
    updatedPlantCare[index] = e.target.value;
    formik.setFieldValue('plantCare', updatedPlantCare);
  };
  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col md:flex-row">
          <AdminSidebar />
          <main className="flex-1 p-4 md:ml-64">
            <h1 className="text-3xl font-semibold mb-6">Create Product</h1>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="mb-2">
                  <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formik.values.name}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-md p-2 w-full"
                    required
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.name}</div>
                  )}
                </div>
                <div className="mb-2">
                  <label htmlFor="code" className="block text-gray-700 text-sm font-semibold mb-2">
                    Product Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formik.values.code}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-md p-2 w-full"
                    required
                  />
                  {formik.touched.code && formik.errors.code && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.code}</div>
                  )}
                </div>
                <div className="mb-2">
                  <label htmlFor="category" className="block text-gray-700 text-sm font-semibold mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    onChange={handleInputChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.category}
                    className="border border-gray-300 rounded-md p-2 w-full"
                    required
                  >
                    <option value="" label="Select a category" />
                    {categories.map((category) => (
                      <option
                        key={category.name}
                        value={category._id}
                        label={category.name}
                      />
                    ))}
                  </select>
                  {formik.touched.category && formik.errors.category && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.category}</div>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 text-sm font-semibold mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formik.values.description}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md p-2 w-full h-32"
                  required
                />
                {formik.touched.description && formik.errors.description && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.description}</div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="plantCare" className="block text-gray-700 text-sm font-semibold mb-2">
                  Plant Care (Up to 5 points)
                </label>
                <div>
                  {formik.values.plantCare.map((point, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <textarea
                        name={`plantCare[${index}]`}
                        value={point}
                        onChange={(e) => handlePlantCareChange(e, index)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                      />
                      <button
                        type="button"
                        className="bg-red-500 text-white font-semibold ml-2 p-2 rounded-md"
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
                </div>
                {formik.touched.plantCare && formik.errors.plantCare && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.plantCare}</div>
                )}
                {formik.values.plantCare.length < 5 && (
                  <button
                    type="button"
                    className="bg-[#5f9231] hover:bg-[#4b7427] text-white font-semibold p-2 rounded-md mt-2"
                    onClick={() =>
                      formik.setFieldValue('plantCare', [...formik.values.plantCare, ''])
                    }
                  >
                    Add Plant Care Point
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div className="mb-4">
                  <label htmlFor="price" className="block text-gray-700 text-sm font-semibold mb-2">
                    Price
                  </label>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={formik.values.price}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-md p-2 w-full"
                    required
                  />
                  {formik.touched.price && formik.errors.price && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.price}</div>
                  )}
                </div>
                <div className="mb-4">
                  <label htmlFor="quantity" className="block text-gray-700 text-sm font-semibold mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formik.values.quantity}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-md p-2 w-full"
                    required
                  />
                  {formik.touched.quantity && formik.errors.quantity && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.quantity}</div>
                  )}
                </div>
                <div className="mb-4">
                  <label htmlFor="offerPercentage" className="block text-gray-700 text-sm font-semibold mb-2">
                    Offer Percentage
                  </label>
                  <select
                    name="offerPercentage"
                    value={formik.values.offerPercentage}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-md p-2 w-full"
                    required
                  >
                    {['0', '5', '9', '13', '20', '24', '29', '33', '37', '41', '45', '50', '52', '55', '59', '60', '63', '65', '67', '69', '70', '75', '79', '80', '85', '90'].map((percentage) => (
                      <option key={percentage} value={percentage}>{percentage}%</option>
                    ))}
                  </select>
                  {formik.touched.offerPercentage && formik.errors.offerPercentage && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.offerPercentage}</div>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Select Unit
                </label>
                <select
                  name="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-full"
                >
                  <option value="cm">cm</option>
                  <option value="L">L</option>
                  <option value="kg">kg</option>
                  <option value="count">count</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Sizes
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {unit === 'cm' && ['5-10 cm', '10-20 cm', '20-30 cm', '30-40 cm', '40-50 cm', '50-60 cm', '60-70 cm', '70-80 cm', '80-90 cm', '90-100 cm', '100-120 cm', '120-140 cm', '140-160 cm', '160-180 cm', '180-200 cm', '200-220 cm', '220-240 cm', '240-260 cm', '260-280 cm', '280-300 cm'].map((size) => (
                    <label key={size} className="flex items-center">
                      <input
                        type="checkbox"
                        name="sizes"
                        value={`${size}`}
                        checked={formik.values.sizes.includes(`${size}`)}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-gray-700">{size}</span>
                    </label>
                  ))}
                  {unit === 'L' && ['50 ml','100 ml','150 ml','200 ml','250 ml','300 ml','350 ml','400 ml','450 ml','500 ml','750 ml','1 L','1.5 L','2 L','3 L','4 L','5 L','6 L','7 L','8 L','9 L','10 L','15 L','20 L','25 L','30 L','35 L','40 L','45 L','50 L'].map((size) => (
                    <label key={size} className="flex items-center">
                      <input
                        type="checkbox"
                        name="sizes"
                        value={`${size}`}
                        checked={formik.values.sizes.includes(`${size}`)}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-gray-700">{size}</span>
                    </label>
                  ))}
                  {unit === 'kg' && ['10 g', '20 g', '30 g','40 g','50 g','100 g','150 g','200 g','250 g','300 g','350 g','400 g','450 g','500 g','1 kg','2 kg','3 kg','4 kg','5 kg','6 kg','7 kg','8 kg','9 kg','10 kg','15 kg','20 kg','25 kg','30 kg','35 kg','40 kg','45 kg','50 kg'].map((size) => (
                    <label key={size} className="flex items-center">
                      <input
                        type="checkbox"
                        name="sizes"
                        value={`${size}`}
                        checked={formik.values.sizes.includes(`${size}`)}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-gray-700">{size}</span>
                    </label>
                  ))}
                  {unit === 'count' && ['set 1','set 2','set 3','set 4','set 5','set 6','set 7','set 8','set 9','set 10','set 12','set 14','set 15','set 18','set 20','set 25','set 30','bulk'].map((size) => (
                    <label key={size} className="flex items-center">
                      <input
                        type="checkbox"
                        name="sizes"
                        value={`${size}`}
                        checked={formik.values.sizes.includes(`${size}`)}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span className="text-gray-700">{size}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
                <div className="mb-4">
                  {formik.values.images.image1 && (
                    <img
                      src={URL.createObjectURL(formik.values.images.image1)}
                      alt="Category Image"
                      className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                    />
                  )}
                  <label className="cursor-pointer border border-gray-300 rounded-md p-2 mt-2">
                    {formik.values.images.image1 ? 'Change Image' : 'Upload Image'}
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
                  {formik.values.images.image2 && (
                    <img
                      src={URL.createObjectURL(formik.values.images.image2)}
                      alt="Category Image"
                      className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                    />
                  )}
                  <label className="cursor-pointer border border-gray-300 rounded-md p-2 mt-2">
                    {formik.values.images.image2 ? 'Change Image' : 'Upload Image'}
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
                  {formik.values.images.image3 && (
                    <img
                      src={URL.createObjectURL(formik.values.images.image3)}
                      alt="Category Image"
                      className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                    />
                  )}
                  <label className="cursor-pointer border border-gray-300 rounded-md p-2 mt-2">
                    {formik.values.images.image3 ? 'Change Image' : 'Upload Image'}
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
              </div>
              <div className="mb-4">
                <button
                  type="submit"
                  className="bg-[#5f9231] hover:bg-[#4b7427] text-white font-semibold py-2 px-4 rounded-md"
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

export default CreateProduct;
