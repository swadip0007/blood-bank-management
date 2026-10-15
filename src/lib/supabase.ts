import { createClient } from '@supabase/supabase-js'
import { Database } from '../../database.types'


const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
// Normalize URL: remove accidental whitespace, trailing slashes, and paths like /rest/v1 or /auth/v1
const supabaseUrl = rawSupabaseUrl
  .trim()
  .replace(/\/rest\/v1\/?$/, '')
  .replace(/\/auth\/v1\/?$/, '')
  .replace(/\/+$/, '')

const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)