import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import routeConfig from '../routeConfig'
import React from 'react'
import { UserContext } from '../state/UserContext'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const routes = routeConfig(true)

const server = setupServer(
  rest.post('https://api.twitch.tv/helix/eventsub/subscriptions', async (req, res, ctx) => {
    // For test that has invalid user ID, return 400 status code
    const reqJson = await req.json()
    if (reqJson !== undefined) {
      if (reqJson.condition.broadcaster_user_id === 'aaaaa') {
        return await res(
          ctx.status(400),
          ctx.json({ message: 'subscription setup failed' })
        )
      }
    }

    // Default: return 202 acepted
    return await res(
      ctx.status(202),
      ctx.json({ data: 'OK' })
    )
  })
)

// establish API mocking before all tests
beforeAll(() => { server.listen() })
// reset any request handlers that are declared as a part of our tests
// (i.e. for testing one-time error scenarios)
afterEach(() => { server.resetHandlers() })
// clean up once the tests are done
afterAll(() => { server.close() })

test('Shows error when no subscriptions are passed in URL parameters', async () => {
  const router = createMemoryRouter(routes, {
    initialEntries: ['/notifications/61744666']
  })
  render(
        <RouterProvider router={router} />
  )

  const msg = await screen.findByText('An error occurred: No subscriptions selected!')
  expect(msg).toBeInTheDocument()
})

test('Renders NotificationView with a valid Twitch User ID and subscription types', async () => {
  const router = createMemoryRouter(routes, {
    initialEntries: ['/notifications/61744666?eventTypes=channel.follow&showTest=1']
  })
  render(
        <RouterProvider router={router} />
  )

  const msg = await screen.findByText('Thanks for following, Sample User!')
  expect(msg).toBeInTheDocument()
  const testMsg = screen.getByTestId('notification-elt')
  expect(testMsg).toBeInTheDocument()
})

test('Shows test notification when URL parameter is present', async () => {
  const router = createMemoryRouter(routes, {
    initialEntries: ['/notifications/61744666?eventTypes=channel.follow&showTest=1']
  })

  const token = { value: '', scopes: [] }

  const value = {
    userData: {
      username: '',
      token,
      twitchId: ''
    },
    setUserData: () => { }
  }

  render(
    <UserContext.Provider value={value}>
      <RouterProvider router={router} />
    </UserContext.Provider>
  )

  const testMsg = await screen.findByText('Thanks for following, Sample User!')
  expect(testMsg).toBeInTheDocument()
})

test('NotificationView shows error message with invalid Twitch User ID', async () => {
  const router = createMemoryRouter(routes, {
    initialEntries: ['/notifications/aaaaa?eventTypes=channel.follow']
  })
  render(
        <RouterProvider router={router} />
  )
  const failMessage = await screen.findByText('An error occurred: SubscriptionSetupFailed')
  expect(failMessage).toBeInTheDocument()
})
