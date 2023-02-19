import { type LoaderFunctionArgs, useLoaderData } from 'react-router-dom'
import ErrorMessage from './ErrorMessage'
import React, { type ReactElement } from 'react'

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

function parseQueryParams (data: Error | string): ReactElement {
  if (data instanceof Error) {
    return <ErrorMessage err={data}/>
  }

  return (
        <h1>
            Access token acquired! Token: {data}
        </h1>
  )
}

function AuthRedirect (): ReactElement {
  const loaderData = useLoaderData() as Error | string

  return (
        <div>
            {parseQueryParams(loaderData)}
        </div>
  )
}

export {
  AuthRedirect,
  authResultLoader,
  genericErrMsg,
  genericErrCause
}
