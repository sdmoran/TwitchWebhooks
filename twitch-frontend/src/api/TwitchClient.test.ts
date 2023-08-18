import { validateToken, type TokenResponse } from './TwitchClient' // Update the path to your TypeScript file
import fetchMock from 'jest-fetch-mock'

fetchMock.enableMocks()

describe('validateToken function', () => {
  const mockToken = 'mockAccessToken'
  const mockResponse: TokenResponse = {
    client_id: 'mockClientId',
    expires_in: 3600,
    login: 'mockLogin',
    scopes: ['mockScope'],
    user_id: 'mockUserId'
  }

  beforeEach(() => {
    fetchMock.resetMocks() // Reset fetch mock before each test
  })

  it('should return valid token response when the fetch is successful', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse), { status: 200 })

    const result = await validateToken(mockToken)

    expect(result).toEqual(mockResponse)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://id.twitch.tv/oauth2/validate',
      expect.objectContaining({
        method: 'GET',
        headers: {
          Authorization: `OAuth ${mockToken}`
        }
      })
    )
  })

  it('should reject with an error when the fetch fails', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 401 })

    await expect(validateToken(mockToken)).rejects.toThrow('Failed to validate token')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://id.twitch.tv/oauth2/validate',
      expect.objectContaining({
        method: 'GET',
        headers: {
          Authorization: `OAuth ${mockToken}`
        }
      })
    )
  })

  it('should handle JSON parsing error', async () => {
    fetchMock.mockResponseOnce('invalid-json', { status: 200 })

    await expect(validateToken(mockToken)).rejects.toThrow('Failed to parse token response')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://id.twitch.tv/oauth2/validate',
      expect.objectContaining({
        method: 'GET',
        headers: {
          Authorization: `OAuth ${mockToken}`
        }
      })
    )
  })
})
