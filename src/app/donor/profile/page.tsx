'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  MenuItem,
  Box,
  Avatar,
  Divider,
} from '@mui/material'
import BloodtypeIcon from '@mui/icons-material/Bloodtype'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

const donorSchema = z.object({
  blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  id: z.string().optional(),
  last_donation_date: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'Invalid date (YYYY-MM-DD)'
    ),
})

type DonorForm = z.infer<typeof donorSchema>

export default function DonorProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DonorForm>({
    resolver: zodResolver(donorSchema),
    defaultValues: {
      blood_group: '',
      last_donation_date: '',
    },
  })

  useEffect(() => {
    if (user) fetchDonorData()
  }, [user])

  const fetchDonorData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('donor')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle()

      if (error) throw error

      if (data) {
        reset({
          blood_group: data.blood_group || '',
          last_donation_date: data.last_donation_date
            ? new Date(data.last_donation_date).toISOString().split('T')[0]
            : '',
          id: data.id,
        })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (formData: DonorForm) => {
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      if (formData.id) {
        const { error: editErr } = await supabase
          .from('donor')
          .update({
            user_id: user?.id,
            blood_group: formData.blood_group,
            last_donation_date: formData.last_donation_date
              ? new Date(formData.last_donation_date).toISOString()
              : null,
          })
          .eq('id', formData.id)

        if (editErr) throw editErr
      } else {
        const { error } = await supabase.from('donor').insert({
          user_id: user?.id,
          blood_group: formData.blood_group,
          last_donation_date: formData.last_donation_date
            ? new Date(formData.last_donation_date).toISOString()
            : null,
        })

        if (error) throw error
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    )

  return (
    <Box>
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #F7F2FF, #EDE2FF)',
          border: '1px solid #E0C8FF',
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 90,
              height: 90,
              margin: '0 auto',
              bgcolor: '#CEB4FF',
              color: '#4A148C',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            }}
          >
            <BloodtypeIcon sx={{ fontSize: 48 }} />
          </Avatar>

          <Typography
            variant="h4"
            fontWeight="bold"
            mt={2}
            sx={{ color: '#4A148C' }}
          >
            Donor Profile
          </Typography>

          <Typography variant="body2" sx={{ color: '#6A1B9A' }}>
            Update your donor information
          </Typography>
        </Box>

        <Divider sx={{ borderColor: '#E0C8FF', mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Profile updated successfully!
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {/* Blood Group */}
            <Grid item xs={12}>
              <Controller
                name="blood_group"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Blood Group"
                    fullWidth
                    required
                    error={!!errors.blood_group}
                    helperText={errors.blood_group?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        borderRadius: 2,
                      },
                    }}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                      (group) => (
                        <MenuItem key={group} value={group}>
                          {group}
                        </MenuItem>
                      )
                    )}
                  </TextField>
                )}
              />
            </Grid>

            {/* Last Donation Date */}
            <Grid item xs={12}>
              <Controller
                name="last_donation_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Donation Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.last_donation_date}
                    helperText={errors.last_donation_date?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Save Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={saving}
            sx={{
              mt: 3,
              py: 1.2,
              background: 'linear-gradient(90deg, #CEB4FF, #B388FF)',
              borderRadius: 2,
              color: '#4A148C',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(90deg, #B388FF, #CEB4FF)',
              },
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Paper>
    </Box>
  )
}
