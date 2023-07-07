const getScopes = async function (): Promise<any> {
  const scopes = await fetch('/api/scopes',
    {
      method: 'GET'
    })
  // TODO error handling!!!!
  return await scopes.json()
}

export {
  getScopes
}
