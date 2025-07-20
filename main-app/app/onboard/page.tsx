'use client'

import { useRouter } from 'next/navigation'

export default function OnboardPage() {
  const router = useRouter()

  const handleSelectRole = (role: string) => {
    localStorage.setItem('userRole', role)
    router.push('/dashboard')
  }

  return (
    <div className="max-w-md mx-auto p-6 text-center space-y-4">
      <h2 className="text-2xl font-bold">Choose your role:</h2>
      <button onClick={() => handleSelectRole('researcher')} className="bg-blue-600 text-white py-2 rounded w-full">
        🧬 Researcher
      </button>
      <button onClick={() => handleSelectRole('funder')} className="bg-green-600 text-white py-2 rounded w-full">
        💰 Funder
      </button>
      <button onClick={() => handleSelectRole('validator')} className="bg-purple-600 text-white py-2 rounded w-full">
        ✅ Validator
      </button>
    </div>
  )
}