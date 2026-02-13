'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status])

  if (status === 'loading') return <div className="p-8">Laden...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/order/new" className="p-6 bg-white rounded shadow hover:shadow-md">
          <div className="text-2xl mb-2">+</div>
          <div className="font-bold">Neue Bestellung</div>
        </Link>
        <div className="p-6 bg-white rounded shadow">
          <div className="text-gray-500">Coming Soon</div>
        </div>
      </div>
    </div>
  )
}
