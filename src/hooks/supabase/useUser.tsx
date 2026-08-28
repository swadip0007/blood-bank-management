import { supabase } from '@/lib/supabase';
import { UserResponse } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react'

const useUser = () => {

    const [user, setUser] = useState<UserResponse | null>(null);

    const getUser = () => {
        supabase.auth.getUser().then((data) => {
            setUser(data)
        }).catch(() => {
            setUser(null)
        })
    }


    useEffect(() => {
        getUser()
    }, [])


    return {
        getUser, user
    }

}

export default useUser