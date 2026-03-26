import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
declare const route: any;
import AppLayout from '@/Layouts/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit as EditIcon, Trash2, Check, Package, User, Clock, X } from 'lucide-react';
import { formatDate, formatDateOnly } from '@/lib/utils';

interface MetalVoucherItem {
    id: number;
    metal_id: number;
    weight: number | string;
    remarks?: string | null;
    metal?: { id: number; name: string };
}

interface MetalVoucherActivity {
    id: number;
    action: string;
    description: string;
    timestamp: string;
    user?: { name: string };
}

interface MetalVoucher {
    id: number;
    voucher_no: string;
    date_given: string;
    status: string;
    notes?: string | null;
    created_at: string;
    creator?: { name: string };
    approver?: { name: string };
    approved_at?: string | null;
    items: MetalVoucherItem[];
    activities: MetalVoucherActivity[];
}

interface ShowProps {
    metalVoucher: MetalVoucher;
    backPage?: number | null;
    backSearch?: string | null;
}

export default function Show({ metalVoucher, backPage, backSearch }: ShowProps) {
    const canVerify = (s: string) => s === 'pending_verification';
    const canReceive = (s: string) => s === 'in_transit';
    const canApprove = (s: string) => s === 'pending_approval';
    const canReject = (s: string) => s === 'under_review';
    // const canComplete = (s: string) => s === 'in_use';
    const canComplete = (s: string) => s === '';

    const handleAction = (action: string) => {
        router.post(route(`metal-vouchers.${action}`, metalVoucher.id), {}, { onError: () => {} });
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { color: string; label: string }> = {
            pending_approval: { color: 'bg-amber-100 hover:bg-amber-100 text-amber-800', label: 'Pending Approval' },
            pending_verification: { color: 'bg-yellow-100 hover:bg-yellow-100 text-yellow-800', label: 'Pending Verification' },
            in_transit: { color: 'bg-blue-100 hover:bg-blue-100 text-blue-800', label: 'In Transit' },
            under_review: { color: 'bg-emerald-100 hover:bg-emerald-100 text-emerald-800', label: 'Under Review' },
            in_use: { color: 'bg-purple-100 hover:bg-purple-100 text-purple-800', label: 'In Use' },
            rejected: { color: 'bg-red-100 hover:bg-red-100 text-red-800', label: 'Rejected' },
            completed: { color: 'bg-gray-100 hover:bg-gray-100 text-gray-800', label: 'Completed' },
        };
        const info = statusMap[status];
        return <Badge className={info?.color || 'bg-gray-100 text-gray-800'}>{info?.label || status}</Badge>;
    };

    const getTimelineIcon = (action: string) => {
        switch (action) {
            case 'created': return <Package className="h-4 w-4" />;
            case 'approved': return <User className="h-4 w-4" />;
            case 'verified': return <Check className="h-4 w-4" />;
            case 'received_at_workshop': return <Package className="h-4 w-4" />;
            case 'completed': return <Check className="h-4 w-4" />;
            case 'rejected': return <X className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const totalWeight = metalVoucher.items
        .map((i) => parseFloat(String(i.weight)) || 0)
        .reduce((a, b) => a + b, 0)
        .toFixed(2);

    return (
        <AppLayout title={`Metal Voucher ${metalVoucher.voucher_no}`}>
            <Head title={`Metal Voucher ${metalVoucher.voucher_no}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('metal-vouchers.index', { ...(backPage ? { page: backPage } : {}), ...(backSearch != null && backSearch !== '' ? { search: backSearch } : {}) })}>
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Metal Vouchers
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Metal Voucher {metalVoucher.voucher_no}</h1>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {canVerify(metalVoucher.status) && (
                            <Button size="sm" className="bg-yellow-600 text-white hover:bg-yellow-700" onClick={() => handleAction('verify')}>
                                <Check className="mr-1 h-3 w-3" /> Verify
                            </Button>
                        )}
                        {canApprove(metalVoucher.status) && (
                            <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleAction('approve')}>
                                <Check className="mr-1 h-3 w-3" /> Approve
                            </Button>
                        )}
                        {canReject(metalVoucher.status) && (
                            <Button size="sm" className="bg-red-600 text-white hover:bg-red-700" onClick={() => handleAction('reject')}>
                                <X className="mr-1 h-3 w-3" /> Reject
                            </Button>
                        )}
                        {canReceive(metalVoucher.status) && (
                            <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleAction('receive')}>
                                <Package className="mr-1 h-3 w-3" /> Receive
                            </Button>
                        )}
                        {canComplete(metalVoucher.status) && (
                            <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={() => handleAction('complete')}>
                                <Check className="mr-1 h-3 w-3" /> Complete
                            </Button>
                        )}
                        <Link href={route('metal-vouchers.edit', metalVoucher.id)}>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <EditIcon className="h-4 w-4 mr-2" /> Edit
                            </Button>
                        </Link>
                        <Button variant="outline" className="text-red-600 hover:text-red-800 border-red-300"
                            onClick={() => confirm('Delete this metal voucher?') && router.delete(route('metal-vouchers.destroy', metalVoucher.id))}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metal Voucher Information</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Date Given</p>
                                    <p className="font-medium text-gray-900">{formatDateOnly(metalVoucher.date_given)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <div className="mt-1">{getStatusBadge(metalVoucher.status)}</div>
                                </div>
                            </div>
                            {metalVoucher.notes && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600">Notes</p>
                                    <p className="text-gray-900">{metalVoucher.notes}</p>
                                </div>
                            )}
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-2 font-medium text-gray-900">Metal</th>
                                            <th className="text-left py-2 font-medium text-gray-900">Weight</th>
                                            <th className="text-left py-2 font-medium text-gray-900">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {metalVoucher.items.map((item) => (
                                            <tr key={item.id} className="border-b border-gray-100">
                                                <td className="py-3 text-gray-900">{item.metal?.name ?? 'N/A'}</td>
                                                <td className="py-3 text-gray-600">{item.weight}</td>
                                                <td className="py-3 text-gray-600">{item.remarks || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t-2 border-gray-300 bg-gray-50">
                                            <td className="py-3 font-semibold text-gray-900">Total</td>
                                            <td className="py-3 font-semibold text-gray-900">{totalWeight}</td>
                                            <td className="py-3" colSpan={1} />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>
                            <div className="space-y-4">
                                {(metalVoucher.activities ?? []).map((event, index) => (
                                    <div key={event.id} className="flex items-start space-x-3">
                                        <div className={`p-2 rounded-full ${index === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                                            {getTimelineIcon(event.action)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-gray-900">
                                                    {event.action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                                </p>
                                                <p className="text-sm text-gray-500">{formatDate(event.timestamp)}</p>
                                            </div>
                                            <p className="text-sm text-gray-600">{event.description}</p>
                                            {event.user && <p className="text-xs text-gray-500">by {event.user.name}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                    <div>
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600">Created By</p>
                                    <p className="font-medium text-gray-900">{metalVoucher.creator?.name ?? 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Created At</p>
                                    <p className="font-medium text-gray-900">{formatDate(metalVoucher.created_at)}</p>
                                </div>
                                {metalVoucher.approver && (
                                    <div>
                                        <p className="text-sm text-gray-600">Approved By</p>
                                        <p className="font-medium text-gray-900">{metalVoucher.approver.name}</p>
                                    </div>
                                )}
                                {metalVoucher.approved_at && (
                                    <div>
                                        <p className="text-sm text-gray-600">Approved At</p>
                                        <p className="font-medium text-gray-900">{formatDate(metalVoucher.approved_at)}</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
