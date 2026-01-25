import React, { useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
    Search, 
    AlertCircle, 
    CheckCircle,
    RefreshCw,
    Download
} from 'lucide-react'

interface ReconciliationItem {
    sku: string
    description: string
    shop: {
        expected: number
        actual: number
    }
    transit: {
        expected: number
        actual: number
    }
    workshop: {
        expected: number
        actual: number
    }
    returned: {
        expected: number
        actual: number
    }
    totalExpected: number
    totalActual: number
    status: string
}

interface ReconciliationProps {
    reconciliationData: ReconciliationItem[]
    summary: {
        matches: number
        mismatches: number
        accuracy: number
    }
}

export default function Reconciliation({ reconciliationData, summary }: ReconciliationProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const { post, processing } = useForm();

    const getStatusIcon = (status: string) => {
        return status === 'match' ? (
            <CheckCircle className="h-4 w-4 text-emerald-600" />
        ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
        );
    };

    const getStatusBadge = (status: string) => {
        return (
            <Badge className={
                status === 'match' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-red-100 text-red-800'
            }>
                {status === 'match' ? 'Match' : 'Mismatch'}
            </Badge>
        );
    };

    const getCellClass = (expected: number, actual: number) => {
        if (expected !== actual) {
            return 'bg-red-50 text-red-800';
        }
        return 'text-gray-600';
    };

    const filteredData = reconciliationData.filter(item =>
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRefreshData = () => {
        post(route('reconciliation.refresh-data'));
    };

    const handleGenerateReport = () => {
        post(route('reconciliation.generate-report'), {
            report_date: new Date().toISOString().split('T')[0],
            notes: 'Generated from dashboard'
        });
    };

    return (
        <AppLayout title="Reconciliation">
            <Head title="Reconciliation" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Reconciliation</h1>
                        <p className="text-gray-600">Compare expected vs actual inventory across all locations</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            className="text-gray-600 hover:text-gray-800"
                            onClick={handleRefreshData}
                            disabled={processing}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh Data
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={handleGenerateReport}
                            disabled={processing}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Generate Report
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Matches</p>
                                <p className="text-2xl font-semibold text-gray-900">{summary.matches}</p>
                            </div>
                        </div>
                    </Card>
                    
                    <Card className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Mismatches</p>
                                <p className="text-2xl font-semibold text-gray-900">{summary.mismatches}</p>
                            </div>
                        </div>
                    </Card>
                    
                    <Card className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <RefreshCw className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Accuracy</p>
                                <p className="text-2xl font-semibold text-gray-900">{summary.accuracy}%</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Search */}
                <Card className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by SKU or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </Card>

                {/* Reconciliation Table */}
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left p-4 font-medium text-gray-900">SKU</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Description</th>
                                    <th className="text-center p-4 font-medium text-gray-900">Shop</th>
                                    <th className="text-center p-4 font-medium text-gray-900">Transit</th>
                                    <th className="text-center p-4 font-medium text-gray-900">Workshop</th>
                                    <th className="text-center p-4 font-medium text-gray-900">Returned</th>
                                    <th className="text-center p-4 font-medium text-gray-900">Total</th>
                                    <th className="text-center p-4 font-medium text-gray-900">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item) => (
                                    <tr key={item.sku} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">{item.sku}</td>
                                        <td className="p-4 text-gray-600">{item.description}</td>
                                        
                                        <td className="p-4 text-center">
                                            <div className={`inline-block px-2 py-1 rounded text-sm ${getCellClass(item.shop.expected, item.shop.actual)}`}>
                                                {item.shop.actual}/{item.shop.expected}
                                            </div>
                                        </td>
                                        
                                        <td className="p-4 text-center">
                                            <div className={`inline-block px-2 py-1 rounded text-sm ${getCellClass(item.transit.expected, item.transit.actual)}`}>
                                                {item.transit.actual}/{item.transit.expected}
                                            </div>
                                        </td>
                                        
                                        <td className="p-4 text-center">
                                            <div className={`inline-block px-2 py-1 rounded text-sm ${getCellClass(item.workshop.expected, item.workshop.actual)}`}>
                                                {item.workshop.actual}/{item.workshop.expected}
                                            </div>
                                        </td>
                                        
                                        <td className="p-4 text-center">
                                            <div className={`inline-block px-2 py-1 rounded text-sm ${getCellClass(item.returned.expected, item.returned.actual)}`}>
                                                {item.returned.actual}/{item.returned.expected}
                                            </div>
                                        </td>
                                        
                                        <td className="p-4 text-center">
                                            <div className={`inline-block px-2 py-1 rounded text-sm ${getCellClass(item.totalExpected, item.totalActual)}`}>
                                                {item.totalActual}/{item.totalExpected}
                                            </div>
                                        </td>
                                        
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                {getStatusIcon(item.status)}
                                                {getStatusBadge(item.status)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Legend */}
                <Card className="p-4">
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
                            <span>Mismatch (Actual/Expected)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
                            <span>Match (Actual/Expected)</span>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}
