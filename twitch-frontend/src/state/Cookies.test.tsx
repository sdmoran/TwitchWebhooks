import CookieManager from './Cookies'

const cookieManager = CookieManager.getInstance()

test('Test writing and reading users from cookies', async () => {
  const jeff = {
    username: 'jeff',
    token: {
      value: 'jeff_token',
      scopes: ['jeff:read', 'jeff:moderator:jeff']
    },
    twitchId: '123jeff567890'
  }
  await cookieManager.storeUserData(jeff)

  const steff = {
    username: 'steff',
    token: {
      value: 'steff_token',
      scopes: ['steff:read', 'steff:moderator:steff']
    },
    twitchId: '123steff567890'
  }

  await cookieManager.storeUserData(steff)
  let result = cookieManager.getUserData('jeff')
  expect(result).toEqual(jeff)
  result = cookieManager.getUserData('steff')
  expect(result).toEqual(steff)
})
