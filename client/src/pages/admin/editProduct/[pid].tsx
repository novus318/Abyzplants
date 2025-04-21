import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { withAuth } from '@/components/withAuth';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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

    const images = formik.values.images as Images;
    
    return (
        <>
            {loading ? (
                <Spinner />
            ) : (
                <div className="flex flex-col md:flex-row min-h-screen bg-gray-50/50">
                    <ScrollArea className="flex-1 h-screen">
                        <main className="p-6">
                            <div className="max-w-7xl mx-auto space-y-6">
                                <div className="flex items-center gap-4">
                                    <Link href='/admin/allProducts'>
                                        <Button variant="ghost" size="icon">
                                            <FaArrowLeft size={20} />
                                        </Button>
                                    </Link>
                                    <div>
                                        <h1 className="text-3xl font-semibold text-gray-900">Edit Product</h1>
                                        <p className="mt-1 text-sm text-gray-500">Code: {formik.values?.code}</p>
                                    </div>
                                </div>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Product Details</CardTitle>
                                        <CardDescription>Update your product information</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={formik.handleSubmit} className="space-y-6">
                                            {/* Product Name */}
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Product Name</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formik.values.name}
                                                    onChange={formik.handleChange}
                                                    required
                                                />
                                                {formik.touched.name && formik.errors.name && (
                                                    <p className="text-sm text-red-500">{formik.errors.name}</p>
                                                )}
                                            </div>

                                            {/* Description */}
                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea
                                                    id="description"
                                                    name="description"
                                                    value={formik.values.description}
                                                    onChange={formik.handleChange}
                                                    required
                                                    className="min-h-[100px]"
                                                />
                                                {formik.touched.description && formik.errors.description && (
                                                    <p className="text-sm text-red-500">{formik.errors.description}</p>
                                                )}
                                            </div>

                                            {/* Plant Care */}
                                            <div className="space-y-2">
                                                <Label>Plant Care (Up to 5 points)</Label>
                                                {formik.values.plantCare.map((point, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <Textarea
                                                            name={`plantCare[${index}]`}
                                                            value={point}
                                                            onChange={(e) => {
                                                                const updatedPlantCare:any = [...formik.values.plantCare];
                                                                updatedPlantCare[index] = e.target.value;
                                                                formik.setFieldValue('plantCare', updatedPlantCare);
                                                            }}
                                                            className="flex-1"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() => {
                                                                const updatedPlantCare = formik.values.plantCare.filter((_, i) => i !== index);
                                                                formik.setFieldValue('plantCare', updatedPlantCare);
                                                            }}
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
                                                        Add Plant Care Point
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Quantity */}
                                            <div className="space-y-2">
                                                <Label htmlFor="quantity">Quantity</Label>
                                                <Input
                                                    type="number"
                                                    id="quantity"
                                                    name="quantity"
                                                    value={formik.values.quantity}
                                                    onChange={formik.handleChange}
                                                    required
                                                />
                                                {formik.touched.quantity && formik.errors.quantity && (
                                                    <p className="text-sm text-red-500">{formik.errors.quantity}</p>
                                                )}
                                            </div>

                                            {/* Offer Percentage */}
                                            <div className="space-y-2">
                                                <Label htmlFor="offerPercentage">Offer Percentage</Label>
                                                <Input
                                                    type="number"
                                                    id="offerPercentage"
                                                    name="offerPercentage"
                                                    value={formik.values.offerPercentage}
                                                    onChange={formik.handleChange}
                                                    required
                                                />
                                                {formik.touched.offerPercentage && formik.errors.offerPercentage && (
                                                    <p className="text-sm text-red-500">{formik.errors.offerPercentage}</p>
                                                )}
                                            </div>

                                            {/* Sizes and Pots */}
                                            <div className="space-y-4">
                                                <Label>Sizes</Label>
                                                {formik.values.sizes.map((size:any, sizeIndex) => (
                                                    <Card key={sizeIndex} className="p-4">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <Input
                                                                placeholder="Size Name"
                                                                value={size.name}
                                                                onChange={(e) => {
                                                                    const updatedSizes:any = [...formik.values.sizes];
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
                                                                    const updatedSizes:any = [...formik.values.sizes];
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
                                                                Remove Size
                                                            </Button>
                                                        </div>
                                                        <div className="ml-4 space-y-4">
                                                            <Label>Pots</Label>
                                                            {size.pots.map((pot:any, potIndex:any) => (
                                                                <div key={potIndex} className="flex items-center gap-3">
                                                                    <Input
                                                                        placeholder="Pot Name"
                                                                        value={pot.potName}
                                                                        onChange={(e) => {
                                                                            const updatedSizes:any = [...formik.values.sizes];
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
                                                                            const updatedSizes:any = [...formik.values.sizes];
                                                                            updatedSizes[sizeIndex].pots[potIndex].potPrice = e.target.value;
                                                                            formik.setFieldValue('sizes', updatedSizes);
                                                                        }}
                                                                        className="flex-1"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        onClick={() => removePot(sizeIndex, potIndex)}
                                                                    >
                                                                        Remove Pot
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => addPot(sizeIndex)}
                                                            >
                                                                Add Pot
                                                            </Button>
                                                        </div>
                                                    </Card>
                                                ))}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={addSize}
                                                >
                                                    Add Size
                                                </Button>
                                            </div>

                                            {/* Image Upload */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {['image1', 'image2', 'image3'].map((imageKey, index) => (
                                                    <div key={imageKey} className="space-y-4">
                                                        {images[imageKey as keyof Images] ? (
                                                            <img
                                                                src={URL.createObjectURL(images[imageKey as keyof Images]!)}
                                                                alt={`Product Image ${index + 1}`}
                                                                className="w-full h-48 object-cover rounded-md"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={`${apiUrl}/api/product/product-photo/${pid}/${index + 1}`}
                                                                alt={`Product Image ${index + 1}`}
                                                                className="w-full h-48 object-cover rounded-md"
                                                            />
                                                        )}
                                                        <Label
                                                            htmlFor={imageKey}
                                                            className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                                                        >
                                                            Change Image
                                                            <input
                                                                type="file"
                                                                id={imageKey}
                                                                name={imageKey}
                                                                accept="image/*"
                                                                onChange={(e) => handleImageUpload(e, imageKey)}
                                                                className="hidden"
                                                            />
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Submit and Delete Buttons */}
                                            <div className="flex items-center gap-4">
                                                <Button type="submit">
                                                    Update Product
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive">
                                                            Delete Product
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete {formik.values.name}. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={handleDelete}>
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                        </main>
                    </ScrollArea>
                </div>
            )}
        </>
    );
};

export default withAuth(EditProduct);