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
  Container,
  Box,
  Avatar,
} from '@mui/material'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

// ✅ Validation schema
const hospitalSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Hospital name is required'),
  address: z.string().min(5, 'Address is required'),
  contact_number: z.string().min(10, 'Valid contact required'),
  profile_pic: z.string().optional(),
  user_id: z.string().optional(),
})

type HospitalForm = z.infer<typeof hospitalSchema>

export default function SettingsPage() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null);
  const [hospital, setHospital] = useState<HospitalForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<HospitalForm>({
    resolver: zodResolver(hospitalSchema) as any,
    defaultValues: {
      name: '',
      address: '',
      contact_number: '',
      profile_pic: '',
    },
  })

  // ✅ Fetch hospital info for logged-in user
  useEffect(() => {
    if (user) fetchHospital()
  }, [user])

  const fetchHospital = async () => {
    if (!user) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('hospital')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error
      if (data) {
        setHospital({
          id: data.id,
          name: data.hospital_name,
          address: data.address || '',
          contact_number: data.contact_number ? String(data.contact_number) : '',
          profile_pic: data.profile_pic || '',
          user_id: data.user_id || '',
        })
        reset({
          name: data.hospital_name,
          address: data.address || '',
          contact_number: data.contact_number ? String(data.contact_number) : '',
          profile_pic: data.profile_pic || '',
        })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Upload image for preview (not saved yet)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file || !user?.id) return
      setFile(file)
      setUploading(true)


      // if (error) throw error

      // // Temporarily store file name for later save
      // setUploadedFileName(fileName)

      // Show preview immediately
      setValue('profile_pic', URL.createObjectURL(file))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  // ✅ Save or update profile (image + details together)
  const onSubmit = async (formData: HospitalForm) => {
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      let imageUrl = ""

      // If new image uploaded, get public URL
      // if (uploadedFileName) {
      //   const { data: publicUrlData } = supabase.storage
      //     .from('hospital-avatars')
      //     .getPublicUrl(uploadedFileName)
      //   imageUrl = publicUrlData.publicUrl
      // }

      if (!user) return;

      let fileName = ""


      if (!!file) {
        fileName = `${user.id}-${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
          .from('hospital-avatars')
          .upload(fileName, file);

        const { data: publicUrlData } = supabase.storage
          .from('hospital-avatars')
          .getPublicUrl(fileName)

        imageUrl = publicUrlData.publicUrl;

      }



      if (!user) throw new Error('User not authenticated')

      const parsedContact = formData.contact_number
        ? parseInt(formData.contact_number.replace(/\D/g, ''), 10) || null
        : null

      if (hospital?.id) {
        const { error } = await supabase
          .from('hospital')
          .update({
            hospital_name: formData.name,
            address: formData.address,
            contact_number: parsedContact,
            profile_pic: imageUrl,
          })
          .eq('id', hospital.id)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('hospital')
          .insert([
            {
              hospital_name: formData.name,
              address: formData.address,
              contact_number: parsedContact,
              profile_pic: imageUrl,
              user_id: user.id,
            },
          ])
          .select()
          .single()
        if (error) throw error
        if (data) {
          setHospital({
            id: data.id,
            name: data.hospital_name,
            address: data.address || '',
            contact_number: data.contact_number ? String(data.contact_number) : '',
            profile_pic: data.profile_pic || '',
            user_id: data.user_id || '',
          })
        }
      }

      setSuccess(true)
      setUploadedFileName(null)
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
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1e1e1e, #2d2d3a)',
          color: '#fff',
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
          Hospital Profile
        </Typography>
        <Typography variant="body2" color="gray" mb={3} align="center">
          Manage or update your hospital registration details.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Profile saved successfully!
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit as any)}>
          <Grid container spacing={2}>
            {/* ✅ Profile Picture Section */}
            <Grid item xs={12} sx={{ textAlign: 'center' }}>
              <Controller
                name="profile_pic"
                control={control}
                render={({ field }) => (
                  <>
                    <Avatar
                      src={field.value || '/default-avatar.png'}
                      sx={{
                        width: 100,
                        height: 100,
                        mx: 'auto',
                        mb: 2,
                        border: '2px solid #8b5cf6',
                      }}
                    />
                    <Button
                      variant="contained"
                      component="label"
                      disabled={uploading}
                      sx={{ background: '#6366f1', mb: 2 }}
                    >
                      {uploading ? 'Uploading...' : 'Upload Image'}
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </Button>
                  </>
                )}
              />
            </Grid>

            {/* Hospital Name */}
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Hospital Name"
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    InputLabelProps={{ style: { color: '#ccc' } }}
                    InputProps={{ style: { color: '#fff' } }}
                  />
                )}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Address"
                    fullWidth
                    required
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    InputLabelProps={{ style: { color: '#ccc' } }}
                    InputProps={{ style: { color: '#fff' } }}
                  />
                )}
              />
            </Grid>

            {/* Contact Number */}
            <Grid item xs={12}>
              <Controller
                name="contact_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contact Number"
                    fullWidth
                    required
                    error={!!errors.contact_number}
                    helperText={errors.contact_number?.message}
                    InputLabelProps={{ style: { color: '#ccc' } }}
                    InputProps={{ style: { color: '#fff' } }}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={saving}
            sx={{
              mt: 3,
              py: 1.2,
              background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
              borderRadius: 2,
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              },
            }}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </Paper>
    </Container>
  )
}
