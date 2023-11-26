'use client'
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
    sizeOption:string;
    sizes: {
        name: string;
        price: string;
    }[];
    specifications: string[];
    quantity: number;
    offerPercentage: number;
    color: {
        name: string;
    }[];
    images: [
        {
            image: File | null,
            imageName: string,
        }
    ];
}

const CreatePot = () => {
    const [loading, setLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string>('');
    const [sizes, setSizes] = useState<ProductData['sizes']>([]);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Product name is required'),
        code: Yup.string()
            .required('Product code is required')
            .test('code-length', 'Product code must be exactly 5 characters', (value) => {
                return value.length === 5;
            }),
        description: Yup.string().required('Description is required'),
        plantCare: Yup.array()
            .of(Yup.string())
            .test('max', 'You can add up to 5 specifications', function (value) {
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
            code: '',
            description: '',
            specifications: [],
            sizeOption: '',
            color:[],
            sizes: [],
            quantity: 0,
            offerPercentage: 0,
            images: [
                { image: null, imageName: '' },
            ],
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('code', values.code);
            formData.append('description', values.description);
            formData.append('sizeOption', values.sizeOption);
            formData.append('colors', JSON.stringify([...values.color]));
            formData.append('specifications', JSON.stringify([...values.specifications]));
            formData.append('quantity', values.quantity.toString());
            formData.append('offerPercentage', values.offerPercentage.toString());

            Object.keys(values).forEach((key) => {
                if (key === 'images') {
                    values[key].forEach((image:any, index) => {
                        formData.append(`image${index + 1}`, image.image);
                        formData.append(`imageName${index + 1}`, image.imageName);
                    });
                } 
                if (key === 'sizes') {
                    formData.append('sizes', JSON.stringify(values.sizes.map(size => ({ name: size.name, price: size.price }))));
                }
            });
            

            try {
                const response = await axios.post(`${apiUrl}/api/pot/createPot`, formData);
                if (response.data.success) {
                    toast.success('Product created successfully!');
                    formik.resetForm();
                    setLoading(false);
                }
                else {
                    setLoading(false);
                    toast.error(response.data.message);
                }
            } catch (error) {
                setLoading(false);
                toast.error(`${error} something went wrong`);
            }
        },
    });

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        formik.setFieldValue(name, value);
    }

const handleOptionChange = (option: string) => {
    setSelectedOption(option);
    formik.setFieldValue('sizeOption', option)
};

const handleAddSize = () => {
    setSizes([...sizes, { name: '', price: '' }]);
};

const handleSizeChange = (index: number, field: 'name' | 'price', value: string) => {
    const updatedSizes = [...sizes];
    updatedSizes[index][field] = value;
    setSizes(updatedSizes);
    formik.setFieldValue('sizes', updatedSizes);
};

