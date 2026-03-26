import AppLayout from '@/Layouts/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatDateOnly } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import {
    Check,
    Eye,
    Package,
    Plus,
    Search,
    TrendingDown,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';
declare const route: any;

interface MetalVoucher {
    id: number;
    voucher_no: string;
    date_given: string;
    status: string;
    total_weight: number;
    items?: Array<{
        weight: string | number;
        metal?: { name: string };
    }>;
}

interface MetalVouchersIndexProps {
    metalVouchers: {
        data: MetalVoucher[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        date_given_from?: string;
        date_given_to?: string;
    };
}

export default function Index({ metalVouchers, filters }: MetalVouchersIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [dateGivenFrom, setDateGivenFrom] = useState(filters.date_given_from || '');
    const [dateGivenTo, setDateGivenTo] = useState(filters.date_given_to || '');

    const handleSearch = () => {
        router.get(route('metal-vouchers.index'), {
            search: searchTerm,
            status: selectedStatus,
            date_given_from: dateGivenFrom,
            date_given_to: dateGivenTo,
        }, { preserveState: true, replace: true });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setDateGivenFrom('');
        setDateGivenTo('');
        router.get(route('metal-vouchers.index'), {}, { preserveState: false, replace: true });
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
            loss_adjustment: { color: 'bg-red-100 hover:bg-red-100 text-red-800', label: 'Adjusted' },
        };
        const info = statusMap[status];
        return <Badge className={info?.color || 'bg-gray-100 text-gray-800'}>{info?.label || status}</Badge>;
    };

    const canVerify = (s: string) => s === 'pending_verification';
    const canReceive = (s: string) => s === 'in_transit';
    const canApprove = (s: string) => s === 'pending_approval';
    const canReject = (s: string) => s === 'under_review';
    // const canComplete = (s: string) => s === 'in_use';
    const canComplete = (s: string) => s === '';

    const handleAction = (id: number, action: string) => {
        router.post(route(`metal-vouchers.${action}`, id), {}, { onError: (e) => console.error(e) });
    };

    return (
        <AppLayout title="Metal Vouchers">
            <Head title="Metal Vouchers" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="mb-2 text-2xl font-semibold text-gray-900">Metal Vouchers</h1>
                        <p className="text-gray-600">Track metal transactions by voucher</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href={route('metal-vouchers.create')}>
                            <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Metal Voucher
                            </Button>
                        </Link>
                        <Link href={route('metal-vouchers.loss-adjustment.create')}>
                            <Button variant="outline" className="border-amber-600 text-amber-800 hover:bg-amber-50">
                                <TrendingDown className="mr-2 h-4 w-4" />
                                Adjustments
                            </Button>
                        </Link>
                    </div>
                </div>

                <Card className="p-4">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10 focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            >
                                <option value="">All Status</option>
                                <option value="pending_approval">Pending Approval</option>
                                {/* <option value="pending_verification">Pending Verification</option> */}
                                {/* <option value="in_transit">In Transit</option> */}
                                {/* <option value="under_review">Under Review</option> */}
                                <option value="in_use">In Use</option>
                                {/* <option value="rejected">Rejected</option> */}
                                {/* <option value="completed">Completed</option> */}
                            </select>
                            <Input
                                type="date"
                                value={dateGivenFrom}
                                onChange={(e) => setDateGivenFrom(e.target.value)}
                                className="focus:ring-2 focus:ring-emerald-500"
                            />
                            <Input
                                type="date"
                                value={dateGivenTo}
                                onChange={(e) => setDateGivenTo(e.target.value)}
                                className="focus:ring-2 focus:ring-emerald-500"
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleSearch} className="bg-emerald-600 text-white hover:bg-emerald-700">Search</Button>
                                <Button onClick={handleClearFilters} variant="outline" className="border-gray-300 text-gray-700">
                                    <X className="mr-2 h-4 w-4" /> Clear
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="p-4 text-left font-medium text-gray-900">Voucher No</th>
                                    <th className="p-4 text-left font-medium text-gray-900">Date Given</th>
                                    <th className="p-4 text-left font-medium text-gray-900">Status</th>
                                    <th className="p-4 text-left font-medium text-gray-900">Items</th>
                                    <th className="p-4 text-left font-medium text-gray-900">Total Weight</th>
                                    <th className="p-4 text-left font-medium text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metalVouchers.data.map((mv) => (
                                    <tr key={mv.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">{mv.voucher_no}</td>
                                        <td className="p-4 text-gray-600">{formatDateOnly(mv.date_given)}</td>
                                        <td className="p-4">{Number((mv.items ?? []).reduce((s, i) => s + (parseFloat(String(i.weight)) || 0), 0).toFixed(2)) < 0.0001 ? getStatusBadge('loss_adjustment') : getStatusBadge(mv.status)}</td>
                                        <td className="p-4 text-gray-600">{mv.items?.length ?? 0}</td>
                                        <td className="p-4 text-gray-600">
                                            {(mv.items ?? []).reduce((s, i) => s + (parseFloat(String(i.weight)) || 0), 0).toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                <Link href={route('metal-vouchers.show', mv.id)}>
                                                    <Button size="sm" variant="outline"><Eye className="mr-1 h-3 w-3" /> View</Button>
                                                </Link>
                                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-800"
                                                    onClick={() => confirm('Delete this metal voucher?') && router.delete(route('metal-vouchers.destroy', mv.id))}>
                                                    <Trash2 className="mr-1 h-3 w-3" /> Delete
                                                </Button>
                                                {canVerify(mv.status) && (
                                                    <Button size="sm" className="bg-yellow-600 text-white hover:bg-yellow-700" onClick={() => handleAction(mv.id, 'verify')}>
                                                        <Check className="mr-1 h-3 w-3" /> Verify
                                                    </Button>
                                                )}
                                                {canApprove(mv.status) && (
                                                    <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleAction(mv.id, 'approve')}>
                                                        <Check className="mr-1 h-3 w-3" /> Approve
                                                    </Button>
                                                )}
                                                {canReject(mv.status) && (
                                                    <Button size="sm" className="bg-red-600 text-white hover:bg-red-700" onClick={() => handleAction(mv.id, 'reject')}>
                                                        <X className="mr-1 h-3 w-3" /> Reject
                                                    </Button>
                                                )}
                                                {canReceive(mv.status) && (
                                                    <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleAction(mv.id, 'receive')}>
                                                        <Package className="mr-1 h-3 w-3" /> Receive
                                                    </Button>
                                                )}
                                                {canComplete(mv.status) && (
                                                    <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={() => handleAction(mv.id, 'complete')}>
                                                        <Check className="mr-1 h-3 w-3" /> Complete
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {metalVouchers.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 p-4">
                            <div className="text-sm text-gray-700">
                                Showing {metalVouchers.from} to {metalVouchers.to} of {metalVouchers.total}
                            </div>
                            <div className="flex space-x-2">
                                {metalVouchers.links.map((link, i) => (
                                    <Link key={i} href={link.url || '#'}
                                        className={`rounded-md px-3 py-2 text-sm ${link.active ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700 hover:bg-gray-100'} ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
