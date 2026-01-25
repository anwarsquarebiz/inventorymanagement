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
    Key,
    Calendar,
    Shield
} from 'lucide-react'

interface Role {
    id: number
    name: string
}

interface Permission {
    id: number
    name: string
    roles: Role[]
    created_at: string
    updated_at: string
}

interface PermissionsShowProps {
    permission: Permission
}

export default function Show({ permission }: PermissionsShowProps) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this permission?')) {
            router.delete(`/permissions/${permission.id}`)
        }
    }

    return (
        <AppLayout title="Permission Details">
            <Head title={`Permission: ${permission.name}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/permissions">
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Permissions
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-3">
                            <Key className="h-8 w-8 text-emerald-600" />
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">Permission Details</h1>
                                <p className="text-gray-600">View permission information and assigned roles</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={`/permissions/${permission.id}/edit`}>
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Permission Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Key className="h-4 w-4" />
                                <span>Permission ID</span>
                            </label>
                            <p className="mt-1 text-lg text-gray-900">#{permission.id}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Key className="h-4 w-4" />
                                <span>Permission Name</span>
                            </label>
                            <p className="mt-1 text-lg font-semibold text-gray-900">{permission.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Created At</span>
                            </label>
                            <p className="mt-1 text-gray-900">{permission.created_at}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Updated At</span>
                            </label>
                            <p className="mt-1 text-gray-900">{permission.updated_at}</p>
                        </div>
                    </div>

                    {/* Roles */}
                    <div className="mt-6 pt-6 border-t">
                        <label className="text-sm font-medium text-gray-500 flex items-center space-x-2 mb-4">
                            <Shield className="h-4 w-4" />
                            <span>Assigned Roles ({permission.roles.length})</span>
                        </label>
                        {permission.roles.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {permission.roles.map((role) => (
                                    <Link key={role.id} href={`/roles/${role.id}`}>
                                        <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                                            {role.name}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No roles assigned to this permission.</p>
                        )}
                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}

