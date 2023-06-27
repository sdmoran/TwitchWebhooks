import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import routeConfig from '../routeConfig'
import React from 'react'
import { act } from 'react-dom/test-utils'

const routes = routeConfig(false)

test('Renders auth page', async () => {
  const router = createMemoryRouter(routes, {
    initialEntries: ['/auth']
  })

  act(() => {
    render(
      <RouterProvider router={router} />
    )
  })

  const msg = await waitFor(() => screen.getByText('Authorize Application'))
  console.log(router.state.location.pathname)
  expect(router.state.location.pathname).toEqual('/auth')
  expect(msg).toBeInTheDocument()
})
