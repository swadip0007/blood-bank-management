'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HospitalPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/hospital/dashboard')
  }, [router])

  return null
}

