import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import routeConfig from '../routeConfig'
import { genericErrCause, genericErrMsg } from './AuthRedirect'
import React from 'react'

const routes = routeConfig(true)

test('Parses token from URL', async () => {
  const token = 'the_token'
  const router = createMemoryRouter(routes, {
    initialEntries: [`/auth/redirect#access_token=${token}&scope=chat%3Aread&token_type=bearer`]
  })
  render(
        <RouterProvider router={router} />
  )

  const msg = await waitFor(() => screen.getByText(`Access token acquired! Token: ${token}`))
  expect(msg).toBeInTheDocument()
})

test('Shows error message provided by Twitch when token request is denied', async () => {
  const errType = 'access_denied'
  const errDescription = 'The+user+denied+you+access'

  const router = createMemoryRouter(routes, {
    initialEntries: [`/auth/redirect?error=${errType}&error_description=${errDescription}`]
  })

  render(
        <RouterProvider router={router} />
  )

  const errText = await waitFor(() => screen.getByText(`An error occurred: ${errType}`))
  expect(errText).toBeInTheDocument()
  const detailText = await waitFor(() => screen.getByText(`Details: ${errDescription}`))
  expect(detailText).toBeInTheDocument()
})

test('Shows error message when no token or error information is provided', async () => {
  const router = createMemoryRouter(routes, {
    initialEntries: ['/auth/redirect']
  })
  render(
        <RouterProvider router={router} />
  )
  const failMessage = await waitFor(() => screen.getByText(`${genericErrMsg}: ${genericErrCause}`))
  expect(failMessage).toBeInTheDocument()
})
