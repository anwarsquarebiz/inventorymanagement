import React from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
    ArrowLeft,
    Edit,
    Trash2,
    Shield,
    Calendar,
    Key
} from 'lucide-react'

interface Permission {
    id: number
    name: string
}

interface Role {
    id: number
    name: string
    permissions: Permission[]
    created_at: string
    updated_at: string
}

interface RolesShowProps {
    role: Role
}

export default function Show({ role }: RolesShowProps) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this role?')) {
            router.delete(`/roles/${role.id}`)
        }
    }

    // Group permissions by category
    const groupedPermissions = role.permissions.reduce((acc, permission) => {
        const category = permission.name.split(' ')[0]
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(permission)
        return acc
    }, {} as Record<string, Permission[]>)

    return (
        <AppLayout title="Role Details">
            <Head title={`Role: ${role.name}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/roles">
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Roles
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-3">
                            <Shield className="h-8 w-8 text-emerald-600" />
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">Role Details</h1>
                                <p className="text-gray-600">View role information and permissions</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={`/roles/${role.id}/edit`}>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            className="text-red-600 hover:text-red-800 border-red-300"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Role Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Shield className="h-4 w-4" />
                                <span>Role ID</span>
                            </label>
                            <p className="mt-1 text-lg text-gray-900">#{role.id}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Key className="h-4 w-4" />
                                <span>Role Name</span>
                            </label>
                            <p className="mt-1 text-lg font-semibold text-gray-900">{role.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Created At</span>
                            </label>
                            <p className="mt-1 text-gray-900">{role.created_at}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Updated At</span>
                            </label>
                            <p className="mt-1 text-gray-900">{role.updated_at}</p>
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="mt-6 pt-6 border-t">
                        <label className="text-sm font-medium text-gray-500 flex items-center space-x-2 mb-4">
                            <Key className="h-4 w-4" />
                            <span>Assigned Permissions ({role.permissions.length})</span>
                        </label>
                        {role.permissions.length > 0 ? (
                            <div className="space-y-4">
                                {Object.entries(groupedPermissions).map(([category, perms]) => (
                                    <div key={category}>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2 capitalize">
                                            {category} Permissions
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {perms.map((permission) => (
                                                <Badge key={permission.id} variant="outline">
                                                    {permission.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No permissions assigned to this role.</p>
                        )}
                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}

