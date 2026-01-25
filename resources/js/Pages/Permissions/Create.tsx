import React from 'react'
import { Head, useForm } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Key } from 'lucide-react'
import { Link } from '@inertiajs/react'

interface PermissionsCreateProps {
}

export default function PermissionsCreate({}: PermissionsCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post('/permissions')
    }

    return (
        <AppLayout title="Create Permission">
            <Head title="Create Permission" />
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
                            <h1 className="text-2xl font-bold text-gray-900">Create New Permission</h1>
                            <p className="text-gray-600">Add a new permission to the system</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Permission Information</CardTitle>
                        <CardDescription>
                            Enter the permission name. Use lowercase with spaces (e.g., "view users", "create inventory").
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
                                    placeholder="Enter permission name (e.g., view users, create inventory)"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name}</p>
                                )}
                                <p className="text-xs text-gray-500">
                                    Use lowercase letters and spaces. Examples: "view users", "create inventory", "edit vouchers"
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
                                    {processing ? 'Creating...' : 'Create Permission'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}