const handleSpecChange = (
    e: ChangeEvent<HTMLTextAreaElement>,
    index: number
) => {
    const updatedSpec = [...formik.values.specifications];
    updatedSpec[index] = e.target.value;
    formik.setFieldValue('specifications', updatedSpec);
};
const handleColorChange = (
    e: ChangeEvent<HTMLInputElement>,
) => {
    const checkbox = e.target as HTMLInputElement;
    const { value } = e.target;
        const updatedColor = checkbox.checked
        ? [...formik.values.color, { name: value }]
        : formik.values.color.filter((name) => name.name !== value);
        formik.setFieldValue('color', updatedColor);
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <label htmlFor="specification" className="block text-gray-700 text-sm font-semibold mb-2">
                                Specifications (Up to 5 points)
                            </label>
                            <div>
                                {formik.values.specifications.map((point:any, index:any) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <textarea
                                            name={`specifications[${index}]`}
                                            value={point}
                                            onChange={(e) => handleSpecChange(e, index)}
                                            className="border border-gray-300 rounded-md p-2 w-full"
                                        />
                                        <button
                                            type="button"
                                            className="bg-red-500 text-white font-semibold ml-2 p-2 rounded-md"
                                            onClick={() =>
                                                formik.setFieldValue(
                                                    'specifications',
                                                    formik.values.specifications.filter((_, i) => i !== index)
                                                )
                                            }
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {formik.touched.specifications && formik.errors.specifications && (
                                <div className="text-red-500 text-sm mt-1">{formik.errors.specifications}</div>
                            )}
                            {formik.values.specifications.length < 5 && (
                                <button
                                    type="button"
                                    className="bg-[#5f9231] hover:bg-[#4b7427] text-white font-semibold p-2 rounded-md mt-2"
                                    onClick={() =>
                                        formik.setFieldValue('specifications', [...formik.values.specifications, ''])
                                    }
                                >
                                    Add Specifications
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div className="mb-4">
                                <label htmlFor="quantity" className="block text-gray-700 text-sm font-semibold mb-2">
                                    Quantity
                                </label>
                                <input
                                    type="text"
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
                                <h2 className="text-lg font-semibold mb-2">Sizes</h2>
                                <div className="mb-2">
                                    <label className="mr-4">
                                        <input
                                            type="radio"
                                            value="diameter"
                                            checked={selectedOption === 'diameter'}
                                            onChange={() => handleOptionChange('diameter')}
                                        />
                                        <span className="ml-2">Choose Diameter</span>
                                    </label>
                                    <label className="mr-4">
                                        <input
                                            type="radio"
                                            value="sizes"
                                            checked={selectedOption === 'sizes'}
                                            onChange={() => handleOptionChange('sizes')}
                                        />
                                        <span className="ml-2">Choose Sizes</span>
                                    </label>
                                    <label className="mr-4">
                                        <input
                                            type="radio"
                                            value="length"
                                            checked={selectedOption === 'length'}
                                            onChange={() => handleOptionChange('length')}
                                        />
                                        <span className="ml-2">Choose Length</span>
                                    </label>
                                </div>
                                {selectedOption && (
                                    <div>
                                        {sizes.map((size, index) => (
                                            <div key={index} className="flex items-center mb-2">
                                                <input
                                                    type="text"
                                                    placeholder="Name"
                                                    name={`sizes[${index}].name`}
                                                    onChange={(e) => handleSizeChange(index, 'name', e.target.value)}
                                                    onBlur={formik.handleBlur}
                                                    value={size.name}
                                                    className="border border-gray-300 rounded-md p-2 mr-2"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Price"
                                                    name={`sizes[${index}].price`}
                                                    onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                                                    onBlur={formik.handleBlur}
                                                    value={size.price}
                                                    className="border border-gray-300 rounded-md p-2"
                                                />
                                            </div>
                                        ))}
                                        {sizes.length < 7 && (
                                            <button
                                                type="button"
                                                onClick={handleAddSize}
                                                className="bg-[#5f9231] hover:bg-[#4b7427] text-white font-semibold py-2 px-4 rounded-md"
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
                                {formik.values.images.map((image, index) => (
                                    <div key={index} className="flex gap-4 mb-5">
                                        <div className='my-auto'>
                                            {image.image && (
                                                <img
                                                    src={URL.createObjectURL(image.image)}
                                                    alt={`Image ${index + 1}`}
                                                    className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                                />
                                            )}
                                            <label className="cursor-pointer border border-gray-300 rounded-md p-2">
                                                {image.image ? 'Change Image' : 'Upload Image'}
                                                <input
                                                    type="file"
                                                    id={`image_${index}`}
                                                    name={`images[${index}].image`}
                                                    accept="image/*"
                                                    onChange={(e) => formik.setFieldValue(`images[${index}].image`, e.currentTarget.files?.[0] || null)}
                                                    onBlur={formik.handleBlur}
                                                    hidden
                                                />
                                            </label>
                                        </div>
                                        <div className='my-auto'>
                                            <input
                                                type="text"
                                                id={`imageName_${index}`}
                                                name={`images[${index}].imageName`}
                                                placeholder={`Image ${index + 1} color`}
                                                onChange={handleInputChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.images[index].imageName}
                                                className="border border-gray-300 rounded-md p-1 w-full"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {formik.values.images.length < 7 && (
                                <button
                                    type="button"
                                    onClick={() => formik.setFieldValue('images', [...formik.values.images, { image: null, imageName: '' }])}
                                    className="bg-[#5f9231] hover:bg-[#4b7427] text-white font-semibold p-2 rounded-md mt-2"
                                >
                                    Add Image
                                </button>
                            )}
                        </div>
                        <h3 className="block text-gray-700 text-lg font-semibold mb-2">
                  Colors
                </h3>
                        <div className='grid grid-cols-5'>
                        { colors.map((color) => (
                    <div key={color} className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="color"
                          value={color}
                          checked={formik.values.color.some((s) => s.name === color)}
                          onChange={handleColorChange}
                          className="mr-2"
                        />
                        <span className="text-gray-700">{color}</span>
                      </label>
                    </div>
                  ))}
                        </div>
                        <div className="mb-4">
                            <button
                                type="submit"
                                className="bg-[#5f9231] hover:bg-[#4b7427] text-white font-semibold py-2 px-4 rounded-md"
                            >
                                Create Pot
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        )}
    </>
);
};

export default withAuth(CreatePot);
