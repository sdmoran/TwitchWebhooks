// TODO types
const getScopes = async function (): Promise<any> {
  try {
    const response = await fetch('/api/scopes', {
      method: 'GET'
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch scopes. Status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    throw new Error('Error fetching scopes!')
  }
}

export {
  getScopes
}
