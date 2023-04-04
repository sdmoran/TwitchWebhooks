import { type LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom'
import ErrorMessage from './ErrorMessage'
import React, { useEffect, type ReactElement } from 'react'
import { type UserData, useUserContext } from '../state/UserContext'
import { storeUserData } from '../state/LocalStorage'
import { type TokenResponse, validateToken } from '../api/TwitchClient'

const genericErrMsg = 'Failed to get token'
const genericErrCause = 'Something went wrong getting token. Please try again.'

function authResultLoader (data: LoaderFunctionArgs): Error | string {
  const ret = new Error(genericErrMsg, { cause: genericErrCause })

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

  return ret
}

function AuthRedirect (): ReactElement {
  const navigate = useNavigate()
  const loaderData = useLoaderData() as Error | string

  if (loaderData instanceof Error) {
    return <ErrorMessage err={loaderData}/>
  }

  const userContextCB = React.useCallback(() => useUserContext(), [useUserContext])

  const { userData, setUserData } = userContextCB()

  const setUserCB = React.useCallback((user: UserData) => {
    setUserData(user)
  }, [setUserData])

  const userInfo = {
    username: '',
    token: loaderData
  }

  // Get and try storing token. If that succeeds, redirect to home page
  useEffect(() => {
    const ensureTokenValid = async (): Promise<TokenResponse> => {
      return await validateToken(loaderData)
    }

    ensureTokenValid()
      .then((valid) => {
        if (valid.login.length > 0) {
          const userInfo = {
            username: valid.login,
            token: loaderData
          }

          console.log('Setting userinfo:')
          console.log(userInfo)

          storeUserData(userInfo)
          setUserData(userInfo)
          navigate('/')
        }
      })
      .catch(() => {
        console.log('Couldn\'t get token')
      })
  }, [])

  return (
      <div className='container'>
          <h1>Token data: {loaderData}</h1>
          <h1>User context token: {userData.token}</h1>
          <h1>User context username: {userData.username}</h1>
          <button onClick={() => { setUserCB(userInfo) }}></button>
      </div>
  )
}

export {
  AuthRedirect,
  authResultLoader,
  genericErrMsg,
  genericErrCause
}
