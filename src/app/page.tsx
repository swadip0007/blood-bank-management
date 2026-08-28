'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '../components/AuthProvider'
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack
} from '@mui/material'
import {
  LocalHospital,
  People,
  AdminPanelSettings
} from '@mui/icons-material'

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  console.log(user?.user_metadata?.role)

  return (
    <Container maxWidth="lg">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        textAlign="center"
        gap={4}
      >
        <Box>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            color="primary"
            fontWeight="bold"
          >
            Blood Bank Management
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            mb={4}
            maxWidth={600}
          >
            Connecting donors, hospitals, and saving lives through efficient
            blood donation management
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              textAlign: 'center',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
          >
            <People sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Blood Donors
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Register, schedule appointments, and track donations
            </Typography>
          </Paper>

          <Paper
            elevation={3}
            sx={{
              p: 3,
              textAlign: 'center',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
          >
            <LocalHospital sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Hospitals
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Request and manage blood stock efficiently
            </Typography>
          </Paper>

          <Paper
            elevation={3}
            sx={{
              p: 3,
              textAlign: 'center',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
          >
            <AdminPanelSettings sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Administrators
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage users, donations, and reports
            </Typography>
          </Paper>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/login')}
            sx={{ minWidth: 120 }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push('/register')}
            sx={{ minWidth: 120 }}
          >
            Register
          </Button>
        </Stack>
      </Box>
    </Container>
  )
}
