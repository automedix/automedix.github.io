'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function NewOrder() {
  const { status } = useSession()
  const router = useRouter()

  if (status === 'loading') return <div className="p-8">Laden...</div>
  if (status === 'unauthenticated') { router.push('/login'); return null }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Neue Bestellung</h1>
      <div className="bg-white p-6 rounded shadow">
        <p>Bestellformular kommt hier hin.</p>
      </div>
    </div>
  )
}
