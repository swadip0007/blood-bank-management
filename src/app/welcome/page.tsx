
"use client"
import useUser from '@/hooks/supabase/useUser'
import { supabase } from '@/lib/supabase';
import { Button } from '@mui/material';
import React from 'react'

const Page = () => {




    const {user}=useUser();
    // const router

    // akane useEffect diye redirect korte hbe as per role
  return (
    <div>
        {
            JSON.stringify(user)
        }
        <Button onClick={()=>{
            supabase.auth.signOut().then(()=>{
                window.location.href="/login"
            })
        }}>Logout</Button>
    </div>
  )
}

export default Page