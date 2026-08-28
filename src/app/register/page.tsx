"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Link as MuiLink,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  FormHelperText,
} from '@mui/material'
import {
  Person,
  Email,
  Phone,
  Lock,
  LocationOn,
  AccountCircle,
} from '@mui/icons-material'
import { useAuth } from '@/components/AuthProvider'
import { registerSchema, type RegisterFormData } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const { signUp } = useAuth()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      phone: '',
      role: 'Donor',
      address: '',
    },
    mode: 'onChange'
  })

  const onSubmit = async (_data: RegisterFormData) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
  
      const cleanedPhone = _data.phone.replace(/\D/g, '')
      const formattedPhone = cleanedPhone.length === 10
        ? `+91${cleanedPhone}`
        : _data.phone

      const { data, error } = await supabase.auth.signUp({
        email: _data.email.toLowerCase().trim(),
        password: _data.password,
        phone: formattedPhone,
        options: {
          emailRedirectTo: "http://localhost:3000/welcome",
          data: {

            full_name: _data.full_name.trim(),
            phone: formattedPhone,
            role: _data.role,
            address: _data.address?.trim() || ''
          }
        }
      })
      if (data.user) {
        await supabase.from('profiles').insert({
          user_id: data.user.id,
          full_name: _data.full_name.trim(),
          phone: formattedPhone,
          role: _data.role,
          address: _data.address?.trim() || '',
          email: _data.email.toLowerCase().trim()
        })
        // router.push('/login')
      }



      console.log(error, "sign up")

      if (error) {
        setError(error.message)
      } else {
        setSuccess(
          'Registration successful! Please check your email to verify your account before logging in.'
        )
        reset()
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Header */}
        <Card elevation={0} sx={{ mb: 3, backgroundColor: 'transparent' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <AccountCircle
              sx={{
                fontSize: 60,
                color: 'primary.main',
                mb: 1
              }}
            />
            <Typography
              component="h1"
              variant="h3"
              color="primary"
              gutterBottom
            >
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join our blood donation community and help save lives
            </Typography>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: 600 }}>
          {/* Alert Messages */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              {/* Personal Information Section */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary">
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  {/* Full Name */}
                  <Controller
                    name="full_name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        required
                        fullWidth
                        label="Full Name"
                        error={!!errors.full_name}
                        helperText={errors.full_name?.message}
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                        placeholder="Enter your full name"
                      />
                    )}
                  />

                  {/* Email */}
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        required
                        fullWidth
                        label="Email Address"
                        type="email"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        InputProps={{
                          startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                        placeholder="Enter your email address"
                      />
                    )}
                  />

                  {/* Phone */}
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        required
                        fullWidth
                        label="Phone Number"
                        error={!!errors.phone}
                        helperText={errors.phone?.message || "Format: +91 98765 43210"}
                        InputProps={{
                          startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                        placeholder="+91 98765 43210"
                      />
                    )}
                  />

                  {/* Address */}
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Address (Optional)"
                        multiline
                        rows={2}
                        error={!!errors.address}
                        helperText={errors.address?.message}
                        InputProps={{
                          startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} />,
                        }}
                        placeholder="Enter your address"
                      />
                    )}
                  />
                </Stack>
              </Box>

              {/* Account Information Section */}
              <Box>
                <Typography variant="h6" gutterBottom color="primary">
                  Account Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  {/* Role Selection */}
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth required error={!!errors.role}>
                        <InputLabel>Register As</InputLabel>
                        <Select
                          {...field}
                          label="Register As"
                        >
                          <MenuItem value="Donor">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Person sx={{ color: 'primary.main' }} />
                              <Box>
                                <Typography variant="body1">Blood Donor</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Donate blood and save lives
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                          <MenuItem value="Hospital">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationOn sx={{ color: 'primary.main' }} />
                              <Box>
                                <Typography variant="body1">Hospital</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Request blood for patients
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                          <MenuItem value="Admin">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccountCircle sx={{ color: 'primary.main' }} />
                              <Box>
                                <Typography variant="body1">Administrator</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Manage the system
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        </Select>
                        {errors.role && (
                          <FormHelperText>{errors.role.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />

                  {/* Password */}
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        required
                        fullWidth
                        label="Password"
                        type="password"
                        error={!!errors.password}
                        helperText={errors.password?.message || "Minimum 6 characters"}
                        InputProps={{
                          startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                        placeholder="Enter your password"
                      />
                    )}
                  />

                  {/* Confirm Password */}
                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        required
                        fullWidth
                        label="Confirm Password"
                        type="password"
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        InputProps={{
                          startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                        placeholder="Confirm your password"
                      />
                    )}
                  />
                </Stack>
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !isValid}
                sx={{
                  mt: 3,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    Creating Account...
                  </Box>
                ) : (
                  'Create Account'
                )}
              </Button>

              {/* Login Link */}
              <Box textAlign="center" mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <MuiLink
                    onClick={() => router.push('/login')}
                    variant="body2"
                    sx={{
                      cursor: 'pointer',
                      color: 'primary.main',
                      fontWeight: 600,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Sign In
                  </MuiLink>
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>

        {/* Additional Information */}
        <Box sx={{ mt: 3, textAlign: 'center', maxWidth: 500 }}>
          <Typography variant="body2" color="text.secondary">
            By creating an account, you agree to our terms of service and privacy policy.
            Your information will be used to facilitate blood donations and improve healthcare services.
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}
