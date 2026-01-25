import React, { ReactNode } from 'react'
import { Head } from '@inertiajs/react'
import Sidebar from '@/components/Sidebar'

interface Props {
    children: ReactNode
    title?: string
}

export default function AppLayout({ children, title }: Props) {
    return (
        <>
            <Head title={title} />
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </>
    )
}
