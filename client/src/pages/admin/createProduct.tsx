'use client';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50/50">
          <AdminSidebar />
          <ScrollArea className="flex-1 h-screen">
            <main className="p-6 md:ml-64">
              <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Create Product</h1>
                    <p className="mt-1 text-sm text-gray-500">Add a new product to your catalog</p>
                  </div>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-8">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                      <CardDescription>Enter the basic details of your product</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Product Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formik.values.name}
                            onChange={handleInputChange}
                            placeholder="Enter product name"
                            required
                          />
                          {formik.touched.name && formik.errors.name && (
                            <p className="text-sm text-red-500">{formik.errors.name}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="code">Product Code</Label>
                          <Input
                            id="code"
                            name="code"
                            value={formik.values.code}
                            onChange={handleInputChange}
                            placeholder="Enter 5-character code"
                            required
                          />
                          {formik.touched.code && formik.errors.code && (
                            <p className="text-sm text-red-500">{formik.errors.code}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            name="category"
                            value={formik.values.category}
                            onValueChange={(value) => formik.setFieldValue('category', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category._id} value={category._id?.toString() || ''}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formik.touched.category && formik.errors.category && (
                            <p className="text-sm text-red-500">{formik.errors.category}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formik.values.description}
                          onChange={handleInputChange}
                          placeholder="Enter product description"
                          rows={4}
                          required
                        />
                        {formik.touched.description && formik.errors.description && (
                          <p className="text-sm text-red-500">{formik.errors.description}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Plant Care */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Plant Care Instructions</CardTitle>
                      <CardDescription>Add up to 5 care instructions for the plant</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {formik.values.plantCare.map((point, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Textarea
                            name={`plantCare[${index}]`}
                            value={point}
                            onChange={(e) => handlePlantCareChange(e, index)}
                            placeholder={`Care instruction ${index + 1}`}
                            rows={2}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() =>
                              formik.setFieldValue(
                                'plantCare',
                                formik.values.plantCare.filter((_, i) => i !== index)
                              )
                            }
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      {formik.values.plantCare.length < 5 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => formik.setFieldValue('plantCare', [...formik.values.plantCare, ''])}
                        >
                          Add Care Instruction
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Sizes and Pots */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Sizes & Pots</CardTitle>
                      <CardDescription>Configure available sizes and their corresponding pots</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {formik.values.sizes.map((size, sizeIndex) => (
                        <Card key={sizeIndex} className="border-2">
                          <CardContent className="p-4 space-y-4">
                            <div className="flex items-center gap-3">
                              <Input
                                placeholder="Size Name"
                                value={size.name}
                                onChange={(e) => {
                                  const updatedSizes = [...formik.values.sizes];
                                  updatedSizes[sizeIndex].name = e.target.value;
                                  formik.setFieldValue('sizes', updatedSizes);
                                }}
                                className="flex-1"
                              />
                              <Input
                                type="number"
                                placeholder="Price"
                                value={size.price}
                                onChange={(e) => {
                                  const updatedSizes = [...formik.values.sizes];
                                  updatedSizes[sizeIndex].price = e.target.value;
                                  formik.setFieldValue('sizes', updatedSizes);
                                }}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => removeSize(sizeIndex)}
                              >
                                Remove
                              </Button>
                            </div>

                            <div className="pl-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Available Pots</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addPot(sizeIndex)}
                                >
                                  Add Pot
                                </Button>
                              </div>
                              {size.pots.map((pot, potIndex) => (
                                <div key={potIndex} className="flex items-center gap-3">
                                  <Input
                                    placeholder="Pot Name"
                                    value={pot.potName}
                                    onChange={(e) => {
                                      const updatedSizes = [...formik.values.sizes];
                                      updatedSizes[sizeIndex].pots[potIndex].potName = e.target.value;
                                      formik.setFieldValue('sizes', updatedSizes);
                                    }}
                                    className="flex-1"
                                  />
                                  <Input
                                    type="number"
                                    placeholder="Pot Price"
                                    value={pot.potPrice}
                                    onChange={(e) => {
                                      const updatedSizes = [...formik.values.sizes];
                                      updatedSizes[sizeIndex].pots[potIndex].potPrice = parseFloat(e.target.value);
                                      formik.setFieldValue('sizes', updatedSizes);
                                    }}
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => removePot(sizeIndex, potIndex)}
                                  >
                                    ×
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addSize}
                      >
                        Add Size
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Inventory & Pricing */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Inventory & Pricing</CardTitle>
                      <CardDescription>Set the product quantity and offer percentage</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={formik.values.quantity}
                            onChange={handleInputChange}
                            placeholder="Enter quantity"
                            required
                          />
                          {formik.touched.quantity && formik.errors.quantity && (
                            <p className="text-sm text-red-500">{formik.errors.quantity}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="offerPercentage">Offer Percentage</Label>
                          <Input
                            type="number"
                            id="offerPercentage"
                            name="offerPercentage"
                            value={formik.values.offerPercentage}
                            onChange={handleInputChange}
                            placeholder="Enter offer percentage"
                            required
                          />
                          {formik.touched.offerPercentage && formik.errors.offerPercentage && (
                            <p className="text-sm text-red-500">{formik.errors.offerPercentage}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Product Images */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Images</CardTitle>
                      <CardDescription>Upload up to 3 images of your product</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['image1', 'image2', 'image3'].map((imageKey, index) => (
                          <Card key={imageKey} className="overflow-hidden">
                            <CardContent className="p-4 space-y-4">
                              {formik.values.images[imageKey as keyof ProductData['images']] ? (
                                <div className="relative aspect-square">
                                  <img
                                    src={URL.createObjectURL(formik.values.images[imageKey as keyof ProductData['images']] as File)}
                                    alt={`Product Image ${index + 1}`}
                                    className="object-cover w-full h-full rounded-lg"
                                  />
                                </div>
                              ) : (
                                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                  <span className="text-gray-400">No image</span>
                                </div>
                              )}
                              <Label
                                htmlFor={imageKey}
                                className="cursor-pointer block text-center"
                              >
                                {formik.values.images[imageKey as keyof ProductData['images']] ? 'Change Image' : 'Upload Image'}
                                <Input
                                  type="file"
                                  id={imageKey}
                                  name={imageKey}
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, imageKey as keyof ProductData['images'])}
                                  className="hidden"
                                />
                              </Label>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button type="submit" size="lg">
                      Create Product
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

export default withAuth(CreateProduct);