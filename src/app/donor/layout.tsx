'use client'

import * as React from 'react'
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'

import {
  Menu as MenuIcon,
  Person,
  EventNote,
  Logout,
} from '@mui/icons-material'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const drawerWidth = 220

export default function DonorLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true)
  const router = useRouter()
  const path = usePathname()

  const toggleDrawer = () => {
    setOpen(!open)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const menuItems = [
    { text: 'Profile', icon: <Person />, link: '/donor/profile' },
    { text: 'Appointments', icon: <EventNote />, link: '/donor/appointment' },
  ]

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* ----------- Top Bar ----------- */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1300,
          background: 'linear-gradient(135deg, #1976d2, #1565c0)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        <Toolbar>
          <IconButton color="inherit" onClick={toggleDrawer} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              letterSpacing: '0.5px',
            }}
          >
            Donor Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* ----------- Sidebar ----------- */}
      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidth : 70,
          transition: '0.4s',
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 70,
            transition: '0.4s',
            background: 'rgba(255,255,255,0.45)',
            backdropFilter: 'blur(12px)',
            borderRight: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
          },
        }}
      >
        <Toolbar />
        <Divider sx={{ mb: 1 }} />

        <List>
          {menuItems.map((item) => {
            const isActive = path === item.link
            return (
              <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  component={Link}
                  href={item.link}
                  sx={{
                    minHeight: 50,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2,
                    borderRadius: 2,
                    mx: 1,
                    mb: 1,
                    transition: '0.3s',
                    backgroundColor: isActive ? 'rgba(25,118,210,0.2)' : 'transparent',
                    color: isActive ? '#1976d2' : 'inherit',
                    '&:hover': {
                      backgroundColor: 'rgba(25,118,210,0.12)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? '#1976d2' : '#333',
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={item.text}
                    sx={{
                      opacity: open ? 1 : 0,
                      fontWeight: isActive ? 'bold' : 'normal',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>

        <Divider sx={{ mt: 'auto' }} />

        {/* ----------- Logout Button ----------- */}
        <List sx={{ mt: 'auto', mb: 2 }}>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2,
                mx: 1,
                borderRadius: 2,
                color: 'red',
                '&:hover': {
                  backgroundColor: 'rgba(255,0,0,0.12)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                  color: 'red',
                }}
              >
                <Logout />
              </ListItemIcon>

              <ListItemText
                primary="Logout"
                sx={{ opacity: open ? 1 : 0, fontWeight: 'bold' }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* ----------- Main Content ----------- */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          background: 'linear-gradient(135deg, #f0f4ff, #ffffff)',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}
