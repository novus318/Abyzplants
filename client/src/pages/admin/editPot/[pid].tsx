import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { withAuth } from '@/components/withAuth';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, Plus, Trash2, X } from "lucide-react";

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
            toast.error('Failed to load pot details');
            setLoading(false);
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
                toast.success(`Pot updated successfully`);
                setLoading(false);
                router.push(`/admin/allPots`);
            } else {
                setLoading(false);
                toast.error('Error updating pot');
            }
        } catch (error) {
            setLoading(false);
            toast.error('Error updating pot');
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
                toast.success(`Pot deleted successfully`);
                router.push(`/admin/allPots`);
            } else {
                setLoading(false)
                toast.error('Error deleting pot');
            }
        } catch (error) {
            setLoading(false)
            toast.error('Error deleting pot');
        }
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
                <div className="flex items-center justify-center min-h-screen">
                    <Spinner />
                </div>
            ) : (
                <div className="flex flex-col min-h-screen bg-gray-50/50">
                    <ScrollArea className="flex-1 h-screen">
                        <main className="p-6">
                            <div className="max-w-7xl mx-auto space-y-6">
                                <div className="flex items-center gap-4">
                                    <Link href='/admin/allPots'>
                                        <Button variant="ghost" size="icon" className="rounded-full">
                                            <FaArrowLeft size={20} />
                                        </Button>
                                    </Link>
                                    <div>
                                        <h1 className="text-3xl font-semibold text-gray-900">Edit Pot</h1>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-sm text-gray-500">Code: {product.code}</p>
                                            {product.offerPercentage > 0 && (
                                                <Badge variant="destructive">{product.offerPercentage}% OFF</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleFormSubmit}>
                                    <Tabs defaultValue="basic" className="w-full">
                                        <TabsList className="grid w-full grid-cols-3 mb-6">
                                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                            <TabsTrigger value="sizes">Sizes & Colors</TabsTrigger>
                                            <TabsTrigger value="images">Images</TabsTrigger>
                                        </TabsList>
                                        
                                        <TabsContent value="basic" className="space-y-6">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Basic Information</CardTitle>
                                                    <CardDescription>Update the basic details of your pot</CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-6">
                                                    {/* Product Name */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name">Product Name</Label>
                                                        <Input
                                                            id="name"
                                                            name="name"
                                                            value={product.name}
                                                            onChange={handleInputChange}
                                                            required
                                                            placeholder="Enter product name"
                                                        />
                                                    </div>

                                                    {/* Description */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="description">Description</Label>
                                                        <Textarea
                                                            id="description"
                                                            name="description"
                                                            value={product.description}
                                                            onChange={handleInputChange}
                                                            required
                                                            className="min-h-[100px]"
                                                            placeholder="Enter product description"
                                                        />
                                                    </div>

                                                    {/* Specifications */}
                                                    <div className="space-y-2">
                                                        <Label>Specifications (Up to 5 points)</Label>
                                                        <div className="space-y-3">
                                                            {specifications?.map((point, index) => (
                                                                <div key={index} className="flex items-center gap-2">
                                                                    <Textarea
                                                                        name={`specification[${index}]`}
                                                                        value={point}
                                                                        onChange={(e) => handleSpecChange(index, e.target.value)}
                                                                        className="flex-1"
                                                                        placeholder={`Specification point ${index + 1}`}
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="icon"
                                                                        onClick={() => handleRemoveSpec(index)}
                                                                        className="h-10 w-10"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {specifications?.length < 5 && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={handleAddSpec}
                                                                className="mt-2"
                                                            >
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Add Specification
                                                            </Button>
                                                        )}
                                                    </div>

                                                    <Separator />

                                                    {/* Quantity */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="quantity">Quantity</Label>
                                                        <Input
                                                            type="number"
                                                            id="quantity"
                                                            name="quantity"
                                                            value={product.quantity}
                                                            onChange={handleInputChange}
                                                            required
                                                            min="0"
                                                            placeholder="Enter quantity"
                                                        />
                                                    </div>

                                                    {/* Offer Percentage */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="offerPercentage">Offer Percentage</Label>
                                                        <select
                                                            name="offerPercentage"
                                                            value={product.offerPercentage}
                                                            onChange={handleInputChange}
                                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                            required
                                                        >
                                                            {['0', '5', '9', '13', '20', '24', '29', '33', '37', '41', '45', '50', '52', '55', '59', '60', '63', '65', '67', '69', '70', '75', '79', '80', '85', '90'].map((percentage) => (
                                                                <option key={percentage} value={percentage}>{percentage}%</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                        
                                        <TabsContent value="sizes" className="space-y-6">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Sizes & Colors</CardTitle>
                                                    <CardDescription>Manage the sizes and colors available for this pot</CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-6">
                                                    {/* Sizes */}
                                                    <div className="space-y-4">
                                                        <Label>Sizes</Label>
                                                        <RadioGroup value={selectedOption} className="flex gap-4">
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="diameter" id="diameter" disabled />
                                                                <Label htmlFor="diameter">Choose Diameter</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="sizes" id="sizes" disabled />
                                                                <Label htmlFor="sizes">Choose Sizes</Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem value="length" id="length" disabled />
                                                                <Label htmlFor="length">Choose Length</Label>
                                                            </div>
                                                        </RadioGroup>
                                                        
                                                        {selectedOption && (
                                                            <div className="space-y-4">
                                                                {selectedSizes.map((size, index) => (
                                                                    <div key={index} className="flex items-center gap-3">
                                                                        <Input
                                                                            placeholder="Name"
                                                                            name={`sizes[${index}].name`}
                                                                            onChange={(e) => handleSizeChange(index, 'name', e.target.value)}
                                                                            value={size.name}
                                                                            className="flex-1"
                                                                        />
                                                                        <Input
                                                                            placeholder="Price"
                                                                            name={`sizes[${index}].price`}
                                                                            onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                                                                            value={size.price}
                                                                            className="flex-1"
                                                                        />
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => {
                                                                                const updatedSizes = [...selectedSizes];
                                                                                updatedSizes.splice(index, 1);
                                                                                setSelectedSizes(updatedSizes);
                                                                            }}
                                                                            className="h-10 w-10"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                                {selectedSizes.length < 7 && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        onClick={() => setSelectedSizes([...selectedSizes, { name: '', price: '' }])}
                                                                    >
                                                                        <Plus className="h-4 w-4 mr-2" />
                                                                        Add Size
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Separator />

                                                    {/* Colors */}
                                                    <div className="space-y-4">
                                                        <Label>Colors</Label>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                            {colors.map((color) => {
                                                                const isSelected = selectedColors.find((s) => s.name === color);
                                                                return (
                                                                    <div key={color} className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id={color}
                                                                            checked={!!isSelected}
                                                                            onCheckedChange={() => handleSizeCheckboxChange(color)}
                                                                        />
                                                                        <Label htmlFor={color} className="text-sm">{color}</Label>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                        
                                        <TabsContent value="images" className="space-y-6">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Images</CardTitle>
                                                    <CardDescription>Manage the images for this pot</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                        {/* Image 1 */}
                                                        <div className="space-y-2">
                                                            <div className="relative aspect-square rounded-md overflow-hidden border w-32 h-32 mx-auto">
                                                                {image1File ? (
                                                                    <img
                                                                        src={URL.createObjectURL(image1File)}
                                                                        alt="Image1"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : product.images.image1 ? (
                                                                    <img
                                                                        src={product.images.image1}
                                                                        alt="Image1"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <Label
                                                                    htmlFor="image1"
                                                                    className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 py-1 text-xs"
                                                                >
                                                                    {image1File || product.images.image1 ? 'Change' : 'Upload'}
                                                                    <input
                                                                        type="file"
                                                                        id="image1"
                                                                        name="image1"
                                                                        accept="image/*"
                                                                        onChange={(e) => setImage1File(e.target.files?.[0] || null)}
                                                                        className="hidden"
                                                                    />
                                                                </Label>
                                                                <Input
                                                                    id="imageName1"
                                                                    name="imageName1"
                                                                    placeholder="Color"
                                                                    value={product.images.imageName1}
                                                                    onChange={(e) => setProduct({
                                                                        ...product,
                                                                        images: {
                                                                            ...product.images,
                                                                            imageName1: e.target.value,
                                                                        },
                                                                    })}
                                                                    className="h-8 text-xs"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Image 2 */}
                                                        <div className="space-y-2">
                                                            <div className="relative aspect-square rounded-md overflow-hidden border w-32 h-32 mx-auto">
                                                                {image2File ? (
                                                                    <img
                                                                        src={URL.createObjectURL(image2File)}
                                                                        alt="Image2"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : product.images.image2 ? (
                                                                    <img
                                                                        src={product.images.image2}
                                                                        alt="Image2"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <Label
                                                                    htmlFor="image2"
                                                                    className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 py-1 text-xs"
                                                                >
                                                                    {image2File || product.images.image2 ? 'Change' : 'Upload'}
                                                                    <input
                                                                        type="file"
                                                                        id="image2"
                                                                        name="image2"
                                                                        accept="image/*"
                                                                        onChange={(e) => setImage2File(e.target.files?.[0] || null)}
                                                                        className="hidden"
                                                                    />
                                                                </Label>
                                                                <Input
                                                                    id="imageName2"
                                                                    name="imageName2"
                                                                    placeholder="Color"
                                                                    value={product.images.imageName2}
                                                                    onChange={(e) => setProduct({
                                                                        ...product,
                                                                        images: {
                                                                            ...product.images,
                                                                            imageName2: e.target.value,
                                                                        },
                                                                    })}
                                                                    className="h-8 text-xs"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Image 3 */}
                                                        <div className="space-y-2">
                                                            <div className="relative aspect-square rounded-md overflow-hidden border w-32 h-32 mx-auto">
                                                                {image3File ? (
                                                                    <img
                                                                        src={URL.createObjectURL(image3File)}
                                                                        alt="Image3"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : product.images.image3 ? (
                                                                    <img
                                                                        src={product.images.image3}
                                                                        alt="Image3"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <Label
                                                                    htmlFor="image3"
                                                                    className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 py-1 text-xs"
                                                                >
                                                                    {image3File || product.images.image3 ? 'Change' : 'Upload'}
                                                                    <input
                                                                        type="file"
                                                                        id="image3"
                                                                        name="image3"
                                                                        accept="image/*"
                                                                        onChange={(e) => setImage3File(e.target.files?.[0] || null)}
                                                                        className="hidden"
                                                                    />
                                                                </Label>
                                                                <Input
                                                                    id="imageName3"
                                                                    name="imageName3"
                                                                    placeholder="Color"
                                                                    value={product.images.imageName3}
                                                                    onChange={(e) => setProduct({
                                                                        ...product,
                                                                        images: {
                                                                            ...product.images,
                                                                            imageName3: e.target.value,
                                                                        },
                                                                    })}
                                                                    className="h-8 text-xs"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Image 4 */}
                                                        <div className="space-y-2">
                                                            <div className="relative aspect-square rounded-md overflow-hidden border w-32 h-32 mx-auto">
                                                                {image4File ? (
                                                                    <img
                                                                        src={URL.createObjectURL(image4File)}
                                                                        alt="Image4"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : product.images.image4 ? (
                                                                    <img
                                                                        src={product.images.image4}
                                                                        alt="Image4"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <Label
                                                                    htmlFor="image4"
                                                                    className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 py-1 text-xs"
                                                                >
                                                                    {image4File || product.images.image4 ? 'Change' : 'Upload'}
                                                                    <input
                                                                        type="file"
                                                                        id="image4"
                                                                        name="image4"
                                                                        accept="image/*"
                                                                        onChange={(e) => setImage4File(e.target.files?.[0] || null)}
                                                                        className="hidden"
                                                                    />
                                                                </Label>
                                                                <Input
                                                                    id="imageName4"
                                                                    name="imageName4"
                                                                    placeholder="Color"
                                                                    value={product.images.imageName4}
                                                                    onChange={(e) => setProduct({
                                                                        ...product,
                                                                        images: {
                                                                            ...product.images,
                                                                            imageName4: e.target.value,
                                                                        },
                                                                    })}
                                                                    className="h-8 text-xs"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Image 5 */}
                                                        <div className="space-y-2">
                                                            <div className="relative aspect-square rounded-md overflow-hidden border w-32 h-32 mx-auto">
                                                                {image5File ? (
                                                                    <img
                                                                        src={URL.createObjectURL(image5File)}
                                                                        alt="Image5"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : product.images.image5 ? (
                                                                    <img
                                                                        src={product.images.image5}
                                                                        alt="Image5"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <Label
                                                                    htmlFor="image5"
                                                                    className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 py-1 text-xs"
                                                                >
                                                                    {image5File || product.images.image5 ? 'Change' : 'Upload'}
                                                                    <input
                                                                        type="file"
                                                                        id="image5"
                                                                        name="image5"
                                                                        accept="image/*"
                                                                        onChange={(e) => setImage5File(e.target.files?.[0] || null)}
                                                                        className="hidden"
                                                                    />
                                                                </Label>
                                                                <Input
                                                                    id="imageName5"
                                                                    name="imageName5"
                                                                    placeholder="Color"
                                                                    value={product.images.imageName5}
                                                                    onChange={(e) => setProduct({
                                                                        ...product,
                                                                        images: {
                                                                            ...product.images,
                                                                            imageName5: e.target.value,
                                                                        },
                                                                    })}
                                                                    className="h-8 text-xs"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Image 6 */}
                                                        <div className="space-y-2">
                                                            <div className="relative aspect-square rounded-md overflow-hidden border w-32 h-32 mx-auto">
                                                                {image6File ? (
                                                                    <img
                                                                        src={URL.createObjectURL(image6File)}
                                                                        alt="Image6"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : product.images.image6 ? (
                                                                    <img
                                                                        src={product.images.image6}
                                                                        alt="Image6"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <Label
                                                                    htmlFor="image6"
                                                                    className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 py-1 text-xs"
                                                                >
                                                                    {image6File || product.images.image6 ? 'Change' : 'Upload'}
                                                                    <input
                                                                        type="file"
                                                                        id="image6"
                                                                        name="image6"
                                                                        accept="image/*"
                                                                        onChange={(e) => setImage6File(e.target.files?.[0] || null)}
                                                                        className="hidden"
                                                                    />
                                                                </Label>
                                                                <Input
                                                                    id="imageName6"
                                                                    name="imageName6"
                                                                    placeholder="Color"
                                                                    value={product.images.imageName6}
                                                                    onChange={(e) => setProduct({
                                                                        ...product,
                                                                        images: {
                                                                            ...product.images,
                                                                            imageName6: e.target.value,
                                                                        },
                                                                    })}
                                                                    className="h-8 text-xs"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Image 7 */}
                                                        <div className="space-y-2">
                                                            <div className="relative aspect-square rounded-md overflow-hidden border w-32 h-32 mx-auto">
                                                                {image7File ? (
                                                                    <img
                                                                        src={URL.createObjectURL(image7File)}
                                                                        alt="Image7"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : product.images.image7 ? (
                                                                    <img
                                                                        src={product.images.image7}
                                                                        alt="Image7"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <Label
                                                                    htmlFor="image7"
                                                                    className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 py-1 text-xs"
                                                                >
                                                                    {image7File || product.images.image7 ? 'Change' : 'Upload'}
                                                                    <input
                                                                        type="file"
                                                                        id="image7"
                                                                        name="image7"
                                                                        accept="image/*"
                                                                        onChange={(e) => setImage7File(e.target.files?.[0] || null)}
                                                                        className="hidden"
                                                                    />
                                                                </Label>
                                                                <Input
                                                                    id="imageName7"
                                                                    name="imageName7"
                                                                    placeholder="Color"
                                                                    value={product.images.imageName7}
                                                                    onChange={(e) => setProduct({
                                                                        ...product,
                                                                        images: {
                                                                            ...product.images,
                                                                            imageName7: e.target.value,
                                                                        },
                                                                    })}
                                                                    className="h-8 text-xs"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                    </Tabs>

                                    <div className="flex items-center justify-between mt-6">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive">
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete Pot
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete {product.name}. This action cannot be undone.
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
                                        
                                        <Button type="submit" className="ml-auto">
                                            Save Changes
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

export default withAuth(EditPot);