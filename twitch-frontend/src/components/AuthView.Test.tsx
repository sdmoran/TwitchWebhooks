import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import routeConfig from '../routeConfig'
import React from 'react'

const routes = routeConfig(false)

test('Renders auth page', async () => {
  const router = createMemoryRouter(routes, {
    initialEntries: ['/auth']
  })
  render(
    <RouterProvider router={router} />
  )

  expect(window.location.pathname).toEqual('/auth')
  const msg = await waitFor(() => screen.getByText('Authorize Application'))
  expect(msg).toBeInTheDocument()
})
