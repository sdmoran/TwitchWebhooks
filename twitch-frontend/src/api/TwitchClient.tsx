interface TokenResponse {
  client_id: string
  expires_in: number
  login: string
  scopes: string[]
  user_id: string
}

async function validateToken (token: string): Promise<TokenResponse> {
  const resp = await fetch('https://id.twitch.tv/oauth2/validate',
    {
      method: 'GET',
      headers: {
        Authorization: `OAuth ${token}`
      }
    }
  )
  try {
    if (resp.ok) {
      return await resp.json() as TokenResponse
    }
  } catch {
    return await Promise.reject(new Error('Failed to parse token response'))
  }
  return await Promise.reject(new Error('Failed to validate token'))
}

export {
  validateToken,
  type TokenResponse
}
