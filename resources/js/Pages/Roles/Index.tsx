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
    Shield
} from 'lucide-react'

interface Role {
    id: number
    name: string
    permissions_count: number
    permissions: string[]
    created_at: string
}

interface RolesIndexProps {
    roles: Role[]
}

export default function RolesIndex({ roles }: RolesIndexProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = (roleId: number) => {
        if (confirm('Are you sure you want to delete this role?')) {
            router.delete(`/roles/${roleId}`)
        }
    }

    const getPermissionBadges = (permissions: string[]) => {
        if (permissions.length === 0) {
            return <Badge variant="secondary">No Permissions</Badge>
        }
        
        return permissions.slice(0, 3).map((permission, index) => (
            <Badge key={index} variant="outline" className="mr-1">
                {permission}
            </Badge>
        ))
    }

    return (
        <AppLayout title="Roles & Permissions">
            <Head title="Roles & Permissions" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Shield className="h-8 w-8 text-emerald-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
                            <p className="text-gray-600">Manage system roles and their permissions</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href="/permissions">
                            <Button variant="outline">
                                <Shield className="h-4 w-4 mr-2" />
                                Manage Permissions
                            </Button>
                        </Link>
                        <Link href="/roles/create">
                            <Button className="flex items-center space-x-2">
                                <Plus className="h-4 w-4" />
                                <span>Add Role</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Search */}
                <div className="flex items-center space-x-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search roles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Roles Table */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role Name</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Permissions Count</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRoles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">
                                        <div className="font-medium text-gray-900">{role.name}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {getPermissionBadges(role.permissions)}
                                            {role.permissions.length > 3 && (
                                                <Badge variant="secondary" className="mr-1">
                                                    +{role.permissions.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{role.permissions_count}</Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-600">{role.created_at}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link href={`/roles/${role.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/roles/${role.id}/edit`}>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(role.id)}
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

                    {filteredRoles.length === 0 && (
                        <div className="text-center py-12">
                            <Shield className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new role.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    )
}

