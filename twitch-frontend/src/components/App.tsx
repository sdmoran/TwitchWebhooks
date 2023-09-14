import React, { useEffect, useState, type ReactElement } from 'react'
import routeConfig from '../routeConfig'
import { useUserContext } from '../state/UserContext'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Button, Drawer, Link, List, ListItemButton, ListItemText, useMediaQuery } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useTheme } from '@mui/material/styles'
import CookieManager from '../state/Cookies'

function App (): ReactElement {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const toggleDrawer = (): void => {
    setIsDrawerOpen(!isDrawerOpen)
  }

  // Get context to tell if we have a token
  useEffect(() => {
    const cookieInit = async (): Promise<void> => {
      const cookieManager = CookieManager.getInstance()
      const uname = cookieManager.getActiveUserName()
      if (uname !== undefined && uname.length > 0) {
        await cookieManager.setActiveUserName(uname)
      }
    }
    void cookieInit()
  }, [])

  const { userData } = useUserContext()
  const hasToken = userData.token.value.length > 0
  console.log('Context got user token: ', userData.token)

  const routes = routeConfig(hasToken)
  const router = createBrowserRouter(routes)

  const namedRoutes = [
    {
      name: 'Home',
      path: '/'
    },
    {
      name: 'Dashboard',
      path: '/dashboard'
    },
    {
      name: 'Customize',
      path: '/customize'
    }
  ]

  const routeList = namedRoutes.map(element => {
    return (
      <Link href={element.path} key={element.path}>
        <ListItemButton>
          <ListItemText primary={element.name}></ListItemText>
        </ListItemButton>
      </Link>
    )
  })

  const drawerContent = (
    <List>
      {routeList}
    </List>
  )

  const renderNav = (): ReactElement => {
    return (
      // Don't show modal ever on notification page
      location.pathname.startsWith('/notifications/')
        ? <></>
      // Else if mobile, show button to toggle nav
        : isMobile
          ? (
        <>
          <Button
            variant="contained"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </Button>

          <Drawer
            anchor="left"
            open={isDrawerOpen}
            onClose={toggleDrawer}
            variant="temporary"
          >
            {drawerContent}
          </Drawer>
        </>
            )
        // Else show regular desktop modal
          : (
        <Drawer anchor="left" variant="permanent">
          {drawerContent}
        </Drawer>
            )
    )
  }

  return (
    <div className='App'>
        {renderNav()}
        <RouterProvider router={router}></RouterProvider>
    </div>
  )
}

export default App
