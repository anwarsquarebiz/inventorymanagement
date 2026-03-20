import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
declare const route: any;

interface LineItem {
    id: string;
    metal_id: string;
    weight: number | string;
    remarks: string;
}

interface EditProps {
    metalVoucher: {
        id: number;
        date_given: string;
        notes?: string | null;
        items: Array<{
            id: number;
            metal_id: number;
            weight: number | string;
            remarks?: string | null;
        }>;
    };
    metals: Array<{ id: number; name: string }>;
}

export default function Edit({ metalVoucher, metals }: EditProps) {
    const initialItems: LineItem[] = metalVoucher.items.map((it) => ({
        id: String(it.id),
        metal_id: String(it.metal_id),
        weight: it.weight ?? 0,
        remarks: it.remarks ?? '',
    }));

    const { data, setData, put, processing, errors } = useForm({
        date_given: metalVoucher.date_given?.substring(0, 10) || '',
        notes: metalVoucher.notes || '',
        items: initialItems,
    });

    const addLineItem = () => {
        setData('items', [
            ...data.items,
            {
                id: Date.now().toString(),
                metal_id: '',
                weight: 0,
                remarks: '',
            },
        ]);
    };

    const removeLineItem = (id: string) => {
        if (data.items.length > 1) {
            setData('items', data.items.filter((item) => item.id !== id));
        }
    };

    const updateLineItem = (id: string, field: keyof LineItem, value: string | number | boolean) => {
        setData(
            'items',
            data.items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );
    };

    const totalWeight = data.items.reduce((s, i) => s + (parseFloat(String(i.weight)) || 0), 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('metal-vouchers.update', metalVoucher.id));
    };

    return (
        <AppLayout title="Edit Metal Voucher">
            <Head title="Edit Metal Voucher" />
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href={route('metal-vouchers.index')}>
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Metal Vouchers
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Edit Metal Voucher</h1>
                        <p className="text-gray-600">Update metal voucher and line items</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Metal Voucher Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </div>
                        <div className="mt-4">
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                rows={3}
                            />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
                            <Button type="button" onClick={addLineItem} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Plus className="h-4 w-4 mr-2" /> Add Row
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {data.items.map((item, index) => (
                                <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                                        {data.items.length > 1 && (
                                            <Button type="button" variant="outline" size="sm" className="text-red-600 hover:text-red-800" onClick={() => removeLineItem(item.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        <div>
                                            <Label>Metal</Label>
                                            <select
                                                value={item.metal_id}
                                                onChange={(e) => updateLineItem(item.id, 'metal_id', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                            >
                                                <option value="">Select metal</option>
                                                {metals.map((m) => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <Label>Weight</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={item.weight}
                                                onChange={(e) => updateLineItem(item.id, 'weight', e.target.value ? parseFloat(e.target.value) : 0)}
                                                placeholder="0.00"
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <Label>Remarks</Label>
                                            <Input value={item.remarks} onChange={(e) => updateLineItem(item.id, 'remarks', e.target.value)} placeholder="Remarks" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {errors.items && <p className="text-red-500 text-sm mt-2">{errors.items}</p>}
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Total</h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Total Weight</p>
                            <p className="text-xl font-semibold text-gray-900">{Number(totalWeight).toFixed(2)}</p>
                        </div>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Link href={route('metal-vouchers.show', metalVoucher.id)}>
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
