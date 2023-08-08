import { getScopes } from './LocalAPI'
import fetchMock from 'jest-fetch-mock'

fetchMock.enableMocks()

describe('getScopes function', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  it('should fetch and return scopes', async () => {
    const mockResponse = {
      scopes: ['scope1', 'scope2']
    }

    fetchMock.mockResponseOnce(JSON.stringify(mockResponse))

    const scopes = await getScopes()

    expect(scopes).toEqual({ scopes: ['scope1', 'scope2'] })
    expect(fetchMock).toHaveBeenCalledWith('/api/scopes', {
      method: 'GET'
    })
  })

  it('should handle network error', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'))

    await expect(getScopes()).rejects.toThrowError('Error fetching scopes: Network error')
  })

  it('should handle non-successful response', async () => {
    const mockResponse = {
      ok: false
    }

    fetchMock.mockResponseOnce(JSON.stringify(mockResponse), { status: 404 })

    await expect(getScopes()).rejects.toThrowError('Failed to fetch scopes. Status: 404')
  })
})
