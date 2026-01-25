import React from 'react'
import { Head, useForm } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Shield } from 'lucide-react'
import { Link } from '@inertiajs/react'

interface Permission {
    id: number
    name: string
}

interface RolesCreateProps {
    permissions: Permission[]
}

export default function RolesCreate({ permissions }: RolesCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [] as number[],
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post('/roles')
    }

    const handlePermissionChange = (permissionId: number, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permissionId])
        } else {
            setData('permissions', data.permissions.filter(id => id !== permissionId))
        }
    }

    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc, permission) => {
        const category = permission.name.split(' ')[0] // Get first word as category
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(permission)
        return acc
    }, {} as Record<string, Permission[]>)

    return (
        <AppLayout title="Create Role">
            <Head title="Create Role" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link href="/roles">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Roles
                        </Button>
                    </Link>
                    <div className="flex items-center space-x-3">
                        <Shield className="h-8 w-8 text-emerald-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Create New Role</h1>
                            <p className="text-gray-600">Add a new role and assign permissions</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Role Information</CardTitle>
                        <CardDescription>
                            Enter the role name and assign appropriate permissions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Role Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Role Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={errors.name ? 'border-red-500' : ''}
                                    placeholder="Enter role name (e.g., admin, manager)"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Permissions */}
                            {permissions.length > 0 && (
                                <div className="space-y-4">
                                    <Label>Assign Permissions</Label>
                                    <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                                        {Object.entries(groupedPermissions).map(([category, perms]) => (
                                            <div key={category} className="mb-6 last:mb-0">
                                                <h4 className="text-sm font-semibold text-gray-700 mb-3 capitalize">
                                                    {category} Permissions
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {perms.map((permission) => (
                                                        <div key={permission.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`permission-${permission.id}`}
                                                                checked={data.permissions.includes(permission.id)}
                                                                onCheckedChange={(checked) => 
                                                                    handlePermissionChange(permission.id, !!checked)
                                                                }
                                                            />
                                                            <Label htmlFor={`permission-${permission.id}`} className="text-sm font-normal cursor-pointer">
                                                                {permission.name}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.permissions && (
                                        <p className="text-sm text-red-600">{errors.permissions}</p>
                                    )}
                                </div>
                            )}

                            {/* Submit Buttons */}
                            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                                <Link href="/roles">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Role'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}

