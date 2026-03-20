import React from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
declare const route: any
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    ArrowLeft,
    Download,
    Printer,
    Edit as EditIcon,
    Trash2,
    Check,
    Package,
    User,
    Clock,
    RotateCcw,
    X,
    ExternalLink
} from 'lucide-react'
import { formatDate, formatDateOnly } from '@/lib/utils'

interface VoucherItem {
    id: number
    shape: string
    pcs: number
    weight: number
    code: string
    remarks: string
    temporary_return?: boolean
    product?: {
        id: number
        name: string
    }
}

interface VoucherActivity {
    id: number
    action: string
    description: string
    timestamp: string
    user: {
        name: string
    }
}

interface Voucher {
    id: number
    voucher_no: string
    stock_no: string
    date_given: string
    date_delivery: string
    status: string
    notes: string
    created_at: string
    person_in_charge: {
        name: string
    }
    creator: {
        name: string
    }
    approver?: {
        name: string
    }
    approved_at?: string
    items: VoucherItem[]
    activities: VoucherActivity[]
}

interface VoucherShowProps {
    voucher: Voucher
    backPage?: number | null
    backSearch?: string | null
}

export default function Show({ voucher, backPage, backSearch }: VoucherShowProps) {
    const canVerify = (status: string) => status === 'pending_verification';
    const canReceive = (status: string) => status === 'in_transit';
    const canApprove = (status: string) => status === 'under_review';
    const canReject = (status: string) => status === 'under_review';
    const canReturn = (status: string) => status === 'in_use';
    const canComplete = (status: string) => status === 'in_use';

    const handleAction = (voucherId: number, action: 'approve' | 'receive' | 'return' | 'reject' | 'verify' | 'complete') => {
        router.post(route(`vouchers.${action}`, voucherId), {}, {
            onSuccess: () => { },
            onError: () => { },
        });
    };

    const { props } = usePage() as any;
    const user = props?.auth?.user;
    const permissions: string[] = user?.permissions || [];

    const hasPermission = (permission?: string): boolean => {
        if (!permission) return true; // No permission required
        return permissions.includes(permission);
    };

    const getStatusBadge = (status: string) => {
        const statusMap = {
            pending_verification: {
                color: 'bg-yellow-100 hover:bg-yellow-100 text-yellow-800',
                label: 'Pending Verification',
            },
            in_transit: {
                color: 'bg-blue-100 hover:bg-blue-100 text-blue-800',
                label: 'In Transit',
            },
            under_review: {
                color: 'bg-emerald-100 hover:bg-emerald-100 text-emerald-800',
                label: 'Under Review',
            },
            in_use: {
                color: 'bg-purple-100 hover:bg-purple-100 text-purple-800',
                label: 'In Use',
            },
            rejected: {
                color: 'bg-red-100 hover:bg-red-100 text-red-800',
                label: 'Rejected',
            },
            completed: {
                color: 'bg-gray-100 hover:bg-gray-100 text-gray-800',
                label: 'Completed',
            },
        };

        const statusInfo = statusMap[status as keyof typeof statusMap];
        return (
            <Badge className={statusInfo?.color || 'bg-gray-100 text-gray-800'}>
                {statusInfo?.label || status}
            </Badge>
        );
    };

    const getTimelineIcon = (action: string) => {
        switch (action) {
            case 'created':
                return <Package className="h-4 w-4" />;
            case 'approved':
                return <User className="h-4 w-4" />;
            case 'sent_to_workshop':
                return <Clock className="h-4 w-4" />;
            case 'received_at_workshop':
                return <Package className="h-4 w-4" />;
            case 'returned':
                return <Package className="h-4 w-4" />;
            default:
                return <Package className="h-4 w-4" />;
        }
    };

    const totalPcs = voucher.items.map((item: any) => item.pcs).reduce((sum: number, item: any) => sum + item, 0);
    const totalWeight = voucher.items.map((item: any) => parseFloat(item.weight)).reduce((sum: number, item: any) => sum + item, 0).toFixed(2);

    return (
        <AppLayout title={`Voucher ${voucher.voucher_no}`}>
            <Head title={`Voucher ${voucher.voucher_no}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('vouchers.index', {
                                ...(backPage ? { page: backPage } : {}),
                                ...(backSearch != null && backSearch !== ''
                                    ? { search: backSearch }
                                    : {}),
                            })}
                        >
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Vouchers
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Voucher {voucher.voucher_no}</h1>
                            <p className="text-gray-600 flex items-center">Stock No: <Link href={route('vouchers-groups.show', voucher.stock_no)} className="text-emerald-600 hover:text-emerald-800 flex items-center"><span className="mr-1 ml-1">{voucher.stock_no}</span> <ExternalLink className="h-4 w-4" /></Link></p>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        {canVerify(voucher.status) && (
                            <Button
                                size="sm"
                                className="bg-yellow-600 text-white hover:bg-yellow-700"
                                onClick={() =>
                                    handleAction(voucher.id, 'verify')}
                            >
                                <Check className="mr-1 h-3 w-3" />
                                Verify
                            </Button>
                        )}

                        {canApprove(voucher.status) && (
                            <Button
                                size="sm"
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                                onClick={() =>
                                    handleAction(
                                        voucher.id,
                                        'approve',
                                    )
                                }
                            >
                                <Check className="mr-1 h-3 w-3" />
                                Approve
                            </Button>
                        )}

                        {canReject(voucher.status) && (
                            <Button
                                size="sm"
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={() =>
                                    handleAction(voucher.id, 'reject')}
                            >
                                <X className="mr-1 h-3 w-3" />
                                Reject
                            </Button>
                        )}

                        {canReceive(voucher.status) && (
                            <Button
                                size="sm"
                                className="bg-blue-600 text-white hover:bg-blue-700"
                                onClick={() =>
                                    handleAction(
                                        voucher.id,
                                        'receive',
                                    )
                                }
                            >
                                <Package className="mr-1 h-3 w-3" />
                                Receive
                            </Button>
                        )}

                        {canComplete(voucher.status) && (
                            <Button
                                size="sm"
                                className="bg-green-600 text-white hover:bg-green-700"
                                onClick={() =>
                                    handleAction(voucher.id, 'complete')}
                            >
                                <Check className="mr-1 h-3 w-3" />
                                Complete
                            </Button>
                        )}

                        <Link href={route('vouchers.edit', voucher.id)}>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <EditIcon className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                        {hasPermission('delete vouchers') && (

                            <Button
                                variant="outline"
                                className="text-red-600 hover:text-red-800 border-red-300"
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this voucher?')) {
                                        router.delete(route('vouchers.destroy', voucher.id))
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            className="text-gray-600 hover:text-gray-800"
                            onClick={() => window.open(route('vouchers.print', voucher.id), '_blank')}
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        {/* <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => window.open(route('vouchers.export-pdf', voucher.id), '_blank')}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button> */}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Information */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Voucher Information</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Date Given</p>
                                    <p className="font-medium text-gray-900">{formatDateOnly(voucher.date_given)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Date Delivery</p>
                                    <p className="font-medium text-gray-900">{formatDateOnly(voucher.date_delivery)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <div className="mt-1">
                                        {getStatusBadge(voucher.status)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Person in Charge</p>
                                    <p className="font-medium text-gray-900">{voucher.person_in_charge.name}</p>
                                </div>
                            </div>
                            {voucher.notes && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600">Notes</p>
                                    <p className="text-gray-900">{voucher.notes}</p>
                                </div>
                            )}
                        </Card>

                        {/* Line Items */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Packets</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-2 font-medium text-gray-900">Product</th>
                                            <th className="text-left py-2 font-medium text-gray-900">Shape</th>
                                            <th className="text-left py-2 font-medium text-gray-900">Pieces</th>
                                            <th className="text-left py-2 font-medium text-gray-900">Weight (ct)</th>
                                            <th className="text-left py-2 font-medium text-gray-900">Code</th>
                                            <th className="text-left py-2 font-medium text-gray-900">Remarks</th>
                                            <th className="text-left py-2 font-medium text-gray-900">Temporary Return</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {voucher.items.map((item) => (
                                            <tr key={item.id} className="border-b border-gray-100">
                                                <td className="py-3 text-gray-600">{item.product?.name || 'N/A'}</td>
                                                <td className="py-3 text-gray-900">{item.shape}</td>
                                                <td className="py-3 text-gray-600">{item.pcs}</td>
                                                <td className="py-3 text-gray-600">{item.weight}</td>
                                                <td className="py-3 text-gray-600">{item.code || '-'}</td>
                                                <td className="py-3 text-gray-600">{item.remarks || '-'}</td>
                                                <td className="py-3">
                                                    {item.temporary_return ? (
                                                        <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800">
                                                            Yes
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-gray-400">No</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t-2 border-gray-300 bg-gray-50">
                                            <td className="py-3 font-semibold text-gray-900">Total</td>
                                            <td className="py-3"></td>
                                            <td className="py-3 font-semibold text-gray-900">{totalPcs}</td>
                                            <td className="py-3 font-semibold text-gray-900">{totalWeight}</td>
                                            <td className="py-3"></td>
                                            <td className="py-3"></td>
                                            <td className="py-3"></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </Card>

                        {/* Timeline */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>
                            <div className="space-y-4">
                                {voucher.activities.map((event, index) => (
                                    <div key={event.id} className="flex items-start space-x-3">
                                        <div className={`p-2 rounded-full ${index === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {getTimelineIcon(event.action)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-gray-900">
                                                    {event.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {formatDate(event.timestamp)}
                                                </p>
                                            </div>
                                            <p className="text-sm text-gray-600">{event.description}</p>
                                            <p className="text-xs text-gray-500">by {event.user.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar - Additional Info */}
                    <div>
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Voucher Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600">Created By</p>
                                    <p className="font-medium text-gray-900">{voucher.creator.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Created At</p>
                                    <p className="font-medium text-gray-900">
                                        {formatDate(voucher.created_at)}
                                    </p>
                                </div>
                                {voucher.approver && (
                                    <div>
                                        <p className="text-sm text-gray-600">Approved By</p>
                                        <p className="font-medium text-gray-900">{voucher.approver.name}</p>
                                    </div>
                                )}
                                {voucher.approved_at && (
                                    <div>
                                        <p className="text-sm text-gray-600">Approved At</p>
                                        <p className="font-medium text-gray-900">
                                            {formatDate(voucher.approved_at)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
