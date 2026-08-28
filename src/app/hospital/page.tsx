'use client'
import { useEffect, useState } from 'react'


import { useRouter } from 'next/navigation'

const page = () => {

  const router = useRouter();

  useEffect(() => {
    router.push('/hospital/dashboard')
  }, [])

  return null
}

export default page
