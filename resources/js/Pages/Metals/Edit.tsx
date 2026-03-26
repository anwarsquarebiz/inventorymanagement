import React from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    ArrowLeft,
    Save
} from 'lucide-react'

interface Metal {
    id: number
    name: string
}

interface EditMetalProps {
    metal: Metal
}

export default function Edit({ metal }: EditMetalProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: metal.name,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('metals.update', metal.id));
    };

    return (
        <AppLayout title="Edit Metal">
            <Head title="Edit Metal" />
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href={route('metals.index')}>
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Metals
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Edit Metal</h1>
                        <p className="text-gray-600">Update metal information</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Metal Information</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Metal Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., White Gold (WG), Yellow Gold (YG)"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Link href={route('metals.index')}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Updating...' : 'Update Metal'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
