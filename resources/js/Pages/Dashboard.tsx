import React, { useMemo, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Box,
    Calendar as CalendarIcon,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Coins,
    Gem,
    List,
    Minus,
    RotateCcw,
    TrendingDown,
    TrendingUp,
    Truck,
    Wrench,
} from 'lucide-react';

declare const route: (name: string, params?: Record<string, string>) => string;

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
        pending_verification: number;
        in_transit: number;
        under_review: number;
        in_use: number;
        rejected: number;
        completed: number;
    };
    metalLedger: Array<{
        id: number;
        name: string;
        credit: number;
        debit: number;
        balance: number;
    }>;
    stockBreakdown: {
        total_stock_count: number;
        items_completed: number;
        items_completed_by_category: Array<{ category: string; count: number }>;
        items_in_making: number;
        items_in_making_by_category: Array<{ category: string; count: number }>;
    };
    workshopDetail: {
        stones: Array<{ name: string; total_carats: number }>;
        metals: Array<{ name: string; total_weight: number }>;
    };
    deliveryCalendar?: Array<{
        stock_no: string;
        thumbnail: string | null;
        date_delivery: string | null;
        product_categorization: string | null;
    }>;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Dashboard({
    kpis,
    recentActivities,
    reconciliationStatus,
    voucherStats,
    metalLedger,
    stockBreakdown,
    workshopDetail,
    deliveryCalendar = [],
}: DashboardProps) {
    const [isRecentActivityExpanded, setIsRecentActivityExpanded] = useState(false);
    const [isReconciliationExpanded, setIsReconciliationExpanded] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(() => {
        const d = new Date();
        return { year: d.getFullYear(), month: d.getMonth() };
    });

    const eventsByDate = useMemo(() => {
        const map: Record<string, Array<{ stock_no: string; product_categorization: string | null; thumbnail: string | null }>> = {};
        (deliveryCalendar ?? []).forEach((item) => {
            if (!item.date_delivery) return;
            const key = item.date_delivery;
            if (!map[key]) map[key] = [];
            map[key].push({
                stock_no: item.stock_no,
                product_categorization: item.product_categorization,
                thumbnail: item.thumbnail ?? null,
            });
        });
        return map;
    }, [deliveryCalendar]);

    const calendarGrid = useMemo(() => {
        const { year, month } = calendarMonth;
        const first = new Date(year, month, 1);
        const last = new Date(year, month + 1, 0);
        const startPad = first.getDay();
        const daysInMonth = last.getDate();
        const totalCells = Math.ceil((startPad + daysInMonth) / 7) * 7;
        const rows: Array<Array<{ day: number | null; dateKey: string | null }>> = [];
        let day = 1;
        for (let i = 0; i < totalCells; i += 7) {
            const row: Array<{ day: number | null; dateKey: string | null }> = [];
            for (let j = 0; j < 7; j++) {
                const cellIndex = i + j;
                if (cellIndex < startPad || day > daysInMonth) {
                    row.push({ day: null, dateKey: null });
                } else {
                    const d = day++;
                    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    row.push({ day: d, dateKey });
                }
            }
            rows.push(row);
        }
        return rows;
    }, [calendarMonth]);

    const goPrevMonth = () => {
        setCalendarMonth((prev) => (prev.month === 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: prev.month - 1 }));
    };
    const goNextMonth = () => {
        setCalendarMonth((prev) => (prev.month === 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: prev.month + 1 }));
    };

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

                {/* Stock Delivery Calendar */}
                <Card className="p-6">
                    <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <CalendarIcon className="h-5 w-5 text-blue-600" />
                        Stock Delivery Calendar
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                        Latest delivery date per stock (from vouchers). Click a stock to view the voucher group.
                    </p>
                    <div className="overflow-x-auto">
                        <div className="min-w-[320px]">
                            <div className="flex items-center justify-between mb-3">
                                <button
                                    type="button"
                                    onClick={goPrevMonth}
                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                                    aria-label="Previous month"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <span className="font-semibold text-gray-900">
                                    {MONTH_NAMES[calendarMonth.month]} {calendarMonth.year}
                                </span>
                                <button
                                    type="button"
                                    onClick={goNextMonth}
                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                                    aria-label="Next month"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                            <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
                                <thead>
                                    <tr className="bg-gray-50">
                                        {WEEKDAY_LABELS.map((label) => (
                                            <th key={label} className="border border-gray-200 p-1.5 text-xs font-medium text-gray-600">
                                                {label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {calendarGrid.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {row.map((cell, colIndex) => {
                                                const events = cell.dateKey ? eventsByDate[cell.dateKey] ?? [] : [];
                                                return (
                                                    <td
                                                        key={colIndex}
                                                        className="border border-gray-200 p-1 align-top min-w-[44px] h-24 bg-white"
                                                    >
                                                        <div className="flex flex-col h-full">
                                                            {cell.day !== null && (
                                                                <span className="text-sm font-medium text-gray-700">{cell.day}</span>
                                                            )}
                                                            <div className="flex-1 mt-0.5 space-y-0.5 overflow-auto">
                                                                {events.map((ev) => (
                                                                    <Link
                                                                        key={ev.stock_no}
                                                                        href={route('vouchers-groups.show', { stock_no: ev.stock_no })}
                                                                        className="flex items-center gap-2 text-xs truncate rounded px-1.5 py-0.5 bg-blue-100 text-blue-800 hover:bg-blue-200"
                                                                        title={`${ev.stock_no}${ev.product_categorization ? ` (${ev.product_categorization})` : ''}`}
                                                                    >
                                                                        {ev.thumbnail ? (
                                                                            <img src={'/storage/' +ev.thumbnail} alt={ev.stock_no} className="w-12 h-12 rounded" />
                                                                        ) : (
                                                                            <Box className="h-12 w-12" />
                                                                        )}
                                                                        {ev.stock_no}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>


                {/* KPIs */}
                <div className="hidden grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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

                {/* Total Stock Count breakdown: Items Completed / Items in Making by category */}
                <Card className="p-6">
                    <a href={kpis.find(k => k.title === 'Total Stock Count')?.link}>
                        <h3 className="mb-1 text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Box className="h-5 w-5 text-blue-600" />
                            Total Stock Count: {stockBreakdown.total_stock_count}
                        </h3>
                    </a>
                    <p className="mb-4 text-sm text-gray-500">Click to view all voucher groups</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                            <h4 className="text-sm font-semibold text-emerald-800 mb-2">
                                Items Completed ({stockBreakdown.items_completed})
                            </h4>
                            <ul className="space-y-1.5">
                                {stockBreakdown.items_completed_by_category.length === 0 ? (
                                    <li className="text-sm text-gray-500">None</li>
                                ) : (
                                    stockBreakdown.items_completed_by_category.map(({ category, count }) => (
                                        <li key={category} className="text-sm text-gray-700 flex justify-between">
                                            {/* Make the category title uppercase first letter only */}
                                            <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                                            <span className="font-medium tabular-nums">{count}</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-amber-50/50 p-4">
                            <h4 className="text-sm font-semibold text-amber-800 mb-2">
                                Items in Making ({stockBreakdown.items_in_making})
                            </h4>
                            <ul className="space-y-1.5">
                                {stockBreakdown.items_in_making_by_category.length === 0 ? (
                                    <li className="text-sm text-gray-500">None</li>
                                ) : (
                                    stockBreakdown.items_in_making_by_category.map(({ category, count }) => (
                                        <li key={category} className="text-sm text-gray-700 flex justify-between">
                                            <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                                            <span className="font-medium tabular-nums">{count}</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </Card>


                {/* Workshop Detail – item-level totals for vouchers in workshop (in_use) */}
                <Card className="p-6">
                    <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Wrench className="h-5 w-5 text-orange-600" />
                        Workshop Detail
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                        Item-level totals for vouchers currently in workshop (status: In Use). Stones from voucher items (Product); metals from Stock metal field for those vouchers.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3">Stones (Carats)</h4>
                            <ul className="space-y-2">
                                {workshopDetail.stones.length === 0 ? (
                                    <li className="text-sm text-gray-500">No stone items in workshop</li>
                                ) : (
                                    workshopDetail.stones.map(({ name, total_carats }) => (
                                        <li key={name} className="flex justify-between text-sm">
                                            <span className="text-gray-700">{name}</span>
                                            <span className="font-medium tabular-nums text-gray-900">{total_carats.toFixed(2)} cts</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                        <div className="hidden rounded-lg border border-gray-200 bg-amber-50/30 p-4">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3">Metals (g)</h4>
                            <ul className="space-y-2">
                                {workshopDetail.metals.length === 0 ? (
                                    <li className="text-sm text-gray-500">No metal items in workshop</li>
                                ) : (
                                    workshopDetail.metals.map(({ name, total_weight }) => (
                                        <li key={name} className="flex justify-between text-sm">
                                            <span className="text-gray-700">{name}</span>
                                            <span className="font-medium tabular-nums text-gray-900">{total_weight.toFixed(2)} g</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </Card>

                {/* Metal Ledger */}
                <Card className="p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Coins className="h-5 w-5 text-amber-600" />
                        Metal Ledger
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                        Credit: metal in vouchers (In Use). Debit: metal used in stocks. Balance = Credit − Debit.
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="p-3 text-left text-sm font-medium text-gray-900">Metal</th>
                                    <th className="p-3 text-right text-sm font-medium text-gray-900">Credit</th>
                                    <th className="p-3 text-right text-sm font-medium text-gray-900">Debit</th>
                                    <th className="p-3 text-right text-sm font-medium text-gray-900">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metalLedger.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center text-gray-500">
                                            No metals defined.
                                        </td>
                                    </tr>
                                ) : (
                                    metalLedger.map((row) => (
                                        <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-3 font-medium text-gray-900">{row.name}</td>
                                            <td className="p-3 text-right text-gray-700">{row.credit.toFixed(2)}</td>
                                            <td className="p-3 text-right text-gray-700">{row.debit.toFixed(2)}</td>
                                            <td className={`p-3 text-right font-medium ${row.balance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                                {row.balance.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Recent Activity and Reconciliation Status */}
                <div className="hidden grid grid-cols-1 gap-8 lg:grid-cols-2">
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
