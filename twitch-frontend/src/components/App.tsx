import React, { type ReactElement } from 'react'
import routeConfig from '../routeConfig'
import { useUserContext } from '../state/UserContext'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

function App (): ReactElement {
  // Get context to tell if we have a token
  const { userData } = useUserContext()
  const hasToken = userData.token.value.length > 0
  console.log('Context got user token: ', userData.token)

  const routes = routeConfig(hasToken)
  const router = createBrowserRouter(routes)

  return (
        <div className="App">
            <RouterProvider router={router} />
        </div>
  )
}

export default App
