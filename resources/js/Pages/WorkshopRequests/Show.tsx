import React from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

declare const route: any

interface WR {
  id: number
  description: string
  status: 'pending' | 'processed' | 'cancelled'
  created_at: string
  updated_at: string
}

export default function Show({ request }: { request: WR }) {
  const onDelete = () => {
    if (confirm('Delete this request?')) {
      router.delete(route('workshop-requests.destroy', request.id))
    }
  }

  return (
    <AppLayout title={`Request #${request.id}`}>
      <Head title={`Request #${request.id}`} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={route('workshop-requests.index')}>
              <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Workshop Request #{request.id}</h1>
              <p className="text-gray-600">Status: <span className="capitalize">{request.status}</span></p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href={route('workshop-requests.edit', request.id)}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white"><Edit className="h-4 w-4 mr-2" />Edit</Button>
            </Link>
            <Button variant="outline" className="text-red-600 hover:text-red-800" onClick={onDelete}><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
          </div>
        </div>

        <Card className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600">Description</p>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: request.description }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="text-gray-900">{formatDate(request.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Updated At</p>
              <p className="text-gray-900">{formatDate(request.updated_at)}</p>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}

