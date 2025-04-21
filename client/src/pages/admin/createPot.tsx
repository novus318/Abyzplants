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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

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
                    setSelectedOption('')
                    setSizes([])
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
            <div className="flex flex-col md:flex-row min-h-screen bg-gray-50/50">
                <AdminSidebar />
                <ScrollArea className="flex-1 h-screen">
                    <main className="p-6 md:ml-64">
                        <div className="max-w-7xl mx-auto space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-semibold text-gray-900">Create Pot</h1>
                                    <p className="mt-1 text-sm text-gray-500">Add a new pot to your catalog</p>
                                </div>
                            </div>

                            <form onSubmit={formik.handleSubmit} className="space-y-8">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Basic Information</CardTitle>
                                        <CardDescription>Enter the basic details of your pot</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Product Name</Label>
                                                <Input
                                    id="name"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={handleInputChange}
                                                    placeholder="Enter pot name"
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
                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                id="description"
                                name="description"
                                value={formik.values.description}
                                onChange={handleInputChange}
                                                placeholder="Enter pot description"
                                                rows={4}
                                required
                            />
                            {formik.touched.description && formik.errors.description && (
                                                <p className="text-sm text-red-500">{formik.errors.description}</p>
                            )}
                        </div>
                                    </CardContent>
                                </Card>

                                {/* Specifications */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Specifications</CardTitle>
                                        <CardDescription>Add up to 5 specifications for the pot</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {formik.values.specifications.map((point, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <Textarea
                                            name={`specifications[${index}]`}
                                            value={point}
                                            onChange={(e) => handleSpecChange(e, index)}
                                                    placeholder={`Specification ${index + 1}`}
                                                    rows={2}
                                                    className="flex-1"
                                        />
                                                <Button
                                            type="button"
                                                    variant="destructive"
                                                    size="icon"
                                            onClick={() =>
                                                formik.setFieldValue(
                                                    'specifications',
                                                    formik.values.specifications.filter((_, i) => i !== index)
                                                )
                                            }
                                        >
                                                    ×
                                                </Button>
                                    </div>
                                ))}
                            {formik.values.specifications.length < 5 && (
                                            <Button
                                    type="button"
                                                variant="outline"
                                                onClick={() => formik.setFieldValue('specifications', [...formik.values.specifications, ''])}
                                >
                                                Add Specification
                                            </Button>
                            )}
                                    </CardContent>
                                </Card>

                                {/* Inventory & Pricing */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Inventory & Pricing</CardTitle>
                                        <CardDescription>Set the pot quantity and offer percentage</CardDescription>
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
                                                <Select
                                    name="offerPercentage"
                                                    value={formik.values.offerPercentage.toString()}
                                                    onValueChange={(value) => formik.setFieldValue('offerPercentage', parseInt(value))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select offer percentage" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                    {['0', '5', '9', '13', '20', '24', '29', '33', '37', '41', '45', '50', '52', '55', '59', '60', '63', '65', '67', '69', '70', '75', '79', '80', '85', '90'].map((percentage) => (
                                                            <SelectItem key={percentage} value={percentage}>
                                                                {percentage}%
                                                            </SelectItem>
                                    ))}
                                                    </SelectContent>
                                                </Select>
                                {formik.touched.offerPercentage && formik.errors.offerPercentage && (
                                                    <p className="text-sm text-red-500">{formik.errors.offerPercentage}</p>
                                )}
                            </div>
                        </div>
                                    </CardContent>
                                </Card>

                                {/* Size Options */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Size Options</CardTitle>
                                        <CardDescription>Choose how to specify pot sizes</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <RadioGroup
                                            value={selectedOption}
                                            onValueChange={handleOptionChange}
                                            className="flex flex-col space-y-2"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="diameter" id="diameter" />
                                                <Label htmlFor="diameter">Choose Diameter</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="sizes" id="sizes" />
                                                <Label htmlFor="sizes">Choose Sizes</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="length" id="length" />
                                                <Label htmlFor="length">Choose Length</Label>
                                </div>
                                        </RadioGroup>

                                {selectedOption && (
                                            <div className="space-y-4">
                                        {sizes.map((size, index) => (
                                                    <div key={index} className="flex items-center gap-3">
                                                        <Input
                                                    placeholder="Name"
                                                            value={size.name}
                                                    onChange={(e) => handleSizeChange(index, 'name', e.target.value)}
                                                            className="flex-1"
                                                />
                                                        <Input
                                                    placeholder="Price"
                                                            value={size.price}
                                                    onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                                                            className="flex-1"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() => {
                                                                const updatedSizes = sizes.filter((_, i) => i !== index);
                                                                setSizes(updatedSizes);
                                                                formik.setFieldValue('sizes', updatedSizes);
                                                            }}
                                                        >
                                                            ×
                                                        </Button>
                                            </div>
                                        ))}
                                        {sizes.length < 7 && (
                                                    <Button
                                                type="button"
                                                        variant="outline"
                                                onClick={handleAddSize}
                                            >
                                                        Add Size
                                                    </Button>
                                        )}
                                    </div>
                                )}
                                    </CardContent>
                                </Card>

                                {/* Colors */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Available Colors</CardTitle>
                                        <CardDescription>Select the colors available for this pot</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {colors.map((color) => (
                                                <div key={color} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={color}
                                                        checked={formik.values.color.some((c) => c.name === color)}
                                                        onCheckedChange={(checked) => {
                                                            const updatedColor = checked
                                                                ? [...formik.values.color, { name: color }]
                                                                : formik.values.color.filter((c) => c.name !== color);
                                                            formik.setFieldValue('color', updatedColor);
                                                        }}
                                                    />
                                                    <Label htmlFor={color} className="text-sm">{color}</Label>
                                                </div>
                                            ))}
                            </div>
                                    </CardContent>
                                </Card>

                                {/* Images */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Product Images</CardTitle>
                                        <CardDescription>Upload images of your pot (up to 7 images)</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {formik.values.images.map((image, index) => (
                                                <Card key={index} className="overflow-hidden">
                                                    <CardContent className="p-4 space-y-4">
                                                        {image.image ? (
                                                            <div className="relative aspect-square">
                                                <img
                                                    src={URL.createObjectURL(image.image)}
                                                                    alt={`Pot Image ${index + 1}`}
                                                                    className="object-cover w-full h-full rounded-lg"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                                                <span className="text-gray-400">No image</span>
                                                            </div>
                                            )}
                                                        <div className="space-y-2">
                                                            <Label
                                                                htmlFor={`image_${index}`}
                                                                className="cursor-pointer block text-center"
                                                            >
                                                {image.image ? 'Change Image' : 'Upload Image'}
                                                                <Input
                                                    type="file"
                                                    id={`image_${index}`}
                                                    name={`images[${index}].image`}
                                                    accept="image/*"
                                                    onChange={(e) => formik.setFieldValue(`images[${index}].image`, e.currentTarget.files?.[0] || null)}
                                                                    className="hidden"
                                                />
                                                            </Label>
                                                            <Input
                                                type="text"
                                                placeholder={`Image ${index + 1} color`}
                                                                value={image.imageName}
                                                                onChange={(e) => formik.setFieldValue(`images[${index}].imageName`, e.target.value)}
                                            />
                                        </div>
                                                    </CardContent>
                                                </Card>
                                ))}
                            </div>
                            {formik.values.images.length < 7 && (
                                            <Button
                                    type="button"
                                                variant="outline"
                                    onClick={() => formik.setFieldValue('images', [...formik.values.images, { image: null, imageName: '' }])}
                                                className="mt-4"
                                >
                                    Add Image
                                            </Button>
                            )}
                                    </CardContent>
                                </Card>

                                <div className="flex justify-end">
                                    <Button type="submit" size="lg">
                                        Create Pot
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

export default withAuth(CreatePot);
