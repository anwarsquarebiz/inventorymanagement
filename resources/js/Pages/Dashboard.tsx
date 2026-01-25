import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Head, usePage } from '@inertiajs/react';
import {
    Box,
    Gem,
    List,
    Minus,
    RotateCcw,
    TrendingDown,
    TrendingUp,
    Truck,
    Wrench,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

interface DashboardProps {
    kpis: Array<{
        title: string;
        value: string;
        change: string;
        trend: string;
        color: string;
        link: string;
        colspan: string;
    }>;
    recentActivities: Array<{
        id: number;
        action: string;
        description: string;
        user: string;
        time: string;
        voucher_no: string;
    }>;
    reconciliationStatus: Array<{
        location: string;
        expected: number;
        actual: number;
        status: string;
    }>;
    voucherStats: {
        pending: number;
        approved: number;
        in_transit: number;
        received: number;
        returned: number;
    };
}

export default function Dashboard({
    kpis,
    recentActivities,
    reconciliationStatus,
    voucherStats,
}: DashboardProps) {
    const [isRecentActivityExpanded, setIsRecentActivityExpanded] = useState(false);
    const [isReconciliationExpanded, setIsReconciliationExpanded] = useState(false);

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="h-4 w-4 text-emerald-600" />;
            case 'down':
                return <TrendingDown className="h-4 w-4 text-red-600" />;
            default:
                return <Minus className="h-4 w-4 text-gray-600" />;
        }
    };

    const { props } = usePage() as any;
    const user = props?.auth?.user;
    const permissions: string[] = user?.permissions || [];

    const getActivityBadgeColor = (action: string) => {
        switch (action) {
            case 'created':
                return 'bg-blue-100 text-blue-800';
            case 'approved':
                return 'bg-emerald-100 text-emerald-800';
            case 'received_at_workshop':
                return 'bg-purple-100 text-purple-800';
            case 'sent_to_workshop':
                return 'bg-orange-100 text-orange-800';
            case 'returned':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleRecentActivityToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsRecentActivityExpanded(prev => !prev);
    };

    const handleReconciliationToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsReconciliationExpanded(prev => !prev);
    };

    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />
            <div className="space-y-8">
                <div>
                    <h1 className="mb-2 text-2xl font-semibold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Overview of your precious stones inventory and workshop
                        operations
                    </p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {kpis.map((kpi) => (
                        <Card key={kpi.title} className={`p-6 ${kpi.colspan}`}>
                            <a href={kpi.link}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="mb-1 text-sm text-gray-600">
                                            {kpi.title}
                                        </p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {kpi.value}
                                        </p>
                                        {/* <div className="flex items-center mt-2 space-x-1">
                                        {getTrendIcon(kpi.trend)}
                                        <span className={`text-sm ${
                                            kpi.trend === 'up' ? 'text-emerald-600' : 
                                            kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                            {kpi.change}
                                        </span>
                                    </div> */}
                                    </div>
                                    <div
                                        className={`rounded-lg p-3 ${kpi.color}`}
                                    >
                                        {kpi.title === 'Total Stock Count' && (
                                            <Box className="h-6 w-6" />
                                        )}
                                        {kpi.title === 'Total Vouchers' && (
                                            <List className="h-6 w-6" />
                                        )}
                                        {kpi.title === 'Stones in Shop' && (
                                            <Gem className="h-6 w-6" />
                                        )}
                                        {kpi.title === 'In Transit' && (
                                            <Truck className="h-6 w-6" />
                                        )}
                                        {kpi.title === 'In Workshop' && (
                                            <Wrench className="h-6 w-6" />
                                        )}
                                        {kpi.title === 'Returned' && (
                                            <RotateCcw className="h-6 w-6" />
                                        )}
                                    </div>
                                </div>
                            </a>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Recent Activity */}
                    {permissions.includes('view recent activity') && (
                    <Card className="p-6">
                        <button
                            type="button"
                            onClick={() => setIsRecentActivityExpanded(!isRecentActivityExpanded)}
                            className="flex w-full items-center justify-between mb-4 hover:opacity-80 transition-opacity"
                        >
                            <h3 className="text-lg font-semibold text-gray-900">
                                Recent Activity
                            </h3>
                            {isRecentActivityExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                        </button>
                        {isRecentActivityExpanded && (
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-start space-x-3"
                                    >
                                        <Badge
                                            className={`${getActivityBadgeColor(activity.action)} text-xs`}
                                        >
                                            {activity.action.replace('_', ' ')}
                                        </Badge>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-gray-900">
                                                {activity.description}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                by {activity.user} • {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                    )}
                    {/* Reconciliation Status */}
                    {permissions.includes('view reconciliation') && (
                    <Card className="p-6">
                        <button
                            type="button"
                            onClick={() => setIsReconciliationExpanded(!isReconciliationExpanded)}
                            className="flex w-full items-center justify-between mb-4 hover:opacity-80 transition-opacity"
                        >
                            <h3 className="text-lg font-semibold text-gray-900">
                                Reconciliation Status
                            </h3>
                            {isReconciliationExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                        </button>
                        {isReconciliationExpanded && (
                            <div className="space-y-3">
                                {reconciliationStatus.map((item) => (
                                    <div
                                        key={item.location}
                                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {item.location}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Expected: {item.expected} | Actual:{' '}
                                                {item.actual}
                                            </p>
                                        </div>
                                        <Badge
                                            className={
                                                item.status === 'match'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-red-100 text-red-800'
                                            }
                                        >
                                            {item.status === 'match'
                                                ? 'Match'
                                                : 'Mismatch'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
