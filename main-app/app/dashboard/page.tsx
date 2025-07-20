'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

export default function DashboardPage() {
  const { isConnected } = useAccount()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    if (!isConnected) {
      window.location.href = '/'
    } else {
      const savedRole = localStorage.getItem('userRole')
      if (!savedRole) {
        window.location.href = '/onboard'
      } else {
        setRole(savedRole)
      }
    }
  }, [isConnected])

  if (!role) return <p className="text-center mt-10">Loading dashboard...</p>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {role === 'researcher' && (
        <>
          <p className="mb-2">🧬 You are a Researcher.</p>
          <a href="/submit-study" className="text-blue-600 underline">
            Submit New Research
          </a>
        </>
      )}

      {role === 'funder' && (
        <>
          <p className="mb-2">💰 You are a Funder.</p>
          <a href="/fund" className="text-green-600 underline">
            Browse & Fund Research Bounties
          </a>
        </>
      )}

      {role === 'validator' && (
        <>
          <p className="mb-2">✅ You are a Validator.</p>
          <a href="/validate" className="text-purple-600 underline">
            View Open Bounties to Validate
          </a>
        </>
      )}
    </div>
  )
}
