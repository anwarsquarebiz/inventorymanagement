import React, { useState, useEffect } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Edit as EditIcon, Download, Check, Pencil, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { usePage } from '@inertiajs/react';
declare const route: any



interface VoucherRow {
    id: number
    voucher_no: string
    date_given: string
    date_delivery: string
    status: string
    person_in_charge: number
    created_at: string
}

interface ItemRow {
    id: number
    voucher_id: number
    voucher_no: string
    date_given: string
    date_delivery: string
    status: string
    product_name?: string | null
    shape: string
    pcs: number
    weight: number
    pcs_used?: number | null
    pcs_returned?: number | null
    weight_used?: number | null
    weight_returned?: number | null
    code?: string | null
    remarks?: string | null
    temporary_return?: boolean
    reviewed?: boolean
}

interface Summary {
    stock_no: string
    vouchers_count: number
    total_pcs: number
    total_weight: number
}

interface MetalEntry {
    type: string
    grams: number | null
    currentRate: number | null
}

interface Props {
    stockNo: string
    stock?: {
        stock_no: string
        thumbnail?: string | null
        metal?: string | null
        products_used?: string | null
        product_categorization?: string | null
    } | null
    summary: Summary
    allCompleted: boolean
    vouchers: VoucherRow[]
    items: ItemRow[]
    backPage?: number | null
    backSearch?: string | null
    backCategory?: string | null
    backStockPrefix?: string | null
    backStatus?: string | null
}

