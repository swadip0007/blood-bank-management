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
  Breadcrumbs,
  Link as MuiLink,
  Button,
} from '@mui/material'
import {
  Dashboard,
  Bloodtype,
  EventNote,
  Settings,
  Menu as MenuIcon,
  ChevronLeft,
  NavigateNext as NavigateNextIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Props = {
  children: React.ReactNode
  requiredRoles?: string[]
}

const drawerWidth = 240

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/hospital/dashboard' },
  { text: 'Blood Stock', icon: <Bloodtype />, path: '/hospital/blood-stock' },
  { text: 'Appointments', icon: <EventNote />, path: '/hospital/appointments' },
  { text: 'Settings', icon: <Settings />, path: '/hospital/settings' },
]

export default function DashboardLayout({ children }: Props) {
  const [open, setOpen] = React.useState(true)
  const pathname = usePathname()
  const router = useRouter()

  const toggleDrawer = () => setOpen(!open)

  // --- Logout handler ---
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error.message)
    } else {
      router.push('/login')
    }
  }

  // Generate breadcrumb parts from the URL path
  const pathParts = pathname.split('/').filter(Boolean)

  const breadcrumbLinks = pathParts.map((part, index) => {
    const href = '/' + pathParts.slice(0, index + 1).join('/')
    const label = part.charAt(0).toUpperCase() + part.slice(1)
    const isLast = index === pathParts.length - 1

    return isLast ? (
      <Typography key={href} color="#f5f5f5" fontWeight={600}>
        {label}
      </Typography>
    ) : (
      <MuiLink
        key={href}
        component={Link}
        href={href}
        underline="hover"
        color="#b39ddb"
        sx={{
          '&:hover': { color: '#ff4081' },
          transition: 'color 0.2s ease',
        }}
      >
        {label}
      </MuiLink>
    )
  })

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* ---------- AppBar ---------- */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(90deg, #2b1055, #7597de)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              edge="start"
              sx={{
                mr: 2,
                color: '#fff',
                '&:hover': { color: '#ff1744', transform: 'scale(1.1)' },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {open ? <ChevronLeft /> : <MenuIcon />}
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 600,
                letterSpacing: 0.8,
                textShadow: '0 0 8px rgba(255,255,255,0.4)',
              }}
            >
              Blood Bank Dashboard
            </Typography>
          </Box>

          {/* ---------- Logout Button ---------- */}
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 2,
              background: 'rgba(255,255,255,0.1)',
              '&:hover': {
                background: 'rgba(255,255,255,0.2)',
                color: '#ff1744',
              },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* ---------- Drawer ---------- */}
      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidth : 70,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 70,
            transition: 'width 0.3s',
            overflowX: 'hidden',
            background: 'linear-gradient(180deg, #0a0a23, #1c1c3c)',
            color: '#fff',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '2px 0 10px rgba(0,0,0,0.3)',
          },
        }}
        open={open}
      >
        <Toolbar />
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

        <List>
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.path)
            return (
              <ListItem
                key={item.text}
                disablePadding
                sx={{ display: 'block' }}
                component={Link}
                href={item.path}
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    background: isActive
                      ? 'linear-gradient(90deg, #ff1744, #d500f9)'
                      : 'transparent',
                    boxShadow: isActive
                      ? '0 0 8px rgba(255,23,68,0.5)'
                      : 'none',
                    borderRadius: '12px',
                    margin: '6px 10px',
                    transition: 'all 0.25s ease-in-out',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #ff5252, #7c4dff)',
                      transform: 'scale(1.05)',
                      boxShadow: '0 0 10px rgba(124,77,255,0.4)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: '#fff',
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      opacity: open ? 1 : 0,
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      </Drawer>

      {/* ---------- Main Content ---------- */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          background: 'linear-gradient(135deg, #0a0a23, #1e1e3f)',
          minHeight: '100vh',
          color: '#f5f5f5',
          transition: 'background 0.3s ease',
        }}
      >
        <Toolbar />

        {/* ---------- Breadcrumbs ---------- */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" sx={{ color: '#9fa8da' }} />}
          aria-label="breadcrumb"
          sx={{
            mb: 3,
            background: 'rgba(255,255,255,0.05)',
            p: 1.5,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {breadcrumbLinks}
        </Breadcrumbs>

        {children}
      </Box>
    </Box>
  )
}
