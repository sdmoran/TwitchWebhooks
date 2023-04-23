import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SetupView from './SetupView'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import React from 'react'
import { UserContext } from '../state/UserContext'
import {rest} from 'msw'
import {setupServer} from 'msw/node'

const TOKEN = process.env.REACT_APP_TWITCH_TOKEN ?? 'fake_token'
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID ?? 'fake_client_id'

// Setup mock server
const server = setupServer(
  rest.get('/api/user/mrmannertink', (req, res, ctx) => {
    return res(ctx.json({
      data: [
        {
          id: '61744666',
          login: 'mrmannertink',
          display_name: 'MrMannertink',
          type: '',
          broadcaster_type: '',
          description: 'im a gamer',
          profile_image_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/mrmannertink-profile_image-761944b47d2b4e51-300x300.png',
          offline_image_url: 'https://static-cdn.jtvnw.net/jtv_user_pictures/mrmannertink-channel_offline_image-5dad23db6e51b7fa-1920x1080.jpeg',
          view_count: 1609,
          created_at: '2014-04-27T19:43:05Z'
        }
      ]
    }))
  }),

  rest.get('/api/user/e', (req, res, ctx) => {
    return res(ctx.json({
      "data": []
    }))
  })
)

// establish API mocking before all tests
beforeAll(() => server.listen())
// reset any request handlers that are declared as a part of our tests
// (i.e. for testing one-time error scenarios)
afterEach(() => server.resetHandlers())
// clean up once the tests are done
afterAll(() => server.close())

const router = createBrowserRouter([
  {
    path: '/',
    element: <SetupView token={TOKEN} clientId={CLIENT_ID}/>
  }
])

const renderRouterWithContext = (): void => {
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
}

test('Handles error gracefully if Twitch username not found', async () => {
  renderRouterWithContext()
  userEvent.type(screen.getByPlaceholderText('Twitch Username'), 'e')
  userEvent.click(screen.getByText('Get User ID'))
  const failMessage = await screen.findByText('Failed to get User ID from Twitch!')
  expect(failMessage).toBeInTheDocument()
})

test('Submitting valid username displays Twitch user information for that user', async () => {
  renderRouterWithContext()
  userEvent.paste(screen.getByPlaceholderText('Twitch Username'), 'mrmannertink')
  userEvent.click(screen.getByText('Get User ID'))
  const twitchUserName = await screen.findByText('MrMannertink')
  expect(twitchUserName).toBeInTheDocument()
  const twitchUserId = screen.getByText('User ID: 61744666')
  expect(twitchUserId).toBeInTheDocument()
})

test('Submitting invalid username AFTER submitting valid username displays ONLY error message (clears user information)', async () => {
  renderRouterWithContext()
  const usernameInput = screen.getByPlaceholderText('Twitch Username')

  userEvent.paste(usernameInput, 'mrmannertink')
  userEvent.click(screen.getByText('Get User ID'))
  const twitchUserName = await screen.findByText('MrMannertink', {}, { timeout: 5000 })
  expect(twitchUserName).toBeInTheDocument()
  const twitchUserId = screen.getByText('User ID: 61744666')
  expect(twitchUserId).toBeInTheDocument()
  userEvent.clear(usernameInput)
  userEvent.paste(usernameInput, 'e')
  userEvent.click(screen.getByText('Get User ID'))
  const failMessage = await screen.findByText('Failed to get User ID from Twitch!')
  expect(failMessage).toBeInTheDocument()
  expect(screen.queryByText('MrMannertink')).toBeNull() // user info should have been cleared
})

// TODO Add tests for image? May require some custom querySelector shenanigans
