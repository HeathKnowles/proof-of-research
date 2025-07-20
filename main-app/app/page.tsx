'use client'

import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Home() {
  const { isConnected } = useAccount()

  useEffect(() => {
    if (isConnected) {
      window.location.href = '/onboard'
    }
  }, [isConnected])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-3xl font-bold mb-4">Proof of Research</h1>
      <p className="mb-4">Please connect your wallet to get started.</p>
      <ConnectButton />
    </div>
  )
}
