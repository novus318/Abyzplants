import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { Button, Modal } from 'antd';
import { withAuth } from '@/components/withAuth';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface Product {
    _id: string;
    name: string;
    code: string;
    description: string;
    plantCare: string[];
    quantity: number;
    photo: {
        image1: any;
        image2: any;
        image3: any;
    };
    offerPercentage: number;
    category: {
        _id: string;
        name: string;
    };
    sizes: {
        name: string;
        price: string;
        pots: {
            potName: string;
            potPrice: string;
        }[];
    }[];
}
interface Images {
    image1: File | null;
    image2: File | null;
    image3: File | null;
  }

const EditProduct = () => {
    const router = useRouter();
    const { pid } = router.query;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [loading, setLoading] = useState(true);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [unit, setUnit] = useState('cm');

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Product name is required'),
        description: Yup.string().required('Description is required'),
        plantCare: Yup.array()
            .of(Yup.string())
            .test('max', 'You can add up to 5 plant care points', (value) => !value || value.length <= 5),
        quantity: Yup.number().required('Quantity is required').positive().integer(),
        offerPercentage: Yup.number().required('Offer Percentage is required').min(0).max(100),
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            code: '',
            description: '',
            plantCare: [],
            quantity: 0,
            offerPercentage: 0,
            sizes: [],
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
            formData.append('description', values.description);
            formData.append('plantCare', JSON.stringify(values.plantCare));
            formData.append('sizes', JSON.stringify(values.sizes));
            formData.append('quantity', values.quantity.toString());
            formData.append('offerPercentage', values.offerPercentage.toString());

            if (values.images.image1) formData.append('image1', values.images.image1);
            if (values.images.image2) formData.append('image2', values.images.image2);
            if (values.images.image3) formData.append('image3', values.images.image3);

            try {
                const response = await axios.put(`${apiUrl}/api/product/update-product/${pid}`, formData);
                if (response.status === 201) {
                    toast.success('Product updated successfully!');
                    router.push('/admin/allProducts');
                } else {
                    toast.error('Error updating product');
                }
            } catch (error) {
                toast.error('Error updating product');
            } finally {
                setLoading(false);
            }
        },
    });

    const getSingleProduct = async () => {
        try {
            const { data } = await axios.get(`${apiUrl}/api/product/get-product/${pid}`);
            const sizes = data.product.sizes.map((size: any) => ({
                name: size.name,
                price: size.price,
                pots: size.pots.map((pot: any) => ({
                    potName: pot.potName,
                    potPrice: pot.potPrice,
                })),
            }));
            formik.setValues({
                name: data.product.name,
                code: data.product.code,
                description: data.product.description,
                plantCare: data.product.plantCare,
                quantity: data.product.quantity,
                offerPercentage: data.product.offerPercentage,
                sizes: sizes,
                images: {
                    image1: null,
                    image2: null,
                    image3: null,
                },
            });
            setLoading(false);
        } catch (error) {
            toast.error('Error fetching product details');
        }
    };

    useEffect(() => {
        if (pid) getSingleProduct();
    }, [pid]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, imageKey: string) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 665600) {
                toast.error('Image size should be less than 650 KB');
            } else {
                formik.setFieldValue(`images.${imageKey}`, file);
            }
        }
    };

    const addSize = () => {
        formik.setFieldValue('sizes', [...formik.values.sizes, { name: '', price: '', pots: [] }]);
    };

    const removeSize = (index: number) => {
        const updatedSizes = formik.values.sizes.filter((_, i) => i !== index);
        formik.setFieldValue('sizes', updatedSizes);
    };

    const addPot = (sizeIndex: number) => {
        const updatedSizes:any = [...formik.values.sizes];
        updatedSizes[sizeIndex].pots.push({ potName: '', potPrice: '' });
        formik.setFieldValue('sizes', updatedSizes);
    };

    const removePot = (sizeIndex: number, potIndex: number) => {
        const updatedSizes:any = [...formik.values.sizes];
        updatedSizes[sizeIndex].pots = updatedSizes[sizeIndex].pots.filter((_:any, i:any) => i !== potIndex);
        formik.setFieldValue('sizes', updatedSizes);
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            const response = await axios.delete(`${apiUrl}/api/product/delete-product/${pid}`);
            if (response.status === 200) {
                toast.success('Product deleted successfully!');
                router.push('/admin/allProducts');
            } else {
                toast.error('Error deleting product');
            }
        } catch (error) {
            toast.error('Error deleting product');
        }finally{
            setLoading(false);
        }
    };
    const openDeleteModal = () => {

        setDeleteModalVisible(true);
    };

    const closeDeleteModal = () => {

        setDeleteModalVisible(false);
    };


    const images = formik.values.images as Images;
    
    return (
        <>
            {loading ? (
                <Spinner />
            ) : (
                <div className="p-6">
                    <Link href='/admin/allProducts'>
                        <FaArrowLeft size={20} />
                    </Link>
                    <h1 className="text-3xl font-semibold mb-1 mt-6">Edit Product</h1>
                    <h3 className="text-2xl font-semibold mb-6 mt-2">Code: {formik.values?.code}</h3>
                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        {/* Product Name, Description, Plant Care, Quantity, Offer Percentage */}
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">
                                Product Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                className="border border-gray-300 rounded-md p-2 w-full"
                                required
                            />
                            {formik.touched.name && formik.errors.name && (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.name}</div>
                            )}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="description" className="block text-gray-700 text-sm font-semibold mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formik.values.description}
                                onChange={formik.handleChange}
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
                            {formik.values.plantCare.map((point, index) => (
                                <div key={index} className="flex items-center mb-2">
                                    <textarea
                                        name={`plantCare[${index}]`}
                                        value={point}
                                        onChange={(e) => {
                                            const updatedPlantCare:any = [...formik.values.plantCare];
                                            updatedPlantCare[index] = e.target.value;
                                            formik.setFieldValue('plantCare', updatedPlantCare);
                                        }}
                                        className="border border-gray-300 rounded-md p-2 w-full"
                                    />
                                    <button
                                        type="button"
                                        className="bg-red-500 text-white font-semibold ml-2 p-2 rounded-md"
                                        onClick={() => {
                                            const updatedPlantCare = formik.values.plantCare.filter((_, i) => i !== index);
                                            formik.setFieldValue('plantCare', updatedPlantCare);
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            {formik.values.plantCare.length < 5 && (
                                <button
                                    type="button"
                                    className="bg-[#5f9231] hover:bg-[#4b7427] text-white font-semibold p-2 rounded-md mt-2"
                                    onClick={() => formik.setFieldValue('plantCare', [...formik.values.plantCare, ''])}
                                >
                                    Add Plant Care Point
                                </button>
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
                                onChange={formik.handleChange}
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
                            <input
                                type="number"
                                id="offerPercentage"
                                name="offerPercentage"
                                value={formik.values.offerPercentage}
                                onChange={formik.handleChange}
                                className="border border-gray-300 rounded-md p-2 w-full"
                                required
                            />
                            {formik.touched.offerPercentage && formik.errors.offerPercentage && (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.offerPercentage}</div>
                            )}
                        </div>
                        {/* Sizes and Pots */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Sizes
                            </label>
                            {formik.values.sizes.map((size:any, sizeIndex) => (
                                <div key={sizeIndex} className="mb-6 p-4 border border-gray-300 rounded-lg bg-white">
                                    <div className="flex items-center gap-3 mb-4">
                                        <input
                                            type="text"
                                            placeholder="Size Name"
                                            value={size.name}
                                            onChange={(e) => {
                                                const updatedSizes:any = [...formik.values.sizes];
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
                                                const updatedSizes:any = [...formik.values.sizes];
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
                                        {size.pots.map((pot:any, potIndex:any) => (
                                            <div key={potIndex} className="flex items-center gap-3 mb-3">
                                                <input
                                                    type="text"
                                                    placeholder="Pot Name"
                                                    value={pot.potName}
                                                    onChange={(e) => {
                                                        const updatedSizes:any = [...formik.values.sizes];
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
                                                        const updatedSizes:any = [...formik.values.sizes];
                                                        updatedSizes[sizeIndex].pots[potIndex].potPrice = e.target.value;
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
                                            className="bg-[#5f9231] text-white px-4 py-2 rounded-lg hover:bg-[#4b7427] transition-all"
                                            onClick={() => addPot(sizeIndex)}
                                        >
                                            Add Pot
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="bg-[#5f9231] text-white px-4 py-2 rounded-lg hover:bg-[#4b7427] transition-all"
                                onClick={addSize}
                            >
                                Add Size
                            </button>
                        </div>
                        {/* Image Upload */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['image1', 'image2', 'image3'].map((imageKey, index) => (
  <div key={imageKey} className="mb-4">
    {images[imageKey as keyof Images] ? (
      <img
        src={URL.createObjectURL(images[imageKey as keyof Images]!)}
        alt={`Product Image ${index + 1}`}
        className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
      />
    ) : (
      <img
        src={`${apiUrl}/api/product/product-photo/${pid}/${index + 1}`}
        alt={`Product Image ${index + 1}`}
        className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
      />
    )}
    <label className="cursor-pointer border border-gray-300 rounded-md p-2 mt-2">
      Change Image
      <input
        type="file"
        id={imageKey}
        name={imageKey}
        accept="image/*"
        onChange={(e) => handleImageUpload(e, imageKey)}
        hidden
      />
    </label>
  </div>
))}
                        </div>
                        {/* Submit and Delete Buttons */}
                        <div className="mb-4">
                            <button
                                type="submit"
                                className="bg-[#5f9231] hover:bg-[#4b7427] text-white font-semibold py-2 px-4 rounded-md"
                            >
                                Update Product
                            </button>
                            <button
                                type="button"
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md ml-4"
                                onClick={openDeleteModal}
                            >
                                Delete Product
                            </button>
                        </div>
                    </form>
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
                        Are you sure you want to delete {formik.values.name} Product?
                    </Modal>
                </div>
            )}
        </>
    );
};

export default withAuth(EditProduct);