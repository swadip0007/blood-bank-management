'use client'

import { Typography, Paper, Box } from '@mui/material'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function DashboardPage() {
  return (
    <>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: '#1e1e1e',
          color: '#fff',
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="gray">
          Welcome to the Blood Bank Dashboard.  
          Here you can monitor hospital stats, donor info, and system updates.
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Quick Overview</Typography>
          <Typography variant="body2" color="gray">
            (You can add charts, summaries, or analytics here.)
          </Typography>
        </Box>
      </Paper>
    </>
  )
}
