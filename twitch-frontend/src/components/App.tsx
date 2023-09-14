import React, { useEffect, type ReactElement } from 'react'
import routeConfig from '../routeConfig'
import { useUserContext } from '../state/UserContext'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Box, Drawer, Link, List, ListItemButton, ListItemText } from '@mui/material'
import CookieManager from '../state/Cookies'

function App (): ReactElement {
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

  return (
        <div className='App'>
          { !location.pathname.startsWith('/notifications/')
            ? (
            <Drawer
              anchor={'left'}
              variant='permanent'
              ModalProps={{
                keepMounted: true
              }}
            >
              <Box
                sx={{ width: 250 }}
                role="presentation"
              >
              <List>
                {routeList}
              </List>
              </Box>
            </Drawer>
              )
            : null}
          <RouterProvider router={router}></RouterProvider>
        </div>
  )
}

export default App