export default function Show({ stockNo, stock, summary, vouchers, items, allCompleted, backPage, backSearch, backCategory, backStockPrefix, backStatus }: Props) {

    const [isEditingStockNo, setIsEditingStockNo] = useState(false)
    const [editStockNoValue, setEditStockNoValue] = useState(stockNo)

    const { props } = usePage() as any
    const stockNoError = (props?.errors as Record<string, string> | undefined)?.new_stock_no

    useEffect(() => {
        if (stockNoError) setIsEditingStockNo(true)
    }, [stockNoError])

    const handleStartEditStockNo = () => {
        setEditStockNoValue(stockNo)
        setIsEditingStockNo(true)
    }
    const handleCancelEditStockNo = () => {
        setEditStockNoValue(stockNo)
        setIsEditingStockNo(false)
    }
    const handleSubmitStockNo = () => {
        const trimmed = editStockNoValue.trim()
        if (!trimmed || trimmed === stockNo) {
            handleCancelEditStockNo()
            return
        }
        router.put(route('vouchers-groups.update-stock-no', stockNo), {
            new_stock_no: trimmed,
            page: backPage ?? undefined,
            search: backSearch ?? undefined,
            category: backCategory ?? undefined,
            stock_prefix: backStockPrefix ?? undefined,
            status: backStatus ?? undefined,
        })
        setIsEditingStockNo(false)
    }

    // Get permissions
    const user = props?.auth?.user;
    const permissions: string[] = user?.permissions || [];

    const hasPermission = (permission?: string): boolean => {
        if (!permission) return true; // No permission required
        return permissions.includes(permission);
    };

    // Parse metal JSON into a structured list including grams and current rate
    const parseMetalEntries = (metalString: string | null | undefined): MetalEntry[] => {
        if (!metalString) return [];

        try {
            const metalData = JSON.parse(metalString);
            if (typeof metalData === 'object' && metalData !== null) {
                return Object.entries(metalData as Record<string, any>).map(([metalType, value]) => {
                    // Backward compatibility: previously value was just a grams string
                    if (typeof value === 'string' || typeof value === 'number') {
                        const gramsNum = parseFloat(String(value));
                        return {
                            type: metalType,
                            grams: isNaN(gramsNum) ? null : gramsNum,
                            currentRate: null,
                        };
                    }

                    if (value && typeof value === 'object') {
                        const gramsRaw = (value as any).grams;
                        const rateRaw = (value as any).current_rate;

                        const gramsNum =
                            typeof gramsRaw === 'number'
                                ? gramsRaw
                                : typeof gramsRaw === 'string'
                                    ? parseFloat(gramsRaw)
                                    : NaN;
                        const rateNum =
                            typeof rateRaw === 'number'
                                ? rateRaw
                                : typeof rateRaw === 'string'
                                    ? parseFloat(rateRaw)
                                    : NaN;

                        return {
                            type: metalType,
                            grams: isNaN(gramsNum) ? null : gramsNum,
                            currentRate: isNaN(rateNum) ? null : rateNum,
                        };
                    }

                    return {
                        type: metalType,
                        grams: null,
                        currentRate: null,
                    };
                });
            }
        } catch (e) {
            // If not JSON, we cannot reliably extract structured data
            return [];
        }

        return [];
    };

    const metalEntries = parseMetalEntries(stock?.metal || null);
    const formattedMetal = metalEntries.length
        ? metalEntries
            .filter((entry) => entry.grams !== null)
            .map((entry) => `${entry.type} ${entry.grams!.toFixed(3)}g`)
            .join(', ')
        : '';
    const totalMetalWeight = metalEntries.reduce(
        (sum, entry) => sum + (entry.grams || 0),
        0
    );

    // Usestate to store editable mode
    const [editableMode, setEditableMode] = useState(false);
    const [currentEditableItem, setCurrentEditableItem] = useState<ItemRow | null>(null);

    const [editableItems, setEditableItems] = useState<ItemRow[]>(items);

    console.log('editableItems', editableItems)

    const handleUsageChange = (
        index: number,
        field: 'pcs_used' | 'pcs_returned' | 'weight_used' | 'weight_returned',
        value: string
    ) => {
        setEditableItems((prev) => {
            const next = [...prev];
            const numericValue =
                value === ''
                    ? null
                    : field.startsWith('weight')
                        ? parseFloat(value)
                        : parseInt(value, 10);

            next[index] = {
                ...next[index],
                [field]: isNaN(numericValue as number) ? null : numericValue,
            };

            return next;
        });
    };

    const handleEditUsage = (item: ItemRow) => {
        setCurrentEditableItem(item);
        setEditableMode(true);
    };

    const handleSaveUsage = (item: ItemRow) => {
        item.reviewed = true;
        // Check if the item.pcs_used and item.weight_used should not be in negative
        if (item.pcs_used && item.pcs_used < 0 || item.weight_used && item.weight_used < 0) {
            alert('Pcs Used and Weight Used should not be in negative');
            return;
        }
        router.post(route('voucher-items.update-usage', item.id), {
            pcs_used: item.pcs_used,
            pcs_returned: item.pcs_returned,
            weight_used: item.weight_used,
            weight_returned: item.weight_returned,
            reviewed: true,
        });
        setEditableMode(false);
        setCurrentEditableItem(null);
    };

    const handleCancelEdit = (item: ItemRow) => {
        setEditableMode(false);
        setCurrentEditableItem(null);
    };

    const getStatusBadge = (status: string) => {
        const statusMap = {
            pending_verification: { color: 'bg-yellow-100 hover:bg-yellow-100 text-yellow-800', label: 'Pending Verification' },
            in_transit: { color: 'bg-blue-100 hover:bg-blue-100 text-blue-800', label: 'In Transit' },
            under_review: { color: 'bg-emerald-100 hover:bg-emerald-100 text-emerald-800', label: 'Under Review' },
            in_use: { color: 'bg-purple-100 hover:bg-purple-100 text-purple-800', label: 'In Use' },
            rejected: { color: 'bg-red-100 hover:bg-red-100 text-red-800', label: 'Rejected' },
            completed: { color: 'bg-gray-100 hover:bg-gray-100 text-gray-800', label: 'Completed' },
        };

        const statusInfo = statusMap[status as keyof typeof statusMap];
        return (
            <Badge className={statusInfo?.color || 'bg-gray-100 text-gray-800'}>
                {statusInfo?.label || status.replace('_', ' ')}
            </Badge>
        );
    };

    return (
        <AppLayout title={`Stock ${stockNo}`}>
            <Head title={`Stock ${stockNo} - Vouchers`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Back to Groups with same page number and search term */}
                        <Link href={route('vouchers-groups.index', { ...(backPage ? { page: backPage } : {}), ...(backSearch != null && backSearch !== '' ? { search: backSearch } : {}), ...(backCategory != null && backCategory !== '' ? { category: backCategory } : {}), ...(backStockPrefix != null && backStockPrefix !== '' ? { stock_prefix: backStockPrefix } : {}), ...(backStatus != null && backStatus !== '' ? { status: backStatus } : {}) })}>
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Groups
                            </Button>
                        </Link>
                        <div>
                            {isEditingStockNo ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-semibold text-gray-900">Stock:</span>
                                    <input
                                        type="text"
                                        value={editStockNoValue}
                                        onChange={(e) => setEditStockNoValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSubmitStockNo()
                                            if (e.key === 'Escape') handleCancelEditStockNo()
                                        }}
                                        className="text-2xl font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        autoFocus
                                    />
                                    <Button variant="ghost" size="icon" className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50" onClick={handleSubmitStockNo} title="Save">
                                        <Check className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-800 hover:bg-gray-100" onClick={handleCancelEditStockNo} title="Cancel">
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-semibold text-gray-900">Stock: {stockNo}</h1>
                                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-800 hover:bg-gray-100" onClick={handleStartEditStockNo} title="Edit stock number">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            {stockNoError && <p className="text-sm text-red-600 mt-1">{stockNoError}</p>}
                            <p className="text-gray-600">Vouchers and items for this stock number</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="text-gray-600 hover:text-gray-800"
                            onClick={() => window.open(route('vouchers-groups.export-pdf', stockNo), '_blank')}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                        </Button>
                        <Link href={route('stocks.edit', stockNo)}>
                            <Button variant="outline">
                                <EditIcon className="h-4 w-4 mr-2" />
                                Edit Stock Info
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stock Information */}
                {(stock?.thumbnail || formattedMetal || stock?.products_used || stock?.product_categorization) && (
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {stock?.thumbnail && (
                                <div>
                                    <Label>Reference Image</Label>
                                    <div className="mt-2">
                                        <img
                                            src={`/storage/${stock.thumbnail}`}
                                            alt={`Stock ${stockNo}`}
                                            className="w-[150px] max-w-md h-auto rounded-lg border border-gray-200 shadow-sm"
                                        />
                                    </div>
                                </div>
                            )}
                            {/* {formattedMetal && (
                                <div>
                                    <Label>Metal</Label>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {formattedMetal.split(', ').map((metal, index) => (
                                            <Badge key={index} variant="outline" className="mr-1">
                                                {metal}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )} */}
                            {/* Show metal used with current rate and total weight */}
                            {stock?.product_categorization && (
                                <div>
                                    <Label>Product Category</Label>
                                    <p className="mt-2 text-gray-900 font-medium text-lg capitalize">
                                        {stock.product_categorization.charAt(0).toUpperCase() + stock.product_categorization.slice(1)}
                                    </p>
                                </div>
                            )}

                            {stock?.products_used && (
                                <div>
                                    <Label>Stones Used</Label>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {stock.products_used.split(',').map((product, index) => (
                                            <Badge key={index} variant="outline" className="mr-1">
                                                {product.trim().charAt(0).toUpperCase() + product.trim().slice(1)}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {metalEntries.length > 0 && (
                                <div className="md:col-span-2">
                                    <Label>Metal Usage</Label>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            {metalEntries.map((entry, index) => (
                                                <Badge key={index} variant="outline" className="mr-1">
                                                    <span className="font-medium">{entry.type}</span>
                                                    {entry.grams !== null && (
                                                        <span className="ml-1 text-sm text-gray-700">
                                                            {entry.grams.toFixed(3)}g
                                                        </span>
                                                    )}
                                                    {entry.currentRate !== null && (
                                                        <span className="ml-2 text-xs text-gray-600">
                                                            Rate: {entry.currentRate.toLocaleString()}
                                                        </span>
                                                    )}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}



                        </div>
                    </Card>
                )}

                <Card className="p-6 hidden">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Vouchers</p>
                            <p className="text-xl font-semibold text-gray-900">{summary.vouchers_count}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Total Pieces</p>
                            <p className="text-xl font-semibold text-gray-900">{summary.total_pcs}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Total Weight</p>
                            <p className="text-xl font-semibold text-gray-900">{summary.total_weight.toFixed(2)} ct</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 hidden">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vouchers</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left p-2 font-medium text-gray-900">Voucher No</th>
                                    <th className="text-left p-2 font-medium text-gray-900">Date Given</th>
                                    <th className="text-left p-2 font-medium text-gray-900">Date Delivery</th>
                                    <th className="text-left p-2 font-medium text-gray-900">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vouchers.map(v => (
                                    <tr key={v.id} className="border-b border-gray-100">
                                        <td className="p-2 text-emerald-700">
                                            <Link href={route('vouchers.show', v.id)} className="underline">
                                                {v.voucher_no}
                                            </Link>
                                        </td>
                                        <td className="p-2 text-gray-700">{formatDate(v.date_given)}</td>
                                        <td className="p-2 text-gray-700">{formatDate(v.date_delivery)}</td>
                                        <td className="p-2">{getStatusBadge(v.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Packets</h3>

                        {!allCompleted ? (

                            hasPermission('complete vouchers') ? (
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => {
                                        if (confirm('Mark all vouchers for this stock as completed?')) {
                                            router.post(route('vouchers-groups.complete', stockNo));
                                        }
                                    }}
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Complete
                                </Button>
                            ) : (
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    disabled={true}>Complete (No Permission)</Button>
                            )
                        ) : (
                            <div className="flex items-center text-sm font-medium text-gray-600">
                                <Check className="h-4 w-4 mr-1 text-emerald-600" />
                                Completed
                            </div>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left px-2 py-1 font-medium text-gray-900 sticky left-0 bg-gray-50 z-10">
                                        Voucher No
                                    </th>
                                    <th className="text-left px-2 py-1 font-medium text-gray-900">Product</th>
                                    <th className="text-left px-2 py-1 font-medium text-gray-900">Shape</th>
                                    <th className="text-left px-2 py-1 font-medium text-gray-900">Pcs</th>
                                    <th className="text-left px-2 py-1 font-medium text-gray-900">Weight (ct)</th>

                                    <th className="text-left px-2 py-1 font-medium text-gray-900">Pcs Returned</th>
                                    <th className="text-left px-2 py-1 font-medium text-gray-900">Weight Returned</th>

                                    <th className="text-left px-2 py-1 font-medium text-gray-900">Pcs Used</th>
                                    <th className="text-left px-2 py-1 font-medium text-gray-900">Weight Used</th>


                                    <th className="text-left px-2 py-1 font-medium text-gray-900">Code</th>
                                    <th className="text-left px-2 py-1 font-medium text-gray-900">Remarks</th>
                                    <th className="text-left px-2 py-1 font-medium text-gray-900">Temporary Return</th>
                                    <th className="text-left px-2 py-1 font-medium text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {editableItems.map((it, idx) => (
                                    <tr key={`${it.voucher_id}-${idx}`} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-2 py-1 text-emerald-700 sticky left-0 bg-white z-10">
                                            <Link href={route('vouchers.show', it.voucher_id)} className="underline hover:text-emerald-800 font-medium">
                                                {it.voucher_no}
                                            </Link>
                                        </td>
                                        <td className="px-2 py-1 text-gray-700">{it.product_name || '-'}</td>
                                        <td className="px-2 py-1 text-gray-700">{it.shape}</td>
                                        <td className="px-2 py-1 text-gray-700">{it.pcs}</td>
                                        <td className="px-2 py-1 text-gray-700">{Number(it.weight).toFixed(2)}</td>

                                        <td className="px-2 py-1 text-gray-700">
                                            {allCompleted ? (
                                                <> {editableMode && currentEditableItem?.id === it.id ? (
                                                    <input
                                                        type="number"
                                                        className="w-16 border rounded px-1 py-0.5 text-[11px]"
                                                        value={it.pcs_returned ?? ''}
                                                        onChange={(e) =>
                                                            handleUsageChange(idx, 'pcs_returned', e.target.value)
                                                        }
                                                    />
                                                ) : (
                                                    it.pcs_returned || 0
                                                )}
                                                </>
                                            ) : (
                                                it.pcs_returned || 0
                                            )}
                                        </td>

                                        <td className="px-2 py-1 text-gray-700">
                                            {allCompleted ? (
                                                <> {editableMode && currentEditableItem?.id === it.id ? (
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="w-20 border rounded px-1 py-0.5 text-[11px]"
                                                        value={it.weight_returned ?? ''}
                                                        onChange={(e) =>
                                                            handleUsageChange(idx, 'weight_returned', e.target.value)
                                                        }
                                                    />
                                                ) : (
                                                    it.weight_returned || 0
                                                )}
                                                </>
                                            ) : (
                                                it.weight_returned || 0
                                            )}
                                        </td>

                                        <td className="px-2 py-1 text-gray-700">
                                            {allCompleted ? (
                                                <> {editableMode && currentEditableItem?.id === it.id ? (
                                                    it.pcs_used = it.pcs - (it.pcs_returned || 0)
                                                ) : (
                                                    it.pcs_used || 0
                                                )}
                                                </>
                                            ) : (
                                                it.pcs_used || 0
                                            )}
                                        </td>

                                        <td className="px-2 py-1 text-gray-700">
                                            {allCompleted ? (
                                                <> {editableMode && currentEditableItem?.id === it.id ? (
                                                    it.weight_used = it.weight - (it.weight_returned || 0)
                                                ) : (
                                                    it.weight_used || 0
                                                )}
                                                </>
                                            ) : (
                                                it.weight_used || 0
                                            )}
                                        </td>



                                        <td className="px-2 py-1 text-gray-700">{it.code || '-'}</td>
                                        <td className="px-2 py-1 text-gray-700">{it.remarks || '-'}</td>
                                        <td className="px-2 py-1">
                                            {it.temporary_return ? (
                                                <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800">
                                                    Yes
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-400">No</span>
                                            )}
                                        </td>
                                        <td className="px-2 py-1">
                                            {allCompleted && (
                                                <>
                                                    {!editableMode || currentEditableItem?.id !== it.id ? (
                                                        it.reviewed ? (
                                                            <div className="flex items-center space-x-2">

                                                                <Check className="h-4 w-4 mr-1 text-emerald-600" />

                                                                <Button
                                                                    className='border-none'
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleEditUsage(it)}
                                                                >
                                                                    <Pencil className="h-4 w-4 mr-1" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleEditUsage(it)}
                                                            >
                                                                Review
                                                            </Button>
                                                        )
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleSaveUsage(it)}
                                                        >
                                                            Confirm
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}


