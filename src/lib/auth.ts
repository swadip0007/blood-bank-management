// // src/lib/auth.ts
// import { supabase } from './supabase'
// import { Profile,  UserRole} from '../types/database'

// export const signUp = async (
//   email: string, 
//   password: string, 
//   userData: {
//     full_name: string
//     phone: string
//     role: UserRole
//   }
// ) => {
//   const { data, error } = await supabase.auth.signUp({
//     email,
//     password,
//     options: {
//       data: {
//         full_name: userData.full_name,
//         phone: userData.phone,
//         role: userData.role
//       }
//     }
//   })
//   return { data, error }
// }

// export const signIn = async (email: string, password: string) => {
//   const { data, error } = await supabase.auth.signInWithPassword({
//     email,
//     password
//   })
//   return { data, error }
// }

// export const signOut = async () => {
//   const { error } = await supabase.auth.signOut()
//   return { error }
// }

// export const getCurrentUser = async () => {
//   const { data: { user } } = await supabase.auth.getUser()
//   return user
// }

// export const getUserProfile = async (userId: string): Promise<Profile | null> => {
//   const { data, error } = await supabase
//     .from('profiles')
//     .select('*')
//     .eq('user_id', userId)
//     .single()
  
//   if (error) {
//     console.error('Error fetching profile:', error)
//     return null
//   }
  
//   return data
// }

// export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
//   const { data, error } = await supabase
//     .from('profiles')
//     .update({ ...updates, updated_at: new Date().toISOString() })
//     .eq('user_id', userId)
//     .select()
//     .single()
  
//   return { data, error }
// }


import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email is too long'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password')
    .min(6, 'Password must be at least 6 characters'),
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Full name can only contain letters, spaces, dots, hyphens, and apostrophes'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/, 
      'Please enter a valid Indian phone number (e.g., +91 98765 43210)'
    ),
  role: z.enum(['Admin', 'Donor', 'Hospital'], {
    message: 'Please select a valid role'
  }),
  address: z
    .string()
    .max(500, 'Address is too long')
    .optional()
    .or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>