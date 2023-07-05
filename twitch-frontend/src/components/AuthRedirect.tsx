import { type LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom'
import ErrorMessage from './ErrorMessage'
import React, { useEffect, useState, type ReactElement } from 'react'
import { type UserData, useUserContext } from '../state/UserContext'
import { type TokenResponse, validateToken } from '../api/TwitchClient'

const genericErrMsg = 'Failed to get token from Twitch!'
const genericErrCause = 'Something went wrong getting token. Please try again.'

/* FLOW
- Get data from loader
  - If no data, show an error
  - If data, validate token from loader
    - if invalid, show an error
    - if valid, save to local state
*/

// Get auth token from URL. Redirected from Twitch.
function authResultLoader (data: LoaderFunctionArgs): Error | string {
  if (window.location.hash.length > 0) { // Token sent in fragment
    const queryParams = new URLSearchParams(window.location.hash.substring(1))

    const token = queryParams.get('access_token')
    if (token !== null) {
      return token
    }
  } else if (window.location.search.length > 0) { // Error sent in query params
    const queryParams = new URLSearchParams(window.location.search)
    const errName = queryParams.get('error') ?? 'Unknown error'
    const errDetail = queryParams.get('error_description') ?? 'Unknown cause'
    return new Error(errName, { cause: errDetail })
  }

  // Return a generic error if no token or specific error present
  return new Error(genericErrMsg, { cause: genericErrCause })
}

function AuthRedirect (): ReactElement {
  const navigate = useNavigate()
  const [err, setErr] = useState(undefined as Error | undefined)
  const { userData, setUserData } = useUserContext()

  const setUserCB = React.useCallback((user: UserData) => {
    setUserData(user)
  }, [])

  const loaderData = useLoaderData() as Error | string

  function parseTokenResponse (resp: TokenResponse | undefined): UserData | undefined {
    if (resp === undefined) {
      return resp
    }

    const userData = {
      username: resp.login,
      token: {
        value: loaderData instanceof Error ? '' : loaderData,
        scopes: resp.scopes
      },
      twitchId: resp.user_id
    }

    return userData
  }

  // TODO revisit this. Need to deeply compare saved state with new token? Or just use twitchId?
  function userDataIsDifferent (a: UserData, b: UserData): boolean {
    return a.token.value !== b.token.value || a.twitchId !== b.twitchId
  }

  // Check with Twitch if token is valid. Call API only once.
  useEffect(() => {
    if (loaderData instanceof Error) {
      setErr(loaderData)
      return
    }

    validateToken(loaderData)
      .then((tokenResponse) => {
        if (tokenResponse === undefined) {
          console.log('Token was undefined')
        } else {
          const result = parseTokenResponse(tokenResponse)
          if (result !== undefined && result.twitchId.length > 1) {
          // store token and update local userdata if twitchId is different
            if (userDataIsDifferent(result, userData)) {
              setUserCB(result)
            }

            setTimeout(() => {
              navigate('/dashboard')
            }, 3000)
          }
        }
      })
      .catch((e) => {
        console.log("Failed to validate token with twitch. ", e)
        setErr(new Error('Failed to get response from Twitch!', { cause: 'Validating the token failed.' }))
      })
  }, [loaderData])

  if (err != null) {
    return (
      <div className='container'>
        <ErrorMessage err={err}/>
      </div>
    )
  }

  return (
    <div className='container'>
      <h1>Succesfully authenticated with Twitch!</h1>
      <h2>Token user: {userData.username}</h2>
      <h2>Token scopes: </h2>
      <ul className="flex-list">{userData.token.scopes.map(elt => { return <li key={elt}>{elt}</li> })}</ul>
      <p>You will be redirected to the dashboard in a few seconds.</p>
    </div>
  )
}

export {
  AuthRedirect,
  authResultLoader,
  genericErrMsg,
  genericErrCause
}
