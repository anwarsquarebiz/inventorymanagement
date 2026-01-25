import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react'
declare const route: any

interface WR {
  id: number
  description: string
  status: 'pending' | 'processed' | 'cancelled'
  created_at: string
}

interface Props {
  requests: {
    data: WR[]
    links: any[]
    meta: any
  }
  filters: {
    search?: string
    status?: string
  }
}

export default function Index({ requests, filters }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '')
  const [status, setStatus] = useState(filters.status || '')

  const handleSearch = () => {
    router.get(route('workshop-requests.index'), { search: searchTerm, status: status || undefined }, { preserveState: true, replace: true })
  }

  const handleDelete = (id: number) => {
    if (confirm('Delete this request?')) {
      router.delete(route('workshop-requests.destroy', id))
    }
  }

  return (
    <AppLayout title="Workshop Requests">
      <Head title="Workshop Requests" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Workshop Requests</h1>
            <p className="text-gray-600">Create and track workshop processing requests</p>
          </div>
          <Link href={route('workshop-requests.create')}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </Link>
        </div>

        <Card className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="processed">Processed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white">Filter</Button>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-4 font-medium text-gray-900">ID</th>
                  <th className="text-left p-4 font-medium text-gray-900">Description</th>
                  <th className="text-left p-4 font-medium text-gray-900">Status</th>
                  <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.data.length === 0 ? (
                  <tr><td className="p-8 text-center text-gray-500" colSpan={4}>No requests found.</td></tr>
                ) : requests.data.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 text-gray-600">#{r.id}</td>
                    <td className="p-4 text-gray-900">
                      <div className="prose max-w-none line-clamp-3" dangerouslySetInnerHTML={{ __html: r.description }} />
                    </td>
                    <td className="p-4 capitalize text-gray-700">{r.status.replace('_',' ')}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Link href={route('workshop-requests.show', r.id)}>
                          <Button size="sm" variant="outline"><Eye className="h-3 w-3 mr-1" />View</Button>
                        </Link>
                        <Link href={route('workshop-requests.edit', r.id)}>
                          <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-800"><Edit className="h-3 w-3 mr-1" />Edit</Button>
                        </Link>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-800" onClick={() => handleDelete(r.id)}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}

