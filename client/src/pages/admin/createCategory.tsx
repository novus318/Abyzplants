'use client'
import AdminSidebar from '@/components/AdminSidebar';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import { Modal } from 'antd';
import { withAuth } from '@/components/withAuth';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


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
  photo?:any;
  name?: string | undefined;
  image?: File | null;
};
const CreateCategory = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
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
      photo:category.photo
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
      const response = await axios.get(`${apiUrl}/api/category/get-category`);
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
      
        const response = await axios.post<CreateCategoryResponse>(`${apiUrl}/api/category/create-category`, formData);
      
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
        `${apiUrl}/api/category/update-category/${selectedCategory?._id}`,
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
        const response = await axios.delete(`${apiUrl}/api/category/delete-category/${selectedCategoryForDeletion._id}`);

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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Category</CardTitle>
            <CardDescription>Create a new product category with name and image</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  name="categoryName"
                  value={formik.values.categoryName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter category name"
                />
                {formik.touched.categoryName && formik.errors.categoryName && (
                  <p className="text-sm text-red-500">{formik.errors.categoryName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Category Image</Label>
                {formik.values.categoryImage && (
                  <div className="relative w-full h-48 rounded-md overflow-hidden mb-4">
                    <img
                      src={URL.createObjectURL(formik.values.categoryImage)}
                      alt="Category Image"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    id="categoryImage"
                    name="categoryImage"
                    accept="image/*"
                    onChange={(e) => formik.setFieldValue('categoryImage', e.target.files?.[0])}
                    onBlur={formik.handleBlur}
                    className="flex-1"
                  />
                  {formik.touched.categoryImage && formik.errors.categoryImage && (
                    <p className="text-sm text-red-500">{formik.errors.categoryImage}</p>
                  )}
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                Create Category
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>List of Categories</CardTitle>
            <CardDescription>Manage your product categories</CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length > 0 ? (
              <div className="space-y-4">
                {categories?.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white rounded-md p-4 shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
                  >
                    <span className="text-xl text-gray-800">{category.name}</span>
                    <div className="flex space-x-4">
                      <Button 
                        variant="outline" 
                        onClick={() => openEditModal(category)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => openDeleteModal(category)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No categories available.</p>
            )}
          </CardContent>
        </Card>
      </main>
      <Modal
        onCancel={closeEditModal}
        footer={null}
        open={visible}
        title="Edit Category"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editCategoryName">Updated Category Name</Label>
            <Input
              id="editCategoryName"
              name="editCategoryName"
              value={selectedCategory?.name ?? ''}
              onChange={(e) => {
                setSelectedCategory({
                  ...selectedCategory,
                  name: e.target.value,
                });
              }}
              placeholder="Enter category name"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Updated Category Image</Label>
            {selectedCategory?.image ? (
              <div className="relative w-full h-48 rounded-md overflow-hidden mb-4">
                <img
                  src={URL.createObjectURL(selectedCategory.image)}
                  alt="Updated Category Image"
                  className="object-cover w-full h-full"
                />
              </div>
            ) : selectedCategory?.photo ? (
              <div className="relative w-full h-48 rounded-md overflow-hidden mb-4">
                <img
                  src={selectedCategory.photo}
                  alt="Updated Category Image"
                  className="object-cover w-full h-full"
                />
              </div>
            ) : null}
            
            <Input
              type="file"
              id="editCategoryImage"
              name="editCategoryImage"
              accept="image/*"
              onChange={(e) => {
                setSelectedCategory({
                  ...selectedCategory,
                  image: e.target.files?.[0] || null,
                });
              }}
              className="flex-1"
            />
          </div>
          
          <Button type="submit" className="w-full">
            Update Category
          </Button>
        </form>
      </Modal>
      
      <Modal
        open={deleteModalVisible}
        title="Confirm Delete"
        onCancel={closeDeleteModal}
        footer={[
          <Button key="cancel" variant="outline" onClick={closeDeleteModal}>
            Cancel
          </Button>,
          <Button 
            key="confirm" 
            variant="destructive" 
            onClick={handleDelete}
          >
            Delete
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete {selectedCategoryForDeletion.name} category?</p>
      </Modal>
    </div>
    )}</>
  );
};

export default withAuth(CreateCategory);
