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
    Users as UsersIcon,
    Shield,
    Key
} from 'lucide-react'

interface User {
    id: number
    name: string
    email: string
    employee_id: string | null
    phone: string | null
    department: string | null
    is_active: boolean
    roles: string[]
    created_at: string
}

interface UsersIndexProps {
    users: {
        data: User[]
        links: any[]
        meta: any
    }
    roles: Array<{
        id: number
        name: string
    }>
}

export default function UsersIndex({ users, roles }: UsersIndexProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredUsers = users.data.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.employee_id && user.employee_id.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const handleDelete = (userId: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(`/users/${userId}`)
        }
    }

    const getRoleBadges = (userRoles: string[]) => {
        if (userRoles.length === 0) {
            return <Badge variant="secondary">No Role</Badge>
        }
        
        return userRoles.map((role, index) => (
            <Badge key={index} variant="outline" className="mr-1">
                {role}
            </Badge>
        ))
    }

    return (
        <AppLayout title="Users & Roles">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <UsersIcon className="h-8 w-8 text-emerald-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Users & Roles</h1>
                            <p className="text-gray-600">Manage system users and their permissions</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href="/roles">
                            <Button variant="outline" className="flex items-center space-x-2">
                                <Shield className="h-4 w-4" />
                                <span>Roles</span>
                            </Button>
                        </Link>
                        <Link href="/permissions">
                            <Button variant="outline" className="flex items-center space-x-2">
                                <Key className="h-4 w-4" />
                                <span>Permissions</span>
                            </Button>
                        </Link>
                        <Link href="/users/create">
                            <Button className="flex items-center space-x-2">
                                <Plus className="h-4 w-4" />
                                <span>Add User</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Search */}
                <div className="flex items-center space-x-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Employee ID</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div>
                                            <div className="font-medium text-gray-900">{user.name}</div>
                                            {user.phone && (
                                                <div className="text-sm text-gray-500">{user.phone}</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.employee_id || '-'}</TableCell>
                                    <TableCell>{user.department || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {getRoleBadges(user.roles)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant={user.is_active ? "default" : "secondary"}
                                            className={user.is_active ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"}
                                        >
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-600">{user.created_at}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link href={`/users/${user.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/users/${user.id}/edit`}>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(user.id)}
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

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new user.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {users.meta && users.meta.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {users.meta.from} to {users.meta.to} of {users.meta.total} results
                        </div>
                        <div className="flex items-center space-x-2">
                            {users.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3 py-2 text-sm rounded-md ${
                                        link.active
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
