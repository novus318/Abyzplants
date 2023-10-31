'use client'
import AdminSidebar from '@/components/AdminSidebar';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import {Button, Modal} from 'antd'

interface CreateCategoryResponse {
  success: boolean;
  message: string;
  category: {
    name: string;
    _id:number;
    photo:string;
  };
}

type Category = {
  name: string;
};
type selectedCategoryForDeletion = {
  _id?: number;
  photo?:string;
  name?: string | undefined;
  image?: File | null;
};
type SelectedCategory = {
  _id?: number;
  photo?:string;
  name?: string | undefined;
  image?: File | null;
};
const CreateCategory = () => {
  const [categories,setCategories] = useState<Category[]>([]);
  const [loading,setLoading] = useState(true)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCategoryForDeletion, setSelectedCategoryForDeletion] = useState<selectedCategoryForDeletion>({} as selectedCategoryForDeletion);
  const [visible, setVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory | null>({} as SelectedCategory);


  const openDeleteModal = (category:any) => {
    setSelectedCategoryForDeletion(category);
    setDeleteModalVisible(true);
  };
  
  const closeDeleteModal = () => {
    setSelectedCategoryForDeletion({});
    setDeleteModalVisible(false);
  };
  const openEditModal = (category: any) => {
    setSelectedCategory({
      _id: category._id ?? undefined,
      name: category.name ?? '',
      image: null,
    });
    setVisible(true);
  };
  

  const closeEditModal = () => {
    setSelectedCategory({});
    setVisible(false);
    window.location.reload();
  };

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
  useEffect(() => {

    fetchCategories();
  }, []);

  // Formik form validation schema
  const validationSchema = Yup.object().shape({
    categoryName: Yup.string().required('Category name is required'),
    categoryImage: Yup.mixed().required('Category Image is required'),
  });

  // Formik form handling
  const formik = useFormik({
    initialValues: {
      categoryName: '',
      categoryImage: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true)
        const formData = new FormData();
        formData.append('name', values.categoryName);
      
        if (values.categoryImage) {
          formData.append('photo', values.categoryImage);
        }
      
        const response = await axios.post<CreateCategoryResponse>('http://localhost:8080/category/create-category', formData);
      
        if (response.data.success) {
          toast.success(`${response.data.category.name} is created`);
          fetchCategories();
          formik.resetForm();
          setLoading(false)
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
       setLoading(false)
        toast.error('Error creating category');
      }
    },
  });
  const handleUpdate = async () => {
    try {
      setLoading(true);
  
      const formData = new FormData();
      formData.append('name', selectedCategory?.name || '');
  
      if (selectedCategory?.image) {
        formData.append('photo', selectedCategory.image);
      }
  
      const response = await axios.put<CreateCategoryResponse>(
        `http://localhost:8080/category/update-category/${selectedCategory?._id}`,
        formData
      );
  
      if (response.data.success) {
        toast.success(`${response.data.category.name} is updated`);
        setLoading(false);
        fetchCategories();
        closeEditModal();
      } else {
        setLoading(false);
        toast.error(response.data.message);
      }
    } catch (error) {
      setLoading(false);
      toast.error('Error updating category');
    }
  };
  
  const handleDelete = async () => {
    try {
      setLoading(true);

      if (selectedCategoryForDeletion._id) {
        const response = await axios.delete(`http://localhost:8080/category/delete-category/${selectedCategoryForDeletion._id}`);

        if (response.data.success) {
          toast.success(`${selectedCategoryForDeletion.name} category has been deleted.`);
          fetchCategories();
          closeDeleteModal();
        } else {
          setLoading(false);
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      setLoading(false);
      toast.error('Error deleting category');
    }
  };
  return (
   <>
   {loading ? (<Spinner/>):( <div className="flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-4 md:ml-64">
        <h1 className="text-3xl font-semibold mb-6">Create Category</h1>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label htmlFor="categoryName" className="block text-gray-700 text-sm font-semibold mb-2">
              Category Name
            </label>
            <input
              type="text"
              id="categoryName"
              name="categoryName"
              value={formik.values.categoryName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="border border-gray-300 rounded-md p-2 w-full"
              required
            />
            {formik.touched.categoryName && formik.errors.categoryName && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.categoryName}</div>
            )}
          </div>
          <div className="mb-4">
            <div className="block text-gray-700 text-sm font-semibold mb-2">Category Image</div>
            {formik.values.categoryImage && (
              <img
                src={URL.createObjectURL(formik.values.categoryImage)}
                alt="Category Image"
                className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
              />
            )}
            <label className="cursor-pointer border border-gray-300 rounded-md p-2 mt-2">
              {formik.values.categoryImage ? 'Change Image' : 'Upload Image'}
              <input
                type="file"
                id="categoryImage"
                name="categoryImage"
                accept="image/*"
                onChange={(e) => formik.setFieldValue('categoryImage', e.target.files?.[0])}
                onBlur={formik.handleBlur}
                hidden
              />
               {formik.touched.categoryImage && formik.errors.categoryImage && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.categoryImage}</div>
            )}
            </label>
          </div>
          <div className="py-4">
            <button
              type="submit"
              className="bg-[#5f9231] hover:bg-[#4b7427] text-white font-semibold py-2 px-4 rounded-md"
            >
              Create Category
            </button>
          </div>
        </form>
        <h2 className="text-2xl font-semibold mt-6">List of Categories</h2>
        {categories.length > 0 ? (
              <ul className="space-y-4 mt-4">
                {categories?.map((category, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-white rounded-md p-4 shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
                  >
                    <span className="text-xl text-gray-800">{category.name}</span>
                    <div className="flex space-x-4">
                      <button className="text-blue-500 hover:text-blue-700 focus:outline-none"
                      onClick={() => openEditModal(category)}>
                        Edit
                      </button>
                      <button className="text-red-500 hover:text-red-700 focus:outline-none"
                      onClick={() => openDeleteModal(category)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No categories available.</p>
            )}
      </main>
      <Modal
    onCancel={closeEditModal}
    footer={null}
    visible={visible}
    title="Edit Category"
  >
    <form onSubmit={handleUpdate} className="space-y-4">
      <div className="mb-4">
        <label
          htmlFor="categoryName"
          className="block text-gray-700 text-sm font-semibold mb-2"
        >
          Updated Category Name
        </label>
        <input
          type="text"
          id="categoryName"
          name="categoryName"
          value={selectedCategory?.name ?? ''}
          onChange={(e) => {
            setSelectedCategory({
              ...selectedCategory,
              name: e.target.value,
            });
          }}
          onBlur={formik.handleBlur}
          className="border border-gray-300 rounded-md p-2 w-full"
          required
        />
      </div>
      <div className="mb-4">
  <div className="block text-gray-700 text-sm font-semibold mb-2">
    Updated Category Image
  </div>
  {selectedCategory?.image ? (
    <img
      src={URL.createObjectURL(selectedCategory.image)}
      alt="Updated Category Image"
      className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
    />
  ) : (
    <img
      src={selectedCategory?.photo}
      alt="Updated Category Image"
      className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
    />
  )}
  <label className="cursor-pointer border border-gray-300 rounded-md p-2 mt-2">
    {selectedCategory?.image ? 'Change Image' : 'Upload Image'}
    <input
      type="file"
      id="categoryImage"
      name="categoryImage"
      accept="image/*"
      onChange={(e) => {
        setSelectedCategory({
          ...selectedCategory,
          image: e.target.files?.[0] || null,
        });
      }}
      onBlur={formik.handleBlur}
      hidden
    />
  </label>
</div>

      <div className="py-4">
        <button
          type="submit"
          className="bg-[#5f9231] hover:bg-[#4b7427] text-white font-semibold py-2 px-4 rounded-md"
        >
          Update Category
        </button>
      </div>
    </form>
  </Modal>;
  <Modal
      visible={deleteModalVisible}
      title="Confirm Delete"
      onCancel={closeDeleteModal}
      footer={[
        <Button key="cancel" onClick={closeDeleteModal}>
          Cancel
        </Button>,
        <button key="confirm" className="bg-red-500 hover:bg-red-600 text-white hover:ring-red-300 hover:ring-1 py-1 px-4 rounded-md mx-2"
        onClick={handleDelete}>
          Delete
        </button>,
      ]}
    >
      Are you sure you want to delete {selectedCategoryForDeletion.name} category?
    </Modal>
    </div>
    )}</>
  );
};

export default CreateCategory;
