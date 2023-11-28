import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { Button, Modal } from 'antd';
import { withAuth } from '@/components/withAuth';

interface Product {
    _id: string;
    name: string;
    code: string;
    description: string;
    specifications: string[];
    quantity: number;
    images: {
        image1: string;
        image2: string;
        image3: string;
        image4: string;
        image5: string;
        image6: string;
        image7: string;
        imageName1: string;
        imageName2: string;
        imageName3: string;
        imageName4: string;
        imageName5: string;
        imageName6: string;
        imageName7: string;

    }
    offerPercentage: number;
    sizes: {
        name: string;
        price: string;
    }[];
    colors: {
        name: string;
    }[];
}


const EditPot = () => {
    const router = useRouter();
    const { pid } = router.query;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [loading, setLoading] = useState(true);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [specifications, setSpecifications] = useState<string[]>([]);
    const [unit, setUnit] = useState('cm');
    const [image1File, setImage1File] = useState<File | null>(null);
    const [image2File, setImage2File] = useState<File | null>(null);
    const [image3File, setImage3File] = useState<File | null>(null);
    const [image4File, setImage4File] = useState<File | null>(null);
    const [image5File, setImage5File] = useState<File | null>(null);
    const [image6File, setImage6File] = useState<File | null>(null);
    const [image7File, setImage7File] = useState<File | null>(null);
    const [product, setProduct] = useState<Product>({
        _id: '',
        name: '',
        code: '',
        description: '',
        specifications: [],
        quantity: 0,
        offerPercentage: 0,
        sizes: [],
        images: {
            image1: '',
            image2: '',
            image3: '',
            image4: '',
            image5: '',
            image6: '',
            image7: '',
            imageName1: '',
            imageName2: '',
            imageName3: '',
            imageName4: '',
            imageName5: '',
            imageName6: '',
            imageName7: '',
        },
        colors: [],
    });
    const [selectedSizes, setSelectedSizes] = useState<Product['sizes']>([]);
    const [selectedOption, setSelectedOption] = useState<string>('');
    const [selectedColors, setSelectedColors] = useState<Product['colors']>([]);


    const getSingleProduct = async () => {
        try {
            const { data } = await axios.get(`${apiUrl}/api/pot/get-pot/${pid}`);
            const Sizes = data.product.sizes.map((size: any) => ({
                name: size.name,
                price: parseFloat(size.price),
            }));
            setProduct(data.product);
            setSelectedSizes(Sizes);
            setSpecifications(data.product.specifications)
            setSelectedOption(data.product.sizeOption)
            setSelectedColors(data.product.colors)
            setLoading(false);
        } catch (error) {

        }
    };

    useEffect(() => {
        if (pid) getSingleProduct();
    }, [pid]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const sortedSizes = [...selectedSizes].sort((size1, size2) => {
                const size1Digits = parseInt(size1.name.split('-')[0]);
                const size2Digits = parseInt(size2.name.split('-')[0]);
                return size1Digits - size2Digits;
            });
            const formData = new FormData();
            formData.append('name', product.name);
            formData.append('description', product.description);
            formData.append('specifications', JSON.stringify(specifications));
            formData.append('sizes', JSON.stringify(sortedSizes));
            formData.append('colors', JSON.stringify(selectedColors));
            formData.append('quantity', product.quantity.toString());
            formData.append('offerPercentage', product.offerPercentage.toString());
            if (image1File) {
                formData.append('image1', image1File);
                formData.append('imageName1', product.images.imageName1);
            }
            if (image2File) {
                formData.append('image2', image2File);
                formData.append('imageName2', product.images.imageName2);
            }
            if (image3File) {
                formData.append('image3', image3File);
                formData.append('imageName3', product.images.imageName3);
            }
            if (image4File) {
                formData.append('image4', image4File);
                formData.append('imageName4', product.images.imageName4);
            }
            if (image5File) {
                formData.append('image5', image5File);
                formData.append('imageName5', product.images.imageName5);
            }
            if (image6File) {
                formData.append('image6', image6File);
                formData.append('imageName6', product.images.imageName6);
            }
            if (image7File) {
                formData.append('image7', image7File);
                formData.append('imageName7', product.images.imageName7);
            }

            const response = await axios.put(
                `${apiUrl}/api/pot/update-pot/${pid}`,
                formData
            );

            if (response.status === 201) {
                toast.success(`Pot is updated`);
                setLoading(false);
                router.push(`/admin/allPots`);
            } else {
                setLoading(false);
                toast.error('Error updating product');
            }
        } catch (error) {
            setLoading(false);
            toast.error('Error updating product');
        }
    };
    const handleAddSpec = () => {
        if (specifications.length < 5) {
            setSpecifications([...specifications, '']);
        }
    };

    const handleRemoveSpec = (index: number) => {
        const updatedspecification = [...specifications];
        updatedspecification.splice(index, 1);
        setSpecifications(updatedspecification);
    };

    const handleSpecChange = (index: number, value: string) => {
        const updatedspecification = [...specifications];
        updatedspecification[index] = value;
        setSpecifications(updatedspecification);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProduct({
            ...product,
            [name]: value,
        });
    };

    const handleSizeCheckboxChange = (color: any) => {
        const isSelected = selectedColors.find((s) => s.name === color);
        if (isSelected) {
            // Remove color if already selected
            const updatedSelectedcolors = selectedColors.filter((s) => s.name !== color);
            setSelectedColors(updatedSelectedcolors);
        } else {
            // Add color if not already selected
            const updatedSelectedcolors = [...selectedColors, { name: color }];
            setSelectedColors(updatedSelectedcolors);
        }
    };


    const handleDelete = async () => {
        try {
            setLoading(true)
            const response = await axios.delete(`${apiUrl}/api/pot/delete-pot/${pid}`);
            if (response.status === 200) {
                setLoading(false)
                toast.success(`Product deleted successfully`);
                router.push(`/admin/allPots`);
            } else {
                setLoading(false)
                toast.error('Error deleting product');
            }
        } catch (error) {
            setLoading(false)
            toast.error('Error deleting product');
        }
    };
    const openDeleteModal = () => {

        setDeleteModalVisible(true);
    };

    const closeDeleteModal = () => {

        setDeleteModalVisible(false);
    };
    const colors = [
        'Steel',
        'Mix color',
        'Green',
        'Yellow',
        'Blue',
        'Orange',
        'Purple',
        'Red',
        'Grey',
        'Brown',
        'Maroon',
        'Olive',
        'Silver',
        'Pink',
        'Cyan',
        'Rust',
        'Gold',
        'Charcoal',
        'Magenta',
        'Bronze',
        'Cream',
        'Violet',
        'Navy blue',
        'Mustard',
        'Black',
        'Teal',
        'Tan',
        'Lavender',
        'Mauve',
        'Peach',
        'Coral',
        'Burgundy',
        'Indigo',
    ];
    const handleSizeChange = (index: number, field: 'name' | 'price', value: string) => {
        const updatedSizes = [...selectedSizes];
        updatedSizes[index][field] = value;
        setSelectedSizes(updatedSizes);
    };

    return (
        <>
            {loading ? (
                <Spinner />
            ) : (
                <div className="p-6">
                    <Link href='/admin/allProducts'>
                        <FaArrowLeft size={20} />
                    </Link>
                    <h1 className="text-3xl font-semibold mb-1 mt-6">Edit Pot</h1>
                    <h3 className="text-2xl font-semibold mb-6 mt-2">code : {product.code}</h3>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="mb-4">
                            <label
                                htmlFor="name"
                                className="block text-gray-700 text-sm font-semibold mb-2"
                            >
                                Product Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={product.name}
                                onChange={handleInputChange}
                                className="border border-gray-300 rounded-md p-2 w-full"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="description" className="block text-gray-700 text-sm font-semibold mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={product.description}
                                onChange={handleInputChange}
                                className="border border-gray-300 rounded-md p-2 w-full h-32"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="specification" className="block text-gray-700 text-sm font-semibold mb-2">
                                Specifications (Up to 5 points)
                            </label>
                            <div>
                                {specifications?.map((point, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <textarea
                                            name={`specification[${index}]`}
                                            value={point}
                                            onChange={(e) => handleSpecChange(index, e.target.value)}
                                            className="border border-gray-300 rounded-md p-2 w-full"
                                        />
                                        <button
                                            type="button"
                                            className="bg-red-500 text-white font-semibold ml-2 p-2 rounded-md"
                                            onClick={() => handleRemoveSpec(index)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {specifications?.length < 5 && (
                                <button
                                    type="button"
                                    className="bg-[#5f9231] hover:bg-[#4b7427] text-white font-semibold p-2 rounded-md mt-2"
                                    onClick={handleAddSpec}
                                >
                                    Add Specifications
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
                                value={product.quantity}
                                onChange={handleInputChange}
                                className="border border-gray-300 rounded-md p-2 w-full"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="offerPercentage" className="block text-gray-700 text-sm font-semibold mb-2">
                                Offer Percentage
                            </label>
                            <select
                                name="offerPercentage"
                                value={product.offerPercentage}
                                onChange={handleInputChange}
                                className="border border-gray-300 rounded-md p-2 w-full"
                                required
                            >
                                {['0', '5', '9', '13', '20', '24', '29', '33', '37', '41', '45', '50', '52', '55', '59', '60', '63', '65', '67', '69', '70', '75', '79', '80', '85', '90'].map((percentage) => (
                                    <option key={percentage} value={percentage}>{percentage}%</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <h2 className="text-lg font-semibold mb-2">Sizes</h2>
                            <div className="mb-2">
                                <label className="mr-4">
                                    <input
                                        type="radio"
                                        value="diameter"
                                        checked={selectedOption === 'diameter'}
                                        disabled
                                    />
                                    <span className="ml-2">Choose Diameter</span>
                                </label>
                                <label className="mr-4">
                                    <input
                                        type="radio"
                                        value="sizes"
                                        checked={selectedOption === 'sizes'}
                                        disabled
                                    />
                                    <span className="ml-2">Choose Sizes</span>
                                </label>
                                <label className="mr-4">
                                    <input
                                        type="radio"
                                        value="length"
                                        checked={selectedOption === 'length'}
                                        disabled
                                    />
                                    <span className="ml-2">Choose Length</span>
                                </label>
                            </div>
                            {selectedOption && (
                                <div>
                                    {selectedSizes.map((size, index) => (
                                        <div key={index} className="flex items-center mb-2">
                                            <input
                                                type="text"
                                                placeholder="Name"
                                                name={`sizes[${index}].name`}
                                                onChange={(e) => handleSizeChange(index, 'name', e.target.value)}
                                                value={size.name}
                                                className="border border-gray-300 rounded-md p-2 mr-2"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Price"
                                                name={`sizes[${index}].price`}
                                                onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                                                value={size.price}
                                                className="border border-gray-300 rounded-md p-2"
                                            />
                                        </div>
                                    ))}
                                    {selectedSizes.length < 7 && (
                                        <button
                                            type="button"
                                            className="bg-[#5f9231] hover:bg-[#4b7427] text-white font-semibold py-2 px-4 rounded-md"
                                            onClick={() => setSelectedSizes([...selectedSizes, { name: '', price: '' }])}
                                        >
                                            Add
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold mb-2">Images</h2>
                            <div>
                                <div className="flex gap-4 mb-5">
                                    <div className='my-auto'>
                                        {image1File ? (<img
                                            src={URL.createObjectURL(image1File)}
                                            alt="Image1"
                                            className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                        />) : (
                                            <img
                                                src={product.images.image1}
                                                alt="Image1"
                                                className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                            />
                                        )}
                                        <label className="cursor-pointer border border-gray-300 rounded-md p-2 mt-2">
                                            {image1File || product.images.image1 ? 'Change Image' : 'Upload Image'}
                                            <input
                                                type="file"
                                                id="image1"
                                                name="image1"
                                                accept="image/*"
                                                onChange={(e) => setImage1File(e.target.files?.[0] || null)}
                                                hidden
                                            />
                                        </label>
                                    </div>
                                    <div className='my-auto'>
                                        <input
                                            type="text"
                                            id='imageName1'
                                            name='imageName1'
                                            placeholder='Image 1 color'
                                            value={product.images.imageName1}
                                            onChange={(e) => setProduct({
                                                ...product,
                                                images: {
                                                    ...product.images,
                                                    imageName1: e.target.value,
                                                },
                                            })}
                                            className="border border-gray-300 rounded-md p-1 w-full"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 mb-5">
                                    <div className='my-auto'>
                                        {image2File ? (<img
                                            src={URL.createObjectURL(image2File)}
                                            alt="Image2"
                                            className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                        />) : (
                                           <>
                                           {product.images.image2 && (
                                             <img
                                             src={product.images.image2}
                                             alt="Image2"
                                             className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                         />
                                           )}
                                            </>
                                        )}
                                        <label className="cursor-pointer border border-gray-300 rounded-md p-2 mt-2">
                                            {image2File || product.images.image2 ? 'Change Image' : 'Upload Image'}
                                            <input
                                                type="file"
                                                id="image2"
                                                name="image2"
                                                accept="image/*"
                                                onChange={(e) => setImage2File(e.target.files?.[0] || null)}
                                                hidden
                                            />
                                        </label>
                                    </div>
                                    <div className='my-auto'>
                                        <input
                                            type="text"
                                            id='imageName2'
                                            name='imageName2'
                                            placeholder='Image 2 color'
                                            value={product.images.imageName2}
                                            onChange={(e) => setProduct({
                                                ...product,
                                                images: {
                                                    ...product.images,
                                                    imageName2: e.target.value,
                                                },
                                            })}
                                            className="border border-gray-300 rounded-md p-1 w-full"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 mb-5">
                                    <div className='my-auto'>
                                        {image3File ? (<img
                                            src={URL.createObjectURL(image3File)}
                                            alt="Image3"
                                            className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                        />) : (
                                           <>
                                           {product.images.image3 && (
                                             <img
                                             src={product.images.image3}
                                             alt="Image3"
                                             className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                         />
                                           )}
                                            </>
                                        )}
                                        <label className="cursor-pointer border border-gray-300 rounded-md p-2 mt-2">
                                            {image3File || product.images.image3 ? 'Change Image' : 'Upload Image'}
                                            <input
                                                type="file"
                                                id="image3"
                                                name="image3"
                                                accept="image/*"
                                                onChange={(e) => setImage3File(e.target.files?.[0] || null)}
                                                hidden
                                            />
                                        </label>
                                    </div>
                                    <div className='my-auto'>
                                        <input
                                            type="text"
                                            id='imageName3'
                                            name='imageName3'
                                            placeholder='Image 3 color'
                                            value={product.images.imageName3}
                                            onChange={(e) => setProduct({
                                                ...product,
                                                images: {
                                                    ...product.images,
                                                    imageName3: e.target.value,
                                                },
                                            })}
                                            className="border border-gray-300 rounded-md p-1 w-full"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 mb-5">
                                    <div className='my-auto'>
                                        {image4File ? (<img
                                            src={URL.createObjectURL(image4File)}
                                            alt="Image4"
                                            className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                        />) : (
                                           <>
                                           {product.images.image4 && (
                                             <img
                                             src={product.images.image4}
                                             alt="Image4"
                                             className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                         />
                                           )}
                                            </>
                                        )}
                                        <label className="cursor-pointer border border-gray-300 rounded-md p-2 mt-2">
                                            {image4File || product.images.image4 ? 'Change Image' : 'Upload Image'}
                                            <input
                                                type="file"
                                                id="image4"
                                                name="image4"
                                                accept="image/*"
                                                onChange={(e) => setImage4File(e.target.files?.[0] || null)}
                                                hidden
                                            />
                                        </label>
                                    </div>
                                    <div className='my-auto'>
                                        <input
                                            type="text"
                                            id='imageName4'
                                            name='imageName4'
                                            placeholder='Image 4 color'
                                            value={product.images.imageName4}
                                            onChange={(e) => setProduct({
                                                ...product,
                                                images: {
                                                    ...product.images,
                                                    imageName4: e.target.value,
                                                },
                                            })}
                                            className="border border-gray-300 rounded-md p-1 w-full"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 mb-5">
                                    <div className='my-auto'>
                                        {image5File ? (<img
                                            src={URL.createObjectURL(image5File)}
                                            alt="Image5"
                                            className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                        />) : (
                                           <>
                                           {product.images.image5 && (
                                             <img
                                             src={product.images.image5}
                                             alt="Image5"
                                             className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                         />
                                           )}
                                            </>
                                        )}
                                        <label className="cursor-pointer border border-gray-300 rounded-md p-2 mt-2">
                                            {image5File || product.images.image5 ? 'Change Image' : 'Upload Image'}
                                            <input
                                                type="file"
                                                id="image5"
                                                name="image5"
                                                accept="image/*"
                                                onChange={(e) => setImage5File(e.target.files?.[0] || null)}
                                                hidden
                                            />
                                        </label>
                                    </div>
                                    <div className='my-auto'>
                                        <input
                                            type="text"
                                            id='imageName5'
                                            name='imageName5'
                                            placeholder='Image 5 color'
                                            value={product.images.imageName5}
                                            onChange={(e) => setProduct({
                                                ...product,
                                                images: {
                                                    ...product.images,
                                                    imageName5: e.target.value,
                                                },
                                            })}
                                            className="border border-gray-300 rounded-md p-1 w-full"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 mb-5">
                                    <div className='my-auto'>
                                        {image6File ? (<img
                                            src={URL.createObjectURL(image6File)}
                                            alt="Image6"
                                            className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                        />) : (
                                           <>
                                           {product.images.image6 && (
                                             <img
                                             src={product.images.image6}
                                             alt="Image6"
                                             className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                         />
                                           )}
                                            </>
                                        )}
                                        <label className="cursor-pointer border border-gray-300 rounded-md p-2 mt-2">
                                            {image6File || product.images.image6 ? 'Change Image' : 'Upload Image'}
                                            <input
                                                type="file"
                                                id="image6"
                                                name="image6"
                                                accept="image/*"
                                                onChange={(e) => setImage6File(e.target.files?.[0] || null)}
                                                hidden
                                            />
                                        </label>
                                    </div>
                                    <div className='my-auto'>
                                        <input
                                            type="text"
                                            id='imageName6'
                                            name='imageName6'
                                            placeholder='Image 6 color'
                                            value={product.images.imageName6}
                                            onChange={(e) => setProduct({
                                                ...product,
                                                images: {
                                                    ...product.images,
                                                    imageName6: e.target.value,
                                                },
                                            })}
                                            className="border border-gray-300 rounded-md p-1 w-full"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 mb-5">
                                    <div className='my-auto'>
                                        {image7File ? (<img
                                            src={URL.createObjectURL(image7File)}
                                            alt="Image7"
                                            className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                        />) : (
                                           <>
                                           {product.images.image7 && (
                                             <img
                                             src={product.images.image7}
                                             alt="Image7"
                                             className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                         />
                                           )}
                                            </>
                                        )}
                                        <label className="cursor-pointer border border-gray-300 rounded-md p-2 mt-2">
                                            {image7File || product.images.image7 ? 'Change Image' : 'Upload Image'}
                                            <input
                                                type="file"
                                                id="image7"
                                                name="image7"
                                                accept="image/*"
                                                onChange={(e) => setImage7File(e.target.files?.[0] || null)}
                                                hidden
                                            />
                                        </label>
                                    </div>
                                    <div className='my-auto'>
                                        <input
                                            type="text"
                                            id='imageName7'
                                            name='imageName7'
                                            placeholder='Image 7 color'
                                            value={product.images.imageName7}
                                            onChange={(e) => setProduct({
                                                ...product,
                                                images: {
                                                    ...product.images,
                                                    imageName7: e.target.value,
                                                },
                                            })}
                                            className="border border-gray-300 rounded-md p-1 w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <h3 className="block text-gray-700 text-lg font-semibold mb-2">
                            Colors
                        </h3>
                        <div className='grid grid-cols-5'>
                            {colors.map((color) => {
                                const isSelected = selectedColors.find((s) => s.name === color);
                                return (
                                    <div key={color} className="flex items-center">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name={color}
                                                value={color}
                                                checked={!!isSelected}
                                                onChange={() => handleSizeCheckboxChange(color)}
                                                className="mr-2"
                                            />
                                            <span className="text-gray-700">{color}</span>
                                        </label>
                                    </div>
                                )
                            })}
                        </div>

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
                        Are you sure you want to delete {product.name} Product?
                    </Modal>
                </div>
            )}
        </>
    );
};

export default withAuth(EditPot);