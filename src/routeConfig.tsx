import React from 'react'
import View404 from './components/View404'
import SetupView from './components/SetupView'
import { NotificationView, twitchUserIdLoader } from './components/NotificationView'
import { AuthRedirect, authResultLoader } from './components/AuthRedirect'
import AuthView from './components/AuthView'
const TOKEN = process.env.REACT_APP_TWITCH_TOKEN ?? 'fake_token'
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID ?? 'fake_client_id'

const routeConfig = [
  {
    path: '/',
    element: <SetupView token={TOKEN} clientId={CLIENT_ID}/>
  },
  {
    path: '/notifications/:twitchUserId',
    element: <NotificationView />,
    loader: twitchUserIdLoader
  },
  {
    path: '/auth',
    element: <AuthView />
  },
  {
    path: '/auth/redirect',
    element: <AuthRedirect />,
    loader: authResultLoader
  },
  // catch-all route
  {
    path: '*',
    element: <View404 />
  }
]

export default routeConfig
