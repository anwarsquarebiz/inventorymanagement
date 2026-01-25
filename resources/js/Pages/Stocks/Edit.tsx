import React from 'react'
import { Head, Link, useForm, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Save, Upload } from 'lucide-react'
declare const route: any

interface Stock {
    stock_no: string
    thumbnail?: string | null
    metal?: string | null
    products_used?: string | null
    product_categorization?: string | null
}

interface ProductCategorization {
    id: number
    name: string
}

interface StockEditProps {
    stock: Stock
    productCategorizations: ProductCategorization[]
}

export default function Edit({ stock, productCategorizations }: StockEditProps) {
    // Ensure stock_no is always available
    const stockNo = stock?.stock_no || '';
    
    // Parse products_used from string to array if it exists
    const parseProductsUsed = (value: string | null | undefined): string[] => {
        if (!value) return [];
        // If it's already an array, return it
        if (Array.isArray(value)) return value;
        // If it's a string, split by comma
        return value.split(',').map(v => v.trim()).filter(v => v !== '');
    };

    const [isDragging, setIsDragging] = React.useState(false);

    const { data, setData, put, processing, errors } = useForm({
        metal: stock?.metal || '',
        products_used: parseProductsUsed(stock?.products_used) as string[],
        product_categorization: stock?.product_categorization || '',
        thumbnail: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!stockNo) return;
        
        // Create FormData manually to ensure all fields are included
        const formData = new FormData();
        formData.append('metal', data.metal || '');
        // Convert array to comma-separated string
        const productsUsedValue = Array.isArray(data.products_used) 
            ? data.products_used.join(',') 
            : (data.products_used || '');
        formData.append('products_used', productsUsedValue);
        formData.append('product_categorization', data.product_categorization || '');
        if (data.thumbnail) {
            formData.append('thumbnail', data.thumbnail);
        }
        formData.append('_method', 'PUT');
        
        // Use router directly to send FormData
        router.post(route('stocks.update', stockNo), formData, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Validate file type
            if (file.type.startsWith('image/')) {
                setData('thumbnail', file);
            }
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            // Validate file type
            if (file.type.startsWith('image/')) {
                setData('thumbnail', file);
            }
        }
    };

    const handleProductChange = (product: string, checked: boolean) => {
        const currentProducts = Array.isArray(data.products_used) ? data.products_used : [];
        if (checked) {
            setData('products_used', [...currentProducts, product]);
        } else {
            setData('products_used', currentProducts.filter(p => p !== product));
        }
    };

    const productOptions = [
        'Diamonds',
        'Emeralds Z',
        'Emeralds C',
        'Cultured Pearls',
        'Natural Pearls',
        'Rubies NB',
        'Rubies OB',
    ];

    if (!stockNo) {
        return (
            <AppLayout title="Error">
                <div className="p-6">
                    <p className="text-red-600">Stock number is required.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title={`Edit Stock ${stockNo}`}>
            <Head title={`Edit Stock ${stockNo}`} />
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href={route('vouchers-groups.show', stockNo)}>
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Stock
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Edit Stock: {stockNo}</h1>
                        <p className="text-gray-600">Update stock information, thumbnail, and metal type</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Information</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="metal">Metal Type</Label>
                                {/* Select for metal type */}
                                
                                <select
                                    id="metal"
                                    name="metal"
                                    value={data.metal}
                                    onChange={(e) => setData('metal', e.target.value)}
                                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.metal ? 'border-red-500' : ''}`}
                                >
                                    <option value="">Select metal type</option>
                                    <option value="White Gold (WG)">White Gold (WG)</option>
                                    <option value="Yellow Gold (YG)">Yellow Gold (YG)</option>
                                    <option value="Platinum">Platinum</option>
                                    <option value="9kt">9kt</option>
                                </select>
                                {errors.metal && <p className="text-red-500 text-sm mt-1">{errors.metal}</p>}
                            </div>

                            <div>
                                <Label>Products Used</Label>
                                <div className="mt-2 border rounded-lg p-4 bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {productOptions.map((product) => {
                                            const isChecked = Array.isArray(data.products_used) && data.products_used.includes(product);
                                            return (
                                                <div key={product} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`product-${product}`}
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) => 
                                                            handleProductChange(product, !!checked)
                                                        }
                                                    />
                                                    <Label 
                                                        htmlFor={`product-${product}`} 
                                                        className="text-sm font-normal cursor-pointer"
                                                    >
                                                        {product}
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                {errors.products_used && <p className="text-red-500 text-sm mt-1">{errors.products_used}</p>}
                            </div>

                            <div>
                                <Label htmlFor="product_categorization">Product Category</Label>
                                <select
                                    id="product_categorization"
                                    name="product_categorization"
                                    value={data.product_categorization}
                                    onChange={(e) => setData('product_categorization', e.target.value)}
                                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.product_categorization ? 'border-red-500' : ''}`}
                                >
                                    <option value="">Select product category</option>
                                    {productCategorizations.map((category) => (
                                        <option key={category.id} value={category.name}>
                                            {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {errors.product_categorization && <p className="text-red-500 text-sm mt-1">{errors.product_categorization}</p>}
                            </div>

                            <div>
                                <Label htmlFor="thumbnail">Thumbnail Image</Label>
                                <div className="mt-2">
                                    {stock?.thumbnail && (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600 mb-2">Current Thumbnail:</p>
                                            <img 
                                                src={`/storage/${stock.thumbnail}`} 
                                                alt={`Stock ${stockNo}`}
                                                className="max-w-md h-auto rounded-lg border border-gray-200 shadow-sm w-[150px]"
                                            />
                                        </div>
                                    )}
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                                            isDragging
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <Upload className={`h-8 w-8 ${isDragging ? 'text-emerald-600' : 'text-gray-400'}`} />
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-700">
                                                    {isDragging ? 'Drop image here' : 'Drag and drop an image here, or click to select'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Accepted formats: JPEG, PNG, JPG, GIF, WEBP (Max: 2MB)
                                                </p>
                                            </div>
                                            <label
                                                htmlFor="thumbnail"
                                                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-white bg-white transition-colors"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                {data.thumbnail ? 'Change Image' : 'Browse Files'}
                                            </label>
                                            <input
                                                id="thumbnail"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </div>
                                        {data.thumbnail && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <p className="text-sm text-gray-600 mb-1">Selected file:</p>
                                                <p className="text-sm font-medium text-gray-900">{data.thumbnail.name}</p>
                                                <p className="text-xs text-gray-500">{(data.thumbnail.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        )}
                                    </div>
                                    {errors.thumbnail && <p className="text-red-500 text-sm mt-1">{errors.thumbnail}</p>}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Link href={route('vouchers-groups.show', stockNo)}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}

