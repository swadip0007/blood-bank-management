'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
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
  IconButton,
  Tooltip,
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import dynamic from 'next/dynamic'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

type BloodStock = {
  id: string
  blood_group: string
  quantity: number | null
  expiry_date: string | null
  status: string | null
  user_id: string | null
}

export default function BloodStockPage() {
  const [bloodData, setBloodData] = useState<BloodStock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    blood_group: '',
    quantity: '',
    expiry_date: '',
    status: '',
  })

  // Fetch Data
  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) {
        setError('User not logged in')
        return
      }

      const { data, error } = await supabase
        .from('blood')
        .select('*')
        .eq('user_id', user.id)
        .order('blood_group', { ascending: true })

      if (error) throw error
      setBloodData(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Add / Update Blood
  const handleSaveBlood = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) return alert('No logged in user')

      if (editMode && selectedId) {
        // Update
        const { error } = await supabase
          .from('blood')
          .update({
            blood_group: formData.blood_group,
            quantity: Number(formData.quantity),
            expiry_date: formData.expiry_date,
            status: formData.status,
          })
          .eq('id', selectedId)

        if (error) throw error
      } else {
        // Insert
        const { error } = await supabase.from('blood').insert([
          {
            blood_group: formData.blood_group,
            quantity: Number(formData.quantity),
            expiry_date: formData.expiry_date,
            status: formData.status,
            user_id: user.id,
          },
        ])

        if (error) throw error
      }

      setOpenDialog(false)
      resetForm()
      fetchData()
    } catch (err: any) {
      alert('Error saving blood stock: ' + err.message)
    }
  }

  // Delete
  const handleDeleteBlood = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return
    try {
      const { error } = await supabase.from('blood').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (err: any) {
      alert('Error deleting blood stock: ' + err.message)
    }
  }

  // Open edit dialog
  const handleEdit = (row: BloodStock) => {
    setEditMode(true)
    setSelectedId(row.id)
    setFormData({
      blood_group: row.blood_group,
      quantity: row.quantity !== null ? String(row.quantity) : '',
      expiry_date: row.expiry_date || '',
      status: row.status || '',
    })
    setOpenDialog(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      blood_group: '',
      quantity: '',
      expiry_date: '',
      status: '',
    })
    setEditMode(false)
    setSelectedId(null)
  }

  // Table Columns
  const columns: GridColDef[] = [
    { field: 'blood_group', headerName: 'Blood Group', flex: 1 },
    { field: 'quantity', headerName: 'Quantity (Units)', flex: 1 },
    {
      field: 'expiry_date',
      headerName: 'Expiry Date',
      flex: 1,
      valueFormatter: (value: any) => (value ? new Date(value).toLocaleDateString() : ''),
    },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              sx={{ color: '#ffc107' }}
              onClick={() => handleEdit(params.row)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              sx={{ color: '#f44336' }}
              onClick={() => handleDeleteBlood(params.row.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ]

  // Chart Config
  const chartData = {
    series: [
      {
        name: 'Quantity',
        data: bloodData.map((b) => b.quantity),
      },
    ],
    options: {
      chart: {
        type: 'bar',
        background: 'transparent',
        toolbar: { show: false },
      },
      xaxis: {
        categories: bloodData.map((b) => b.blood_group),
        labels: { style: { colors: '#fff' } },
      },
      yaxis: { labels: { style: { colors: '#fff' } } },
      colors: ['#e53935'],
      plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
      dataLabels: { enabled: false },
      grid: { borderColor: 'rgba(255,255,255,0.1)' },
      theme: { mode: 'dark' },
    },
  }

  return (
    <Box sx={{ color: '#fff' }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: '#1e1e1e',
          color: '#fff',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Blood Stock
            </Typography>
            <Typography variant="body2" color="gray">
              Manage and monitor current blood stock levels.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh Data">
              <IconButton color="info" onClick={fetchData}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              color="error"
              startIcon={<AddIcon />}
              onClick={() => {
                resetForm()
                setOpenDialog(true)
              }}
              sx={{ borderRadius: 2, fontWeight: 'bold' }}
            >
              Add Blood
            </Button>
          </Box>
        </Box>

        {/* Data States */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', height: 200 }}>
            <CircularProgress color="error" />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : bloodData.length === 0 ? (
          <Alert severity="info">No blood stock data available.</Alert>
        ) : (
          <>
            {/* Chart */}
            <Box sx={{ mt: 4, backgroundColor: '#121212', p: 2, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Blood Stock Overview
              </Typography>
              <Chart
                options={chartData.options as any}
                series={chartData.series}
                type="bar"
                height={300}
              />
            </Box>

            {/* DataGrid */}
            <Box
              sx={{
                mt: 4,
                height: 440,
                background: 'linear-gradient(145deg, #1a0732, #2a1052)',
                borderRadius: 3,
                boxShadow: '0 4px 25px rgba(0,0,0,0.4)',
                overflow: 'hidden',
                '& .MuiDataGrid-root': { border: 'none' },
                '& .MuiDataGrid-cell': {
                  color: '#050505ff',
                  borderBottom: '1px solid rgba(36, 27, 45, 0.1)',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'rgba(73, 25, 111, 0.8)',
                  color: '#121111ff',
                  fontWeight: '600',
                },
                '& .MuiDataGrid-footerContainer': {
                  backgroundColor: 'rgba(67,20,109,0.8)',
                  color: '#101010ff',
                },
              }}
            >
              <DataGrid
                rows={bloodData}
                columns={columns}
                getRowId={(row) => row.id}
                pageSizeOptions={[5, 10]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 5 } },
                }}
              />
            </Box>
          </>
        )}
      </Paper>

      {/* Add / Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editMode ? 'Edit Blood Stock' : 'Add New Blood Stock'}</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 1,
            minWidth: 350,
          }}
        >
          <TextField
            select
            label="Blood Group"
            value={formData.blood_group}
            onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
            fullWidth
          >
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
              <MenuItem key={group} value={group}>
                {group}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Quantity (Units)"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            fullWidth
          />

          <TextField
            label="Expiry Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.expiry_date}
            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
            fullWidth
          />

          <TextField
            select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            fullWidth
          >
            {['Available', 'Low Stock', 'Expired'].map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleSaveBlood}>
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
