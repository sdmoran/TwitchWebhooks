import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import routeConfig from '../routeConfig'
import React from 'react'

const routes = routeConfig(false)

test('Redirects to /auth route if hasToken passed to routes is false', async () => {
  const router = createMemoryRouter(routes, {
    initialEntries: [`/`]
  })
  render(
        <RouterProvider router={router} />
  )

  // With no token, should be redirected to login screen
  expect(window.location.pathname).toEqual('/auth');

  const msg = await waitFor(() => screen.getByText(`Authorize Application`))
  expect(msg).toBeInTheDocument()
})