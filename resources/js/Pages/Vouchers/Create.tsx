import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
    Plus, 
    Trash2, 
    ArrowLeft,
    Save,
    Search,
    X,
    ChevronDown
} from 'lucide-react'
declare const route: any

interface LineItem {
    id: string
    product_id: string
    shape: string
    pcs: number
    weight: number
    code: string
    remarks: string
    temporary_return: boolean
}

interface Shape {
    id: number
    name: string
    product_id: number | null
}

interface CreateVoucherProps {
    users: Array<{
        id: number
        name: string
    }>
    shapes: Shape[]
    products: Array<{
        id: number
        name: string
    }>
}

export default function Create({ users, shapes, products }: CreateVoucherProps) {
    const [shapeSearchTerms, setShapeSearchTerms] = useState<Record<string, string>>({});
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
    const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const { data, setData, post, processing, errors } = useForm({
        stock_no: '',
        date_given: new Date().toISOString().split('T')[0],
        date_delivery: '',
        person_in_charge: '',
        notes: '',
        items: [
            {
                id: '1',
                product_id: '',
                shape: '',
                pcs: 0,
                weight: 0,
                code: '',
                remarks: '',
                temporary_return: false,
            }
        ] as LineItem[]
    });

    const addLineItem = () => {
        const newItem: LineItem = {
            id: Date.now().toString(),
            product_id: '',
            shape: '',
            pcs: 0,
            weight: 0,
            code: '',
            remarks: '',
            temporary_return: false,
        };
        setData('items', [...data.items, newItem]);
    };

    const removeLineItem = (id: string) => {
        if (data.items.length > 1) {
            setData('items', data.items.filter(item => item.id !== id));
        }
    };

    const updateLineItem = (id: string, field: keyof LineItem, value: string | number | boolean) => {
        const updatedItems = data.items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                // Clear shape when product changes
                if (field === 'product_id') {
                    updated.shape = '';
                    setShapeSearchTerms(prev => ({ ...prev, [id]: '' }));
                }
                return updated;
            }
            return item;
        });
        setData('items', updatedItems);
    };

    // Get filtered shapes for a specific item based on selected product
    const getFilteredShapes = (itemId: string) => {
        const item = data.items.find(i => i.id === itemId);
        if (!item || !item.product_id || item.product_id === '') {
            return [];
        }

        const selectedProductId = typeof item.product_id === 'string' 
            ? parseInt(item.product_id, 10) 
            : item.product_id;
        
        if (isNaN(selectedProductId)) {
            return [];
        }

        const searchTerm = (shapeSearchTerms[itemId] || '').toLowerCase();
        return shapes.filter(shape => {
            const matchesProduct = shape.product_id === selectedProductId;
            const matchesSearch = shape.name.toLowerCase().includes(searchTerm);
            return matchesProduct && matchesSearch;
        });
    };

    const setShapeSearchTerm = (itemId: string, term: string) => {
        setShapeSearchTerms(prev => ({ ...prev, [itemId]: term }));
    };

    const toggleDropdown = (itemId: string) => {
        setOpenDropdowns(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    const closeDropdown = (itemId: string) => {
        setOpenDropdowns(prev => ({ ...prev, [itemId]: false }));
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            Object.keys(openDropdowns).forEach(itemId => {
                if (openDropdowns[itemId] && dropdownRefs.current[itemId] && !dropdownRefs.current[itemId]?.contains(event.target as Node)) {
                    closeDropdown(itemId);
                }
            });
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDropdowns]);

    const handleShapeSelect = (itemId: string, shapeName: string) => {
        updateLineItem(itemId, 'shape', shapeName);
        closeDropdown(itemId);
        setShapeSearchTerm(itemId, '');
    };

    const calculateTotals = () => {
        const totalPcs = data.items.reduce((sum, item) => sum + (item.pcs || 0), 0);
        const totalWeight = data.items.reduce((sum, item) => sum + (item.weight || 0), 0);
        return { totalPcs, totalWeight };
    };

    const { totalPcs, totalWeight } = calculateTotals();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('vouchers.store'));
    };

    return (
        <AppLayout title="Create Voucher">
            <Head title="Create Voucher" />
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href={route('vouchers.index')}>
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Vouchers
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Create New Voucher</h1>
                        <p className="text-gray-600">Create a new workshop voucher for stone processing</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Header Information */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Voucher Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="stock_no">Stock No</Label>
                                <Input
                                    id="stock_no"
                                    value={data.stock_no}
                                    onChange={(e) => setData('stock_no', e.target.value)}
                                    placeholder="STK-001"
                                    className={errors.stock_no ? 'border-red-500' : ''}
                                />
                                {errors.stock_no && <p className="text-red-500 text-sm mt-1">{errors.stock_no}</p>}
                            </div>
                            <div>
                                <Label htmlFor="date_given">Date Given</Label>
                                <Input
                                    id="date_given"
                                    type="date"
                                    value={data.date_given}
                                    onChange={(e) => setData('date_given', e.target.value)}
                                    className={errors.date_given ? 'border-red-500' : ''}
                                />
                                {errors.date_given && <p className="text-red-500 text-sm mt-1">{errors.date_given}</p>}
                            </div>
                            <div>
                                <Label htmlFor="date_delivery">Date Delivery</Label>
                                <Input
                                    id="date_delivery"
                                    type="date"
                                    value={data.date_delivery}
                                    onChange={(e) => setData('date_delivery', e.target.value)}
                                    className={errors.date_delivery ? 'border-red-500' : ''}
                                />
                                {errors.date_delivery && <p className="text-red-500 text-sm mt-1">{errors.date_delivery}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <Label htmlFor="person_in_charge">Person in Charge</Label>
                                <select
                                    id="person_in_charge"
                                    value={data.person_in_charge}
                                    onChange={(e) => setData('person_in_charge', e.target.value)}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                                        errors.person_in_charge ? 'border-red-500' : ''
                                    }`}
                                >
                                    <option value="">Select person</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                                {errors.person_in_charge && <p className="text-red-500 text-sm mt-1">{errors.person_in_charge}</p>}
                            </div>
                        </div>
                        <div className="mt-4">
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                rows={3}
                            />
                        </div>
                    </Card>

                    {/* Line Items */}
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
                            <Button
                                type="button"
                                onClick={addLineItem}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Row
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {data.items.map((item, index) => (
                                <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                                        {data.items.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeLineItem(item.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                                        <div>
                                            <Label>Product</Label>
                                            <select
                                                value={item.product_id}
                                                onChange={(e) => updateLineItem(item.id, 'product_id', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                            >
                                                <option value="">Select product</option>
                                                {products.map((product) => (
                                                    <option key={product.id} value={product.id}>{product.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <Label>Shape</Label>
                                            <div 
                                                ref={(el) => { dropdownRefs.current[item.id] = el; }}
                                                className="relative"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => item.product_id && toggleDropdown(item.id)}
                                                    disabled={!item.product_id}
                                                    className={`w-full px-3 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent flex items-center justify-between ${
                                                        !item.product_id 
                                                            ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                                                            : 'bg-white hover:border-gray-400'
                                                    }`}
                                                >
                                                    <span className={item.shape ? 'text-gray-900' : 'text-gray-500'}>
                                                        {item.shape || (item.product_id ? 'Select shape' : 'Select product first')}
                                                    </span>
                                                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${openDropdowns[item.id] ? 'transform rotate-180' : ''}`} />
                                                </button>
                                                
                                                {openDropdowns[item.id] && item.product_id && (
                                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                                                        {/* Search Input */}
                                                        <div className="p-2 border-b border-gray-200">
                                                            <div className="relative">
                                                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                <Input
                                                                    type="text"
                                                                    placeholder="Search shapes..."
                                                                    value={shapeSearchTerms[item.id] || ''}
                                                                    onChange={(e) => setShapeSearchTerm(item.id, e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="pl-8 pr-8 text-sm"
                                                                    autoFocus
                                                                />
                                                                {shapeSearchTerms[item.id] && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setShapeSearchTerm(item.id, '');
                                                                        }}
                                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Options List */}
                                                        <div className="max-h-48 overflow-y-auto">
                                                            {getFilteredShapes(item.id).length === 0 ? (
                                                                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                                                    {shapeSearchTerms[item.id] ? 'No shapes found' : 'No shapes available'}
                                                                </div>
                                                            ) : (
                                                                getFilteredShapes(item.id).map((shape) => {
                                                                    if (!shape || typeof shape !== 'object' || !shape.name) {
                                                                        return null;
                                                                    }
                                                                    const isSelected = item.shape === shape.name;
                                                                    return (
                                                                        <button
                                                                            key={shape.id || shape.name}
                                                                            type="button"
                                                                            onClick={() => handleShapeSelect(item.id, String(shape.name))}
                                                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none ${
                                                                                isSelected ? 'bg-emerald-100 text-emerald-900 font-medium' : 'text-gray-900'
                                                                            }`}
                                                                        >
                                                                            {String(shape.name)}
                                                                        </button>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <Label>Pieces</Label>
                                            <Input
                                                type="number"
                                                value={item.pcs}
                                                onChange={(e) => updateLineItem(item.id, 'pcs', parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                        
                                        <div>
                                            <Label>Weight (ct)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={item.weight}
                                                onChange={(e) => updateLineItem(item.id, 'weight', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                                min="0"
                                            />
                                        </div>
                                        
                                        <div>
                                            <Label>Code</Label>
                                            <Input
                                                value={item.code}
                                                onChange={(e) => updateLineItem(item.id, 'code', e.target.value)}
                                                placeholder="Code"
                                            />
                                        </div>
                                        
                                        <div>
                                            <Label>Remarks</Label>
                                            <Input
                                                value={item.remarks}
                                                onChange={(e) => updateLineItem(item.id, 'remarks', e.target.value)}
                                                placeholder="Remarks"
                                            />
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={item.temporary_return || false}
                                                onChange={(e) => updateLineItem(item.id, 'temporary_return', e.target.checked)}
                                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                                            />
                                            <Label className="text-sm font-medium text-gray-700 cursor-pointer" htmlFor={`temp-return-${item.id}`}>
                                                Temporary Return
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {errors.items && <p className="text-red-500 text-sm mt-2">{errors.items}</p>}
                    </Card>

                    {/* Totals */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Totals</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Total Pieces</p>
                                <p className="text-xl font-semibold text-gray-900">{totalPcs}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Total Weight</p>
                                <p className="text-xl font-semibold text-gray-900">{totalWeight.toFixed(2)} ct</p>
                            </div>
                        </div>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-4">
                        <Link href={route('vouchers.index')}>
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
                            {processing ? 'Creating...' : 'Create Voucher'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
