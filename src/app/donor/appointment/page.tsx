'use client'

import { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Tabs,
  Tab,
  Divider,
} from '@mui/material'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { supabase } from '@/lib/supabase'

const localizer = momentLocalizer(moment)

export default function DonorAppointmentPage() {
  const [tabValue, setTabValue] = useState(0)
  const [appointments, setAppointments] = useState<any[]>([])
  const [bookedAppointments, setBookedAppointments] = useState<any[]>([])
  const [hospitals, setHospitals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    blood_group: '',
    quantity: '',
    contact_number: '',
    email_id: '',
  })

  // Fetch Functions
  const fetchHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospital')
        .select('id, hospital_name, profile_pic')
        .order('hospital_name', { ascending: true })

      if (error) throw error
      setHospitals(data || [])
    } catch (err: any) {
      console.error('fetchHospitals error', err)
    }
  }

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointment')
        .select('*')
        .order('scheduled_date', { ascending: false })

      if (error) throw error

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const upcomingAppointments = (data || []).filter((item: any) => {
        const apptDate = new Date(item.scheduled_date)
        return apptDate >= today
      })

      const mapped = upcomingAppointments.map((item: any) => {
        const hospital = hospitals.find((h) => h.id === item.hospital_id)
        return {
          ...item,
          hospital_name: hospital ? hospital.hospital_name : 'Unknown Hospital',
          hospital_pic: hospital ? hospital.profile_pic : '',
        }
      })

      setAppointments(mapped)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookedAppointments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('request')
        .select('*, hospital:hospital_id(hospital_name)')
        .eq('donor_id', user.id)

      if (error) throw error

      const mapped = data.map((req: any) => ({
        title: req.hospital?.hospital_name || 'Hospital',
        start: new Date(req.requested_date),
        end: new Date(req.requested_date),
        status: req.status,
      }))

      setBookedAppointments(mapped)
    } catch (err: any) {
      console.error('fetchBookedAppointments error', err)
    }
  }

  useEffect(() => {
    fetchHospitals()
  }, [])

  useEffect(() => {
    if (hospitals.length > 0) {
      fetchAppointments()
      fetchBookedAppointments()
    }
  }, [hospitals])

  const handleApply = (appointment: any) => {
    setSelectedAppointment(appointment)
    setOpenDialog(true)
  }

  const handleSubmit = async () => {
    try {
      setError(null)
      setSuccessMessage(null)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('User not logged in')

      const donorId = user.id

      const { error: insertError } = await supabase.from('request').insert([
        {
          hospital_id: selectedAppointment.hospital_id,
          donor_id: donorId,
          blood_group: formData.blood_group,
          quantity: formData.quantity,
          contact_number: formData.contact_number,
          email_id: formData.email_id,
          requested_date: new Date().toISOString(),
          appointment_id: selectedAppointment.id,
          status: 'Pending',
        },
      ])

      if (insertError) throw insertError

      setSuccessMessage('Request submitted successfully!')
      setOpenDialog(false)
      setFormData({ blood_group: '', quantity: '', contact_number: '', email_id: '' })
      fetchBookedAppointments()
    } catch (err: any) {
      console.error('Insert error:', err)
      setError(err.message)
    }
  }

  return (
    <Box>
      {/* HEADER CARD */}
      <Paper
        elevation={10}
        sx={{
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #ede7f6, #d1c4e9)',
          border: '1px solid #b39ddb',
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{
            textAlign: 'center',
            color: '#512da8',
            mb: 3,
            textShadow: '0 2px 4px rgba(0,0,0,0.15)',
          }}
        >
          💜 Donor Appointments
        </Typography>

        {/* TABS */}
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          centered
          textColor="secondary"
          indicatorColor="secondary"
          sx={{
            borderRadius: 3,
            backgroundColor: '#ffffffdd',
            boxShadow: '0 2px 12px rgba(81,45,168,0.2)',
            mb: 3,
            '& .Mui-selected': {
              color: '#512da8 !important',
              fontWeight: 'bold',
            },
          }}
        >
          <Tab label="All Appointments" />
          <Tab label="Booked Calendar" />
        </Tabs>

        {/* ALL APPOINTMENTS LIST */}
        {tabValue === 0 && (
          <>
            {loading && (
              <Box textAlign="center" py={4}>
                <CircularProgress color="secondary" />
              </Box>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            {!loading && appointments.length === 0 && (
              <Typography align="center" color="text.secondary">
                No appointments found.
              </Typography>
            )}

            <List>
              {appointments.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                    bgcolor: '#ffffffcc',
                    boxShadow: '0 4px 12px rgba(81,45,168,0.18)',
                    border: '1px solid #d1c4e9',
                    transition: '0.3s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 8px 18px rgba(81,45,168,0.28)',
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
                    <Avatar
                      src={item.hospital_pic || '/default-hospital.png'}
                      alt={item.hospital_name}
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        border: '2px solid #7e57c2',
                      }}
                    />

                    <ListItemText
                      primary={
                        <Typography variant="h6" fontWeight="bold" color="#512da8">
                          {item.hospital_name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          Contact: {item.contact_number || 'N/A'}
                        </Typography>
                      }
                    />
                  </Stack>

                  {/* APPLY BUTTON */}
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#673ab7',
                      '&:hover': { backgroundColor: '#5e35b1' },
                      textTransform: 'none',
                      borderRadius: 3,
                      px: 3,
                      py: 1,
                    }}
                    onClick={() => handleApply(item)}
                  >
                    Apply
                  </Button>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* BOOKED CALENDAR TAB */}
        {tabValue === 1 && (
          <Box
            sx={{
              height: 520,
              bgcolor: '#ffffff',
              borderRadius: 3,
              p: 2,
              border: '1px solid #d1c4e9',
              boxShadow: '0 6px 20px rgba(81,45,168,0.25)',
            }}
          >
            <Calendar
              localizer={localizer}
              events={bookedAppointments}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              toolbar={false}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor:
                    event.status === 'Approved'
                      ? '#4caf50'
                      : event.status === 'Rejected'
                      ? '#673ab7'
                      : '#3f51b5',
                  color: 'white',
                  borderRadius: '6px',
                  border: 'none',
                  paddingLeft: 6,
                },
              })}
            />
          </Box>
        )}

        {/* BACK BUTTON */}
        <Box textAlign="center" mt={4}>
          <Button
            href="/donor"
            variant="outlined"
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.2,
              fontWeight: 'bold',
              borderColor: '#673ab7',
              color: '#512da8',
              '&:hover': {
                borderColor: '#512da8',
                backgroundColor: '#ede7f6',
              },
            }}
          >
            ⬅ Back to Dashboard
          </Button>
        </Box>
      </Paper>

      {/* APPLY FORM DIALOG */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle
          sx={{
            fontWeight: 'bold',
            color: '#512da8',
            borderBottom: '1px solid #d1c4e9',
          }}
        >
          Submit Blood Request
        </DialogTitle>

        <DialogContent sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Hospital: <b>{selectedAppointment?.hospital_name}</b>
          </Typography>

          <TextField
            label="Email ID"
            fullWidth
            margin="dense"
            value={formData.email_id}
            onChange={(e) =>
              setFormData({ ...formData, email_id: e.target.value })
            }
          />

          <TextField
            label="Blood Group"
            select
            fullWidth
            margin="dense"
            value={formData.blood_group}
            onChange={(e) =>
              setFormData({ ...formData, blood_group: e.target.value })
            }
          >
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
              <MenuItem key={bg} value={bg}>
                {bg}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Quantity (units)"
            type="number"
            fullWidth
            margin="dense"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
          />

          <TextField
            label="Contact Number"
            type="tel"
            fullWidth
            margin="dense"
            value={formData.contact_number}
            onChange={(e) =>
              setFormData({ ...formData, contact_number: e.target.value })
            }
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>

          <Button
            variant="contained"
            sx={{
              backgroundColor: '#673ab7',
              borderRadius: 3,
              px: 3,
              '&:hover': { backgroundColor: '#5e35b1' },
            }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUCCESS SNACKBAR */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}
