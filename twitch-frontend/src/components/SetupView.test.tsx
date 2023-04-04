import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SetupView from './SetupView'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import React from 'react'
import { UserContext } from '../state/UserContext'

const TOKEN = process.env.REACT_APP_TWITCH_TOKEN ?? 'fake_token'
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID ?? 'fake_client_id'

const router = createBrowserRouter([
  {
    path: '/',
    element: <SetupView token={TOKEN} clientId={CLIENT_ID}/>
  }
])

const renderRouterWithContext = (): void => {
  const token = process.env.REACT_APP_TWITCH_TOKEN ?? ''

  const value = {
    userData: {
      username: '',
      token
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
  userEvent.paste(screen.getByPlaceholderText('Twitch Username'), 'mrmannertink')
  userEvent.click(screen.getByText('Get User ID'))
  const twitchUserName = await screen.findByText('MrMannertink', {}, { timeout: 5000 })
  expect(twitchUserName).toBeInTheDocument()
  const twitchUserId = screen.getByText('User ID: 61744666')
  expect(twitchUserId).toBeInTheDocument()
  userEvent.paste(screen.getByPlaceholderText('Twitch Username'), 'e')
  userEvent.click(screen.getByText('Get User ID'))
  const failMessage = await screen.findByText('Failed to get User ID from Twitch!')
  expect(failMessage).toBeInTheDocument()
  expect(screen.queryByText('MrMannertink')).toBeNull() // user info should have been cleared
})

// TODO Add tests for image? May require some custom querySelector shenanigans
