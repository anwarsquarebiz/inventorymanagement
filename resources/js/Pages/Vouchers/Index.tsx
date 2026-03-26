import AppLayout from '@/Layouts/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatDate, formatDateOnly } from '@/lib/utils';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Check,
    Eye,
    Package,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    X,
    ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
declare const route: any;

interface Voucher {
    id: number;
    voucher_no: string;
    stock_no: string;
    date_given: string;
    date_delivery: string;
    status: string;
    total_pieces: number;
    total_weight: number;
    person_in_charge: {
        name: string;
    };
    items?: Array<{
        pcs: number;
        weight: string | number;
    }>;
}

interface VouchersIndexProps {
    vouchers: {
        data: Voucher[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    users: Array<{
        id: number;
        name: string;
    }>;
    filters: {
        search?: string;
        status?: string;
        person_in_charge?: string;
        date_given_from?: string;
        date_given_to?: string;
        date_delivery_from?: string;
        date_delivery_to?: string;
    };
}

export default function Index({
    vouchers,
    users,
    filters,
}: VouchersIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedUser, setSelectedUser] = useState(
        filters.person_in_charge || '',
    );
    const [dateGivenFrom, setDateGivenFrom] = useState(
        filters.date_given_from || '',
    );
    const [dateGivenTo, setDateGivenTo] = useState(filters.date_given_to || '');
    const [dateDeliveryFrom, setDateDeliveryFrom] = useState(
        filters.date_delivery_from || '',
    );
    const [dateDeliveryTo, setDateDeliveryTo] = useState(
        filters.date_delivery_to || '',
    );

    const { props } = usePage() as any;
    const user = props?.auth?.user;
    const permissions: string[] = user?.permissions || [];

    console.log('permissions', permissions);

    const hasPermission = (permission?: string): boolean => {
        if (!permission) return true; // No permission required
        return permissions.includes(permission);
    };

    const handleSearch = () => {
        router.get(
            route('vouchers.index'),
            {
                search: searchTerm,
                status: selectedStatus,
                person_in_charge: selectedUser,
                date_given_from: dateGivenFrom,
                date_given_to: dateGivenTo,
                date_delivery_from: dateDeliveryFrom,
                date_delivery_to: dateDeliveryTo,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    console.log(users);

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setSelectedUser('');
        setDateGivenFrom('');
        setDateGivenTo('');
        setDateDeliveryFrom('');
        setDateDeliveryTo('');

        router.get(
            route('vouchers.index'),
            {},
            {
                preserveState: false,
                replace: true,
            },
        );
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
        return <Badge className={statusInfo?.color || 'bg-gray-100 text-gray-800'}>{statusInfo?.label || status}</Badge>;
    };

    const canVerify = (status: string) => status === 'pending_verification';
    const canReceive = (status: string) => status === 'in_transit';
    const canApprove = (status: string) => status === 'under_review';
    const canReject = (status: string) => status === 'under_review';
    const canReturn = (status: string) => status === 'in_use';
    const canComplete = (status: string) => status === 'in_use';

    const handleAction = (voucherId: number, action: string) => {
        router.post(
            route(`vouchers.${action}`, voucherId),
            {},
            {
                onSuccess: () => {
                    // Handle success
                },
                onError: (errors) => {
                    console.error('Action failed:', errors);
                },
            },
        );
    };

    return (
        <AppLayout title="Vouchers">
            <Head title="Vouchers" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-2xl font-semibold text-gray-900">
                            Vouchers
                        </h1>
                        <p className="text-gray-600">
                            Manage workshop vouchers and track stone movement
                        </p>
                    </div>
                    {hasPermission('create vouchers') && (
                    <Link href={route('vouchers.create')}>
                        <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Voucher
                        </Button>
                    </Link>
                    )}
                </div>

                {/* Search and Filters */}
                <Card className="p-4">
                    <div className="space-y-4">
                        {/* First Row: Search, Status, User, Search Button, Clear Button */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                <Input
                                    placeholder="Search vouchers..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    onKeyPress={(e) =>
                                        e.key === 'Enter' && handleSearch()
                                    }
                                    className="pl-10 focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <select
                                value={selectedStatus}
                                onChange={(e) =>
                                    setSelectedStatus(e.target.value)
                                }
                                className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            >
                                <option value="">All Status</option>
                                <option value="pending_verification">Pending Verification</option>
                                <option value="in_transit">In Transit</option>
                                <option value="under_review">Under Review</option>
                                <option value="in_use">In Use</option>
                                <option value="rejected">Rejected</option>
                                <option value="completed">Completed</option>
                            </select>

                            <select
                                value={selectedUser}
                                onChange={(e) =>
                                    setSelectedUser(e.target.value)
                                }
                                className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            >
                                <option value="">All Users</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>

                            <Button
                                onClick={handleSearch}
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                Search
                            </Button>

                            <Button
                                onClick={handleClearFilters}
                                variant="outline"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        </div>

                        {/* Second Row: Date Given Range */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid max-w-fit grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="flex max-w-fit items-center text-sm font-medium text-gray-700">
                                    Date Given:
                                </div>
                                <Input
                                    type="date"
                                    placeholder="From"
                                    value={dateGivenFrom}
                                    onChange={(e) =>
                                        setDateGivenFrom(e.target.value)
                                    }
                                    className="focus:ring-2 focus:ring-emerald-500"
                                />
                                <Input
                                    type="date"
                                    placeholder="To"
                                    value={dateGivenTo}
                                    onChange={(e) =>
                                        setDateGivenTo(e.target.value)
                                    }
                                    className="focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            {/* Third Row: Date Delivery Range */}
                            {/* <div className="grid max-w-fit grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="flex items-center text-sm font-medium text-gray-700">
                                    Date Delivery:
                                </div>
                                <Input
                                    type="date"
                                    placeholder="From"
                                    value={dateDeliveryFrom}
                                    onChange={(e) =>
                                        setDateDeliveryFrom(e.target.value)
                                    }
                                    className="focus:ring-2 focus:ring-emerald-500"
                                />
                                <Input
                                    type="date"
                                    placeholder="To"
                                    value={dateDeliveryTo}
                                    onChange={(e) =>
                                        setDateDeliveryTo(e.target.value)
                                    }
                                    className="focus:ring-2 focus:ring-emerald-500"
                                />
                            </div> */}
                        </div>
                    </div>
                </Card>

                {/* Vouchers Table */}
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="p-4 text-left font-medium text-gray-900">
                                        Stock No
                                    </th>
                                    <th className="p-4 text-left font-medium text-gray-900">
                                        Voucher No
                                    </th>
                                    <th className="p-4 text-left font-medium text-gray-900">
                                        Date Given
                                    </th>
                                    {/* <th className="p-4 text-left font-medium text-gray-900">
                                        Date Delivery
                                    </th> */}
                                    <th className="p-4 text-left font-medium text-gray-900">
                                        Status
                                    </th>
                                    <th className="p-4 text-left font-medium text-gray-900">
                                        No. of Packets
                                    </th>
                                    {/* <th className="p-4 text-left font-medium text-gray-900">
                                        Total Pcs
                                    </th> */}
                                    {/* <th className="p-4 text-left font-medium text-gray-900">
                                        Total Weight
                                    </th> */}
                                    <th className="p-4 text-left font-medium text-gray-900">
                                        Person in Charge
                                    </th>
                                    <th className="p-4 text-left font-medium text-gray-900">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {vouchers.data.map((voucher) => (
                                    <tr
                                        key={voucher.id}
                                        className="border-b border-gray-100 hover:bg-gray-50"
                                    >
                                        <td className="p-4 text-gray-600">
                                            {/* Link to stock group */}
                                            <Link className="hover:text-emerald-800 font-medium flex items-center" href={route('vouchers-groups.show', voucher.stock_no)}>
                                                <span className="mr-1">{voucher.stock_no}</span>
                                                <ExternalLink className="mr-1 h-4 w-4" />
                                            </Link>
                                        </td>
                                        <td className="p-4 font-medium text-gray-900">
                                            {voucher.voucher_no}
                                        </td>
                                        
                                        <td className="p-4 text-gray-600">
                                            {formatDateOnly(voucher.date_given)}
                                        </td>
                                        {/* <td className="p-4 text-gray-600">
                                            {formatDate(voucher.date_delivery)}
                                        </td> */}
                                        <td className="p-4">
                                            {getStatusBadge(voucher.status)}
                                        </td>
                                        <td className="p-4">
                                            {voucher.items?.length}
                                        </td>
                                        {/* <td className="p-4 text-gray-600">                                            
                                            {' '}
                                            {(voucher.items ?? [])
                                                .map(
                                                    (item: any) =>
                                                        Number(item.pcs) || 0,
                                                )
                                                .reduce(
                                                    (
                                                        sum: number,
                                                        item: number,
                                                    ) => sum + item,
                                                    0,
                                                )}{' '}
                                            pcs
                                        </td> */}
                                        {/* <td className="p-4 text-gray-600">
                                            {' '}
                                            {(voucher.items ?? [])
                                                .map(
                                                    (item: any) =>
                                                        parseFloat(
                                                            item.weight,
                                                        ) || 0,
                                                )
                                                .reduce(
                                                    (
                                                        sum: number,
                                                        item: number,
                                                    ) => sum + item,
                                                    0,
                                                )
                                                .toFixed(2)}{' '}
                                            cts
                                        </td> */}
                                        <td className="p-4 text-gray-600">
                                            {voucher.person_in_charge.name}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                {(() => {
                                                    const showPath = route(
                                                        'vouchers.show',
                                                        voucher.id,
                                                    ) as string;
                                                    const params = new URLSearchParams();
                                                    const page = vouchers?.current_page;
                                                    if (page != null && page > 1)
                                                        params.set('page', String(page));
                                                    if (searchTerm)
                                                        params.set('search', searchTerm);
                                                    const href =
                                                        params.toString()
                                                            ? `${showPath}?${params.toString()}`
                                                            : showPath;
                                                    return (
                                                        <Link href={href}>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                <Eye className="mr-1 h-3 w-3" />
                                                                View
                                                            </Button>
                                                        </Link>
                                                    );
                                                })()}

                                                {/* 
                                                <Link href={route('vouchers.edit', voucher.id)}>
                                                    <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-800">
                                                        <EditIcon className="h-3 w-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                </Link> 
                                                */}

                                                {hasPermission('delete vouchers') && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 hover:text-red-800"
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    'Are you sure you want to delete this voucher?',
                                                                )
                                                            ) {
                                                                router.delete(
                                                                    route(
                                                                        'vouchers.destroy',
                                                                        voucher.id,
                                                                    ),
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="mr-1 h-3 w-3" />
                                                        Delete
                                                    </Button>
                                                )}

                                                {hasPermission('verify vouchers') && canVerify(voucher.status) && (                                                
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

                                                {hasPermission('approve vouchers') && canApprove(voucher.status) && (
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

                                                {hasPermission('reject vouchers') && canReject(voucher.status) && (
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

                                                {hasPermission('receive at workshop') && canReceive(voucher.status) && (
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

                                                {hasPermission('complete vouchers') && canComplete(voucher.status) && (
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

                                                {/* {canReturn(voucher.status) && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-gray-600 hover:text-gray-800"
                                                        onClick={() =>
                                                            handleAction(
                                                                voucher.id,
                                                                'return',
                                                            )
                                                        }
                                                    >
                                                        <RotateCcw className="mr-1 h-3 w-3" />
                                                        Return
                                                    </Button>
                                                )} */}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {vouchers.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 p-4">
                            <div className="text-sm text-gray-700">
                                Showing {vouchers.from} to {vouchers.to} of{' '}
                                {vouchers.total} results
                            </div>
                            <div className="flex items-center space-x-2">
                                {vouchers.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`rounded-md px-3 py-2 text-sm ${
                                            link.active
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
