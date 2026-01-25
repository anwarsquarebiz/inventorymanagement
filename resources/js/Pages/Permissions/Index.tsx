import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table'
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Eye,
    Key,
    Shield
} from 'lucide-react'

interface Permission {
    id: number
    name: string
    roles_count: number
    roles: string[]
    created_at: string
}

interface PermissionsIndexProps {
    permissions: Permission[]
}

export default function PermissionsIndex({ permissions }: PermissionsIndexProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredPermissions = permissions.filter(permission =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = (permissionId: number) => {
        if (confirm('Are you sure you want to delete this permission?')) {
            router.delete(`/permissions/${permissionId}`)
        }
    }

    const getRoleBadges = (roles: string[]) => {
        if (roles.length === 0) {
            return <Badge variant="secondary">No Roles</Badge>
        }
        
        return roles.slice(0, 3).map((role, index) => (
            <Badge key={index} variant="outline" className="mr-1">
                {role}
            </Badge>
        ))
    }

    return (
        <AppLayout title="Permissions">
            <Head title="Permissions" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Key className="h-8 w-8 text-emerald-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Permissions</h1>
                            <p className="text-gray-600">Manage system permissions</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href="/roles">
                            <Button variant="outline">
                                <Shield className="h-4 w-4 mr-2" />
                                Manage Roles
                            </Button>
                        </Link>
                        <Link href="/permissions/create">
                            <Button className="flex items-center space-x-2">
                                <Plus className="h-4 w-4" />
                                <span>Add Permission</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Search */}
                <div className="flex items-center space-x-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search permissions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Permissions Table */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Permission Name</TableHead>
                                <TableHead>Assigned Roles</TableHead>
                                <TableHead>Roles Count</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPermissions.map((permission) => (
                                <TableRow key={permission.id}>
                                    <TableCell className="font-medium">
                                        <div className="font-medium text-gray-900">{permission.name}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {getRoleBadges(permission.roles)}
                                            {permission.roles.length > 3 && (
                                                <Badge variant="secondary" className="mr-1">
                                                    +{permission.roles.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{permission.roles_count}</Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-600">{permission.created_at}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link href={`/permissions/${permission.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/permissions/${permission.id}/edit`}>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(permission.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredPermissions.length === 0 && (
                        <div className="text-center py-12">
                            <Key className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No permissions found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new permission.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    )
}

