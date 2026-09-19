import { Database } from '../../../database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type UserRole = 'Admin' | 'Donor' | 'Hospital' | 'admin' | 'donor' | 'hospital';
export type Appointment = Database['public']['Tables']['appointment']['Row'];
export type Blood = Database['public']['Tables']['blood']['Row'];
export type Donor = Database['public']['Tables']['donor']['Row'];
export type Hospital = Database['public']['Tables']['hospital']['Row'];
export type Request = Database['public']['Tables']['request']['Row'];
