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
    Users as UsersIcon,
    Mail,
    Phone,
    Building,
    IdCard,
    Shield,
    Calendar
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
    updated_at: string
}

interface UsersShowProps {
    user: User
}

export default function Show({ user }: UsersShowProps) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(`/users/${user.id}`)
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
        <AppLayout title="User Details">
            <Head title={`User: ${user.name}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/users">
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Users
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-3">
                            <UsersIcon className="h-8 w-8 text-emerald-600" />
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">User Details</h1>
                                <p className="text-gray-600">View user information and permissions</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={`/users/${user.id}/edit`}>
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">User Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <span>User ID</span>
                            </label>
                            <p className="mt-1 text-lg text-gray-900">#{user.id}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <span>Status</span>
                            </label>
                            <div className="mt-1">
                                <Badge 
                                    variant={user.is_active ? "default" : "secondary"}
                                    className={user.is_active ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"}
                                >
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <UsersIcon className="h-4 w-4" />
                                <span>Full Name</span>
                            </label>
                            <p className="mt-1 text-lg font-semibold text-gray-900">{user.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Mail className="h-4 w-4" />
                                <span>Email Address</span>
                            </label>
                            <p className="mt-1 text-lg text-gray-900">{user.email}</p>
                        </div>
                        {user.employee_id && (
                            <div>
                                <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                    <IdCard className="h-4 w-4" />
                                    <span>Employee ID</span>
                                </label>
                                <p className="mt-1 text-lg text-gray-900">{user.employee_id}</p>
                            </div>
                        )}
                        {user.phone && (
                            <div>
                                <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                    <Phone className="h-4 w-4" />
                                    <span>Phone Number</span>
                                </label>
                                <p className="mt-1 text-lg text-gray-900">{user.phone}</p>
                            </div>
                        )}
                        {user.department && (
                            <div>
                                <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                    <Building className="h-4 w-4" />
                                    <span>Department</span>
                                </label>
                                <p className="mt-1 text-lg text-gray-900">{user.department}</p>
                            </div>
                        )}
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-500 flex items-center space-x-2 mb-2">
                                <Shield className="h-4 w-4" />
                                <span>Roles & Permissions</span>
                            </label>
                            <div className="mt-1 flex flex-wrap gap-2">
                                {getRoleBadges(user.roles)}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Created At</span>
                            </label>
                            <p className="mt-1 text-gray-900">{user.created_at}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Updated At</span>
                            </label>
                            <p className="mt-1 text-gray-900">{user.updated_at}</p>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    )
}

