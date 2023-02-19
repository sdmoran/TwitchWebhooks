import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import routeConfig from '../routeConfig'
import React from 'react'

test('Shows error when no subscriptions are passed in URL parameters', async () => {
  const router = createMemoryRouter(routeConfig, {
    initialEntries: ['/notifications/61744666']
  })
  render(
        <RouterProvider router={router} />
  )

  const msg = await screen.findByText('UNKNOWN EVENT TYPE')
  expect(msg).toBeInTheDocument()
})

test('Renders NotificationView with a valid Twitch User ID and subscription types', async () => {
  const router = createMemoryRouter(routeConfig, {
    initialEntries: ['/notifications/61744666?eventTypes=channel.follow&showTest=1']
  })
  render(
        <RouterProvider router={router} />
  )

  const msg = await screen.findByText('UNKNOWN EVENT TYPE')
  expect(msg).toBeInTheDocument()
  const testMsg = screen.getByTestId('notification-elt') // notification hidden if showTest not in query params
  expect(testMsg).toBeInTheDocument()
})

test('Shows test notification when URL parameter is present', async () => {
  const router = createMemoryRouter(routeConfig, {
    initialEntries: ['/notifications/61744666?eventTypes=channel.follow&showTest=1']
  })

  render(
        <RouterProvider router={router} />
  )

  const testMsg = await screen.findByText('Thanks for following, Sample User!')
  expect(testMsg).toBeInTheDocument()
})

test('NotificationView shows error message with invalid Twitch User ID', async () => {
  const router = createMemoryRouter(routeConfig, {
    initialEntries: ['/notifications/aaaaa?eventTypes=channel.follow']
  })
  render(
        <RouterProvider router={router} />
  )
  const failMessage = await screen.findByText('An error occurred: SubscriptionSetupFailed')
  expect(failMessage).toBeInTheDocument()
})
