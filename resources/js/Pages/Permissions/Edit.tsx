import React from 'react'
import { Head, useForm } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Key } from 'lucide-react'
import { Link } from '@inertiajs/react'

interface Permission {
    id: number
    name: string
}

interface PermissionsEditProps {
    permission: Permission
}

export default function PermissionsEdit({ permission }: PermissionsEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: permission.name || '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        put(`/permissions/${permission.id}`)
    }

    return (
        <AppLayout title="Edit Permission">
            <Head title="Edit Permission" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link href="/permissions">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Permissions
                        </Button>
                    </Link>
                    <div className="flex items-center space-x-3">
                        <Key className="h-8 w-8 text-emerald-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Permission</h1>
                            <p className="text-gray-600">Update permission information</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Permission Information</CardTitle>
                        <CardDescription>
                            Update the permission name. Use lowercase with spaces.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Permission Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Permission Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={errors.name ? 'border-red-500' : ''}
                                    placeholder="Enter permission name"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name}</p>
                                )}
                                <p className="text-xs text-gray-500">
                                    Use lowercase letters and spaces. Examples: "view users", "create inventory"
                                </p>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                                <Link href="/permissions">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Permission'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}

