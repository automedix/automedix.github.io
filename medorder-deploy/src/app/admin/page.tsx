'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Admin() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [status])

  if (status === 'loading') return <div className="p-8">Laden...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Bereich</h1>
      <div className="bg-white p-6 rounded shadow">
        <p>Hier kommen später die Bestellungen rein.</p>
      </div>
    </div>
  )
}
