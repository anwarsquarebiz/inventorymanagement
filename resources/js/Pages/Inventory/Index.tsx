import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
    Search,
    Plus,
    Package,
    Eye,
    Edit,
    Trash2
} from 'lucide-react'

interface InventoryItem {
    id: number
    sku: string
    stock_no: string
    shape: string
    description: string
    weight: number
    status: string
    location: string
    created_at: string
}

interface InventoryIndexProps {
    items: {
        data: InventoryItem[]
        links: any[]
        meta: any
    }
    locations: string[]
    statuses: string[]
    shapes: string[]
    summary: {
        total_items: number
        by_location: Record<string, number>
        by_status: Record<string, number>
        total_weight: number
    }
    filters: {
        search?: string
        location?: string
        status?: string
        shape?: string
    }
}

export default function Index({ items, locations, statuses, shapes, summary, filters }: InventoryIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '')
    const [selectedLocation, setSelectedLocation] = useState(filters.location || '')
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '')
    const [selectedShape, setSelectedShape] = useState(filters.shape || '')

    const handleSearch = () => {
        router.get(route('inventory.index'), {
            search: searchTerm,
            location: selectedLocation,
            status: selectedStatus,
            shape: selectedShape,
        }, {
            preserveState: true,
            replace: true,
        })
    }

    const getStatusBadge = (status: string) => {
        const statusMap = {
            available: { color: 'bg-emerald-100 text-emerald-800', label: 'Available' },
            reserved: { color: 'bg-blue-100 text-blue-800', label: 'Reserved' },
            in_transit: { color: 'bg-orange-100 text-orange-800', label: 'In Transit' },
            in_workshop: { color: 'bg-purple-100 text-purple-800', label: 'In Workshop' },
            returned: { color: 'bg-gray-100 text-gray-800', label: 'Returned' },
            sold: { color: 'bg-red-100 text-red-800', label: 'Sold' },
        };
        
        const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'bg-gray-100 text-gray-800', label: status };
        return (
            <Badge className={statusInfo.color}>
                {statusInfo.label}
            </Badge>
        );
    };

    const getLocationBadge = (location: string) => {
        const locationMap = {
            shop: { color: 'bg-emerald-100 text-emerald-800', label: 'Shop' },
            transit: { color: 'bg-blue-100 text-blue-800', label: 'Transit' },
            workshop: { color: 'bg-orange-100 text-orange-800', label: 'Workshop' },
            returned: { color: 'bg-gray-100 text-gray-800', label: 'Returned' },
        };
        
        const locationInfo = locationMap[location as keyof typeof locationMap] || { color: 'bg-gray-100 text-gray-800', label: location };
        return (
            <Badge className={locationInfo.color}>
                {locationInfo.label}
            </Badge>
        );
    };

    return (
        <AppLayout title="Inventory">
            <Head title="Inventory" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Inventory</h1>
                        <p className="text-gray-600">Manage precious stones inventory across all locations</p>
                    </div>
                    <Link href={route('inventory.create')}>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item
                        </Button>
                    </Link>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <Package className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Items</p>
                                <p className="text-2xl font-semibold text-gray-900">{summary.total_items}</p>
                            </div>
                        </div>
                    </Card>
                    
                    <Card className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Shop</p>
                                <p className="text-2xl font-semibold text-gray-900">{summary.by_location.shop || 0}</p>
                            </div>
                        </div>
                    </Card>
                    
                    <Card className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Package className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Workshop</p>
                                <p className="text-2xl font-semibold text-gray-900">{summary.by_location.workshop || 0}</p>
                            </div>
                        </div>
                    </Card>
                    
                    <Card className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Package className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Weight</p>
                                <p className="text-2xl font-semibold text-gray-900">{summary.total_weight.toFixed(2)} ct</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">All Locations</option>
                            {locations.map((location) => (
                                <option key={location} value={location}>{location}</option>
                            ))}
                        </select>

                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">All Status</option>
                            {statuses.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>

                        <select
                            value={selectedShape}
                            onChange={(e) => setSelectedShape(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">All Shapes</option>
                            {shapes.map((shape) => (
                                <option key={shape} value={shape}>{shape}</option>
                            ))}
                        </select>

                        <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            Search
                        </Button>
                    </div>
                </Card>

                {/* Inventory Table */}
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left p-4 font-medium text-gray-900">SKU</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Stock No</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Shape</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Description</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Weight</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Status</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Location</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.data.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">{item.sku}</td>
                                        <td className="p-4 text-gray-600">{item.stock_no}</td>
                                        <td className="p-4 text-gray-600">{item.shape}</td>
                                        <td className="p-4 text-gray-600">{item.description}</td>
                                        <td className="p-4 text-gray-600">{item.weight} ct</td>
                                        <td className="p-4">{getStatusBadge(item.status)}</td>
                                        <td className="p-4">{getLocationBadge(item.location)}</td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <Link href={route('inventory.show', item.id)}>
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        View
                                                    </Button>
                                                </Link>
                                                <Link href={route('inventory.edit', item.id)}>
                                                    <Button size="sm" variant="outline">
                                                        <Edit className="h-3 w-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                            </div>
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
