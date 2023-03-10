import React, { type ReactElement } from 'react'

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID ?? 'fake_client_id'
const REDIRECT_URI = `${window.location.origin}/auth/redirect`
const TWITCH_AUTH_URL_BASE = 'https://id.twitch.tv/oauth2/authorize?'

// TODO move somewhere central or pass as props - probably AFTER user chooses event types to be notified for so
// we know what scopes will be required. At the moment only chat:read is required for follower notifications
const SCOPES = [
  'chat:read',
  'moderator:read:followers'
]

function AuthView (): ReactElement {
  const params = new URLSearchParams()
  params.set('response_type', 'token')
  params.set('client_id', CLIENT_ID)
  params.set('scope', SCOPES.join(' '))

  const AUTH_URL = TWITCH_AUTH_URL_BASE + params.toString() + `&redirect_uri=${REDIRECT_URI}` // Redirect URI should contain LITERAL "/" and ":", NOT URI-ENCODED.

  return (
        <div className="container">
            <h1>Authorize Application</h1>
            <a href={AUTH_URL}><p>Click here to authorize this application with Twitch.</p></a>
            <p>This is required in order to view channel followers.</p>
        </div>
  )
}

export default AuthView
