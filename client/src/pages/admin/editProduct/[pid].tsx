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
    code:string;
    description: string;
    plantCare: string[];
    quantity:number;
    photo:{
        image1:string;
        image2:string;
        image3:string;
    }
    offerPercentage: number;
    category: {
        _id: string;
        name: string;
    };
    sizes: {
        name: string;
        price: any;
      }[];
}


const EditProduct = () => {
    const router = useRouter();
    const { pid } = router.query;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [loading, setLoading] = useState(true);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [plantCare, setPlantCare] = useState<string[]>([]);
    const [unit, setUnit] = useState('cm');
    const [image1File, setImage1File] = useState<File | null>(null);
    const [image2File, setImage2File] = useState<File | null>(null);
    const [image3File, setImage3File] = useState<File | null>(null);
    const [product, setProduct] = useState<Product>({
        _id: '',
        name: '',
        code:'',
        description: '',
        plantCare: [],
        photo:{
            image1:'',
            image2:'',
            image3:'',
        },
        quantity: 0,
        offerPercentage: 0,
        category: {
            _id: '',
            name: '',
        },
        sizes: [],
    });
    const [selectedSizes, setSelectedSizes] = useState<Product['sizes']>([]);


    const getSingleProduct = async () => {
        try {
            const { data } = await axios.get(`${apiUrl}/api/product/get-product/${pid}`);
            const Sizes = data.product.sizes.map((size:any) => ({
                name: size.name,
                price: parseFloat(size.price),
              }));
            setProduct(data.product);
            setSelectedSizes(Sizes);
            setPlantCare(data.product.plantCare)
            console.log(data.product.sizes)
            setLoading(false);
        } catch (error) {
            window.location.reload();
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
            formData.append('plantCare', JSON.stringify(plantCare));
            formData.append('sizes', JSON.stringify(sortedSizes));
            formData.append('quantity', product.quantity.toString());
            formData.append('offerPercentage', product.offerPercentage.toString());
            if (image1File) {
                formData.append('image1', image1File);
            }
            if (image2File) {
                formData.append('image2', image2File);
            }
            if (image3File) {
                formData.append('image3', image3File);
            }
            

            const response = await axios.put(
                `${apiUrl}/api/product/update-product/${pid}`,
                formData
            );

            if (response.status === 201) {
                toast.success(`Product is updated`);
                setLoading(false);
                router.push(`/admin/allProducts`);
            } else {
                setLoading(false);
                toast.error('Error updating product');
            }
        } catch (error) {
            setLoading(false);
            toast.error('Error updating product');
        }
    };
    const handleAddPlantCare = () => {
        if (plantCare.length < 5) {
            setPlantCare([...plantCare, '']);
        }
    };

    const handleRemovePlantCare = (index: number) => {
        const updatedPlantCare = [...plantCare];
        updatedPlantCare.splice(index, 1);
        setPlantCare(updatedPlantCare);
    };

    const handlePlantCareChange = (index: number, value: string) => {
        const updatedPlantCare = [...plantCare];
        updatedPlantCare[index] = value;
        setPlantCare(updatedPlantCare);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProduct({
            ...product,
            [name]: value,
        });
    };

    const handleSizeCheckboxChange = (size:any) => {
        const isSelected = selectedSizes.find((s) => s.name === size);
        if (isSelected) {
          // Remove size if already selected
          const updatedSelectedSizes = selectedSizes.filter((s) => s.name !== size);
          setSelectedSizes(updatedSelectedSizes);
        } else {
          // Add size if not already selected
          const updatedSelectedSizes = [...selectedSizes, { name: size, price: '' }];
          setSelectedSizes(updatedSelectedSizes);
        }
      };
      const handlePriceInputChange = (size:any, value:any) => {
        const updatedSelectedSizes = selectedSizes.map((s) => {
          if (s.name === size) {
            return { ...s, price: parseFloat(value) };
          }
          return s;
        });
        setSelectedSizes(updatedSelectedSizes);
      };
      

    const handleDelete = async () => {
        try {
            setLoading(true)
            const response = await axios.delete(`${apiUrl}/api/product/delete-product/${pid}`);
            if (response.status === 200) {
                setLoading(false)
                toast.success(`Product deleted successfully`);
                router.push(`/admin/allProducts`);
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
                            <label htmlFor="category" className="block text-gray-700 text-sm font-semibold mb-2">
                                Category
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={product.category?.name}
                                className="border border-gray-300 rounded-md p-2 w-full"
                                disabled
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
                            <label htmlFor="plantCare" className="block text-gray-700 text-sm font-semibold mb-2">
                                Plant Care (Up to 5 points)
                            </label>
                            <div>
                                {plantCare?.map((point, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <textarea
                                            name={`plantCare[${index}]`}
                                            value={point}
                                            onChange={(e) => handlePlantCareChange(index, e.target.value)}
                                            className="border border-gray-300 rounded-md p-2 w-full"
                                        />
                                        <button
                                            type="button"
                                            className="bg-red-500 text-white font-semibold ml-2 p-2 rounded-md"
                                            onClick={() => handleRemovePlantCare(index)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {plantCare?.length < 5 && (
                                <button
                                    type="button"
                                    className="bg-[#5f9231] hover:bg-[#4b7427] text-white font-semibold p-2 rounded-md mt-2"
                                    onClick={handleAddPlantCare}
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
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                                {unit === 'cm' && ['5-10 cm', '10-20 cm', '20-30 cm', '30-40 cm', '40-50 cm', '50-60 cm', '60-70 cm', '70-80 cm', '80-90 cm', '90-100 cm', '100-120 cm', '120-140 cm', '140-160 cm', '160-180 cm', '180-200 cm', '200-220 cm', '220-240 cm', '240-260 cm', '260-280 cm', '280-300 cm'].map((size) => {
                                   const isSelected = selectedSizes.find((s) => s.name === size);

                                   return (
                                     <div key={size} className="flex items-center">
                                       <label className="flex items-center">
                                         <input
                                           type="checkbox"
                                           name={size}
                                           checked={!!isSelected}
                                           onChange={() => handleSizeCheckboxChange(size)}
                                           className="mr-2"
                                         />
                                         <span className="text-gray-700">{size}</span>
                                       </label>
                                       {isSelected && (
                                         <input
                                           type="number"
                                           placeholder="Price"
                                           value={isSelected.price}
                                           onChange={(e) => handlePriceInputChange(size, e.target.value)}
                                           className="ml-2 border border-gray-300 rounded-md p-1"
                                         />
                                       )}
                                     </div>
                                )})}
                                {unit === 'L' && ['50 ml','100 ml','150 ml','200 ml','250 ml','300 ml','350 ml','400 ml','450 ml','500 ml','750 ml','1 L','1.5 L','2 L','3 L','4 L','5 L','6 L','7 L','8 L','9 L','10 L','15 L','20 L','25 L','30 L','35 L','40 L','45 L','50 L'].map((size) => {
                                    const isSelected = selectedSizes.find((s) => s.name === size);

                                    return (
                                      <div key={size} className="flex items-center">
                                        <label className="flex items-center">
                                          <input
                                            type="checkbox"
                                            name={size}
                                            checked={!!isSelected}
                                            onChange={() => handleSizeCheckboxChange(size)}
                                            className="mr-2"
                                          />
                                          <span className="text-gray-700">{size}</span>
                                        </label>
                                        {isSelected && (
                                          <input
                                            type="number"
                                            placeholder="Price"
                                            value={isSelected.price}
                                            onChange={(e) => handlePriceInputChange(size, e.target.value)}
                                            className="ml-2 border border-gray-300 rounded-md p-1"
                                          />
                                        )}
                                      </div>
                                 )})}
                                {unit === 'kg' && ['10 g', '20 g', '30 g','40 g','50 g','100 g','150 g','200 g','250 g','300 g','350 g','400 g','450 g','500 g','1 kg','2 kg','3 kg','4 kg','5 kg','6 kg','7 kg','8 kg','9 kg','10 kg','15 kg','20 kg','25 kg','30 kg','35 kg','40 kg','45 kg','50 kg'].map((size) => {
                                    const isSelected = selectedSizes.find((s) => s.name === size);

                                    return (
                                      <div key={size} className="flex items-center">
                                        <label className="flex items-center">
                                          <input
                                            type="checkbox"
                                            name={size}
                                            checked={!!isSelected}
                                            onChange={() => handleSizeCheckboxChange(size)}
                                            className="mr-2"
                                          />
                                          <span className="text-gray-700">{size}</span>
                                        </label>
                                        {isSelected && (
                                          <input
                                            type="number"
                                            placeholder="Price"
                                            value={isSelected.price}
                                            onChange={(e) => handlePriceInputChange(size, e.target.value)}
                                            className="ml-2 border border-gray-300 rounded-md p-1"
                                          />
                                        )}
                                      </div>
                                 )})}
                                {unit === 'count' && ['set 1','set 2','set 3','set 4','set 5','set 6','set 7','set 8','set 9','set 10','set 12','set 14','set 15','set 18','set 20','set 25','set 30','bulk'].map((size) => {
                                    const isSelected = selectedSizes.find((s) => s.name === size);

                                    return (
                                      <div key={size} className="flex items-center">
                                        <label className="flex items-center">
                                          <input
                                            type="checkbox"
                                            name={size}
                                            checked={!!isSelected}
                                            onChange={() => handleSizeCheckboxChange(size)}
                                            className="mr-2"
                                          />
                                          <span className="text-gray-700">{size}</span>
                                        </label>
                                        {isSelected && (
                                          <input
                                            type="number"
                                            placeholder="Price"
                                            value={isSelected.price}
                                            onChange={(e) => handlePriceInputChange(size, e.target.value)}
                                            className="ml-2 border border-gray-300 rounded-md p-1"
                                          />
                                        )}
                                      </div>
                                 )})}
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
                                <div className="mb-4">
                                    {image1File ? (<img
                                        src={URL.createObjectURL(image1File)}
                                        alt="Image1"
                                        className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                    />) : (
                                        <img
                                            src={product.photo.image1}
                                            alt="Image1"
                                            className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                        />
                                    )}
                                    <label className="cursor-pointer border border-gray-300 rounded-md p-2 mt-2">
                                        Change Image
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
                                <div className="mb-4">
                                    {image2File ? (<img
                                        src={URL.createObjectURL(image2File)}
                                        alt="Image2"
                                        className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                    />) : (
                                        <img
                                            src={product.photo.image2}
                                            alt="Image2"
                                            className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                        />
                                    )}
                                    <label className="cursor-pointer border border-gray-300 rounded-md p-2 mt-2">
                                        Change Image
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
                                <div className="mb-4">
                                    {image3File ? (<img
                                        src={URL.createObjectURL(image3File)}
                                        alt="Image3"
                                        className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                    />) : (
                                        <img
                                            src={product.photo.image3}
                                            alt="Image3"
                                            className="max-w-full h-48 rounded-md shadow-md mx-auto mb-5"
                                        />
                                    )}
                                    <label className="cursor-pointer border border-gray-300 rounded-md p-2 mt-2">
                                        Change Image
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
                            </div>
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

export default withAuth(EditProduct);