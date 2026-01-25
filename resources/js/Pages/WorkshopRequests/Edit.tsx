import React from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import 'quill/dist/quill.snow.css'
import ReactQuill from 'react-quill-new'
import { ArrowLeft, Save } from 'lucide-react'
declare const route: any

interface WR {
  id: number
  description: string
  status: 'pending' | 'processed' | 'cancelled'
}

export default function Edit({ request }: { request: WR }) {
  const { data, setData, put, processing, errors } = useForm({
    description: request.description,
    status: request.status as 'pending' | 'processed' | 'cancelled',
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    put(route('workshop-requests.update', request.id))
  }

  return (
    <AppLayout title="Edit Workshop Request">
      <Head title="Edit Workshop Request" />
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href={route('workshop-requests.index')}>
            <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Workshop Request</h1>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <div className={errors.description ? 'border border-red-500 rounded' : ''}>
                <ReactQuill theme="snow" value={data.description} onChange={(value) => setData('description', value)} />
              </div>
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select id="status" value={data.status} onChange={(e) => setData('status', e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="pending">Pending</option>
                <option value="processed">Processed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              {processing ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}

