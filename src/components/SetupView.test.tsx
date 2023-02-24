import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SetupView from './SetupView'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import React from 'react'

const TOKEN = process.env.REACT_APP_TWITCH_TOKEN ?? 'fake_token'
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID ?? 'fake_client_id'

const router = createBrowserRouter([
  {
    path: '/',
    element: <SetupView token={TOKEN} clientId={CLIENT_ID}/>
  }
])

test('Handles error gracefully if Twitch username not found', async () => {
  render(<RouterProvider router={router} />)
  userEvent.type(screen.getByPlaceholderText('Twitch Username'), 'e')
  userEvent.click(screen.getByText('Get User ID'))
  const failMessage = await screen.findByText('Failed to get User ID from Twitch!')
  expect(failMessage).toBeInTheDocument()
})

test('Submitting valid username displays Twitch user information for that user', async () => {
  render(<RouterProvider router={router} />)
  userEvent.paste(screen.getByPlaceholderText('Twitch Username'), 'mrmannertink')
  userEvent.click(screen.getByText('Get User ID'))
  const twitchUserName = await screen.findByText('MrMannertink')
  expect(twitchUserName).toBeInTheDocument()
  const twitchUserId = screen.getByText('User ID: 61744666')
  expect(twitchUserId).toBeInTheDocument()
})

test('Submitting invalid username AFTER submitting valid username displays ONLY error message (clears user information)', async () => {
  render(<RouterProvider router={router} />)
  userEvent.paste(screen.getByPlaceholderText('Twitch Username'), 'mrmannertink')
  userEvent.click(screen.getByText('Get User ID'))
  const twitchUserName = await screen.findByText('MrMannertink')
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
