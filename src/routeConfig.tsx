import React from 'react'
import View404 from './components/View404'
import SetupView from './components/SetupView'
import { NotificationView, twitchUserIdLoader } from './components/NotificationView'
import { AuthRedirect, authResultLoader } from './components/AuthRedirect'
import { Navigate, type RouteObject } from 'react-router-dom'
import AuthView from './components/AuthView'
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID ?? 'fake_client_id'

const noTokenView = <Navigate to="/auth" /> // view to use if no token exists

const routeConfig = (hasToken: boolean = false): RouteObject[] => [
  {
    path: '/',
    element: hasToken ? <SetupView token="" clientId={CLIENT_ID}/> : noTokenView
  },
  {
    path: '/notifications/:twitchUserId',
    element: hasToken ? <NotificationView /> : noTokenView,
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
