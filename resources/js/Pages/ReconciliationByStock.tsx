import React, { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { Link } from '@inertiajs/react'

declare const route: any

type Status = 'match' | 'mismatch'

interface Row {
  stock_no: string
  expected_pcs: number
  expected_weight: number
  actual_pcs: number
  actual_weight: number
  diff_pcs: number
  diff_weight: number
  status: Status
}

interface Props {
  rows: Row[]
  summary: {
    total_stock: number
    matches: number
    mismatches: number
  }
  filters: {
    search?: string
  }
}

export default function ReconciliationByStock({ rows, summary, filters }: Props) {
  const [search, setSearch] = useState<string>(filters?.search || '')

  const doSearch = () => {
    router.get(route('reconciliation.by-stock'), { search }, { replace: true, preserveState: true })
  }

  const statusBadge = (s: Status) => {
    const cls = s === 'match' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
    return <Badge className={cls}>{s === 'match' ? 'Match' : 'Mismatch'}</Badge>
  }

  return (
    <AppLayout title="Reconciliation by Stock No">
      <Head title="Reconciliation by Stock No" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Reconciliation by Stock No</h1>
            <p className="text-gray-600">
              Compare expected (open vouchers) vs actual inventory, aggregated by stock number.
            </p>
          </div>
        </div>

        <Card className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Filter by stock no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'ENTER' || e.key === 'Enter') doSearch() }}
              />
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={doSearch}>
              Search
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Stock Nos</p>
            <p className="text-2xl font-semibold">{summary.total_stock}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Matches</p>
            <p className="text-2xl font-semibold text-emerald-700">{summary.matches}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Mismatches</p>
            <p className="text-2xl font-semibold text-yellow-700">{summary.mismatches}</p>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-900">Stock No</th>
                  <th className="text-right p-3 font-medium text-gray-900">Expected Pcs</th>
                  <th className="text-right p-3 font-medium text-gray-900">Expected Wt</th>
                  <th className="text-right p-3 font-medium text-gray-900">Actual Pcs</th>
                  <th className="text-right p-3 font-medium text-gray-900">Actual Wt</th>
                  <th className="text-right p-3 font-medium text-gray-900">Δ Pcs</th>
                  <th className="text-right p-3 font-medium text-gray-900">Δ Wt</th>
                  <th className="text-center p-3 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.length ? (
                  rows.map((r) => (                    
                      <tr key={r.stock_no} className="border-b border-gray-100">
                        <td className="p-3 text-gray-900"><Link href={route('vouchers-groups.show', r.stock_no)}>{r.stock_no}</Link></td>
                        <td className="p-3 text-right text-gray-700">{r.expected_pcs}</td>
                        <td className="p-3 text-right text-gray-700">{r.expected_weight.toFixed(2)}</td>
                        <td className="p-3 text-right text-gray-700">{r.actual_pcs}</td>
                        <td className="p-3 text-right text-gray-700">{r.actual_weight.toFixed(2)}</td>
                        <td className={`p-3 text-right ${r.diff_pcs === 0 ? 'text-gray-700' : 'text-red-600'}`}>{r.diff_pcs}</td>
                        <td className={`p-3 text-right ${Math.abs(r.diff_weight) < 0.0001 ? 'text-gray-700' : 'text-red-600'}`}>{r.diff_weight.toFixed(2)}</td>
                        <td className="p-3 text-center">{statusBadge(r.status)}</td>
                      </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-6 text-center text-gray-500" colSpan={8}>No data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}

