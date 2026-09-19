'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Stack,
  Divider,
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import {
  Calendar,
  momentLocalizer,
  Views,
  Event as RBCEvent,
} from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

export default function AppointmentPage() {
  const { user } = useAuth()

  // Tabs & state
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Appointment + hospital
  const [appointments, setAppointments] = useState<any[]>([])
  const [hospitals, setHospitals] = useState<any[]>([])

  // Dialog: Book
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bloodGroup, setBloodGroup] = useState('')
  const [contact, setContact] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [selectedHospitalId, setSelectedHospitalId] = useState('')

  // Dialog: Info
  const [infoOpen, setInfoOpen] = useState(false)
  const [loadingRequest, setLoadingRequest] = useState(false)
  const [requestDetails, setRequestDetails] = useState<any[]>([])

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

  /** Fetch all hospitals */
  const fetchHospitals = async () => {
    const { data, error } = await supabase
      .from('hospital')
      .select('id, hospital_name')
      .order('hospital_name', { ascending: true })
    if (!error) setHospitals(data || [])
  }

  /** Fetch all appointments for this user */
  const fetchAppointments = async () => {
    if (!user?.id) return
    setLoading(true)
    setError('')
    const { data, error } = await supabase
      .from('appointment')
      .select('*')
      .eq('user_id', user.id)
      .order('scheduled_date', { ascending: false })
    if (error) setError(error.message)
    else {
      const mapped = (data || []).map((a: any) => ({
        ...a,
        hospital_name:
          hospitals.find((h) => h.id === a.hospital_id)?.hospital_name ||
          'Unknown Hospital',
      }))
      setAppointments(mapped)
    }
    setLoading(false)
  }

  /** Fetch request details linked to appointment */
  const fetchRequestDetails = async (appointmentId: string) => {
    setLoadingRequest(true)
    const { data, error } = await supabase
      .from('request')
      .select('*')
      .eq('appointment_id', appointmentId)
    setRequestDetails(error ? [] : data || [])
    setLoadingRequest(false)
  }

  /** Handle Info Click */
  const handleInfoClick = async (appointmentId: string) => {
    setInfoOpen(true)
    await fetchRequestDetails(appointmentId)
  }

  /** Handle Save Appointment */
  const handleAddAppointment = async () => {
    try {
      if (!user?.id) throw new Error('User not logged in')
      if (!selectedHospitalId) throw new Error('Select a hospital')
      if (!scheduledDate) throw new Error('Select a date')
      setSaving(true)

      const { error } = await supabase.from('appointment').insert([
        {
          blood_group: bloodGroup || null,
          contact_number: contact ? parseInt(contact.replace(/\D/g, ''), 10) || null : null,
          scheduled_date: scheduledDate,
          user_id: user.id,
          hospital_id: selectedHospitalId,
          status: 'Pending',
        },
      ])

      if (error) throw error

      setOpen(false)
      setBloodGroup('')
      setContact('')
      setScheduledDate('')
      setSelectedHospitalId('')
      fetchAppointments()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  /** Load hospitals first, then appointments */
  useEffect(() => {
    fetchHospitals()
  }, [])

  useEffect(() => {
    if (user && hospitals.length > 0) fetchAppointments()
  }, [user, hospitals])

  /** Grid Columns */
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 200 },
    { field: 'blood_group', headerName: 'Blood Group', width: 120 },
    { field: 'contact_number', headerName: 'Contact', width: 160 },
    { field: 'scheduled_date', headerName: 'Date', width: 160 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'hospital_name', headerName: 'Hospital', width: 200 },
    {
      field: 'actions',
      headerName: 'Info',
      width: 100,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => handleInfoClick(params.row.id)}
        >
          Info
        </Button>
      ),
    },
  ]

  /** Calendar Events */
  const events: RBCEvent[] = appointments.map((a) => ({
    title: `${a.hospital_name} (${a.blood_group || 'N/A'})`,
    start: new Date(a.scheduled_date),
    end: new Date(a.scheduled_date),
    allDay: true,
  }))

  return (
    <Box
      sx={{
        p: 4,
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #fff5f5 0%, #ffe6e6 50%, #fff 100%)',
      }}
    >
      <Paper
        elevation={5}
        sx={{
          p: 4,
          borderRadius: 4,
          maxWidth: 1100,
          mx: 'auto',
          backgroundColor: '#fff',
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4" fontWeight={700} color="error.main">
            🩸 Hospital Appointments
          </Typography>
          <Button
            variant="contained"
            color="error"
            sx={{
              borderRadius: 3,
              px: 3,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 10px rgba(239, 83, 80, 0.3)',
            }}
            onClick={() => setOpen(true)}
          >
            + Book Appointment
          </Button>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{
            mb: 3,
            background: 'linear-gradient(90deg, #e53935 0%, #ef5350 100%)',
            borderRadius: 3,
            p: 1,
            '& .MuiTab-root': {
              color: '#fff',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              mx: 1,
            },
            '& .Mui-selected': {
              backgroundColor: '#fff',
              color: '#e53935 !important',
            },
            '& .MuiTabs-indicator': { display: 'none' },
          }}
        >
          <Tab label="Table View" />
          <Tab label="Calendar View" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box textAlign="center" mt={5}>
            <CircularProgress color="error" />
            <Typography mt={2}>Loading appointments...</Typography>
          </Box>
        ) : (
          <>
            {tabValue === 0 && (
              <Box>
                <Paper
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid #ffcdd2',
                  }}
                >
                  <div style={{ height: 420, width: '100%' }}>
                    <DataGrid
                      rows={appointments}
                      columns={columns}
                      getRowId={(row) => row.id}
                    />
                  </div>
                </Paper>
              </Box>
            )}

            {tabValue === 1 && (
              <Paper
                elevation={3}
                sx={{ p: 3, borderRadius: 3, border: '1px solid #ffcdd2' }}
              >
                <Typography variant="h6" gutterBottom color="error.dark">
                  Calendar View
                </Typography>
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  views={[Views.MONTH, Views.WEEK, Views.DAY]}
                  style={{ height: 500 }}
                />
              </Paper>
            )}
          </>
        )}
      </Paper>

      {/* Book Appointment Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          🏥 Book Appointment
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Select Hospital"
            fullWidth
            margin="normal"
            value={selectedHospitalId}
            onChange={(e) => setSelectedHospitalId(e.target.value)}
          >
            <MenuItem value="">-- Select Hospital --</MenuItem>
            {hospitals.map((h) => (
              <MenuItem key={h.id} value={h.id}>
                {h.hospital_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Blood Group"
            fullWidth
            margin="normal"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
          >
            <MenuItem value="">-- Select Blood Group --</MenuItem>
            {bloodGroups.map((bg) => (
              <MenuItem key={bg} value={bg}>
                {bg}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Contact Number"
            fullWidth
            margin="normal"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />

          <TextField
            label="Scheduled Date"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddAppointment}
            disabled={saving}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 3,
              px: 3,
              textTransform: 'none',
            }}
          >
            {saving ? 'Saving...' : 'Save Appointment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Info Dialog */}
      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: 'error.main', fontWeight: 700 }}>
          Appointment Request Details
        </DialogTitle>
        <DialogContent>
          {loadingRequest ? (
            <Box textAlign="center" py={4}>
              <CircularProgress color="error" />
            </Box>
          ) : requestDetails.length === 0 ? (
            <Typography sx={{ mt: 2 }}>No request data found.</Typography>
          ) : (
            requestDetails.map((r, idx) => (
              <Paper
                key={idx}
                elevation={2}
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 3,
                  backgroundColor: '#fff5f5',
                }}
              >
                <Typography variant="subtitle2">
                  Request ID: <strong>{r.id}</strong>
                </Typography>
                <Typography>Donor ID: {r.donor_id}</Typography>
                <Typography>Contact: {r.contact_number}</Typography>
                <Typography>Email: {r.email_id}</Typography>
                <Typography>Requested Date: {r.requested_date}</Typography>
              </Paper>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
