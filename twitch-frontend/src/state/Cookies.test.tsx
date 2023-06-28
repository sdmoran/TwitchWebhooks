import { getToken, storeToken, storeUserData, getUserData } from './Cookies'

test('Test writing and reading token from cookies', async () => {
    const token = "My cool token :)"
    storeToken(token)
    const result = getToken()
    expect(result).toEqual(token)
})

test('Test writing and reading users from cookies', async () => {
    const jeff = {
        username: 'jeff',
        token: {
            value: 'jeff_token',
            scopes: ['jeff:read', 'jeff:moderator:jeff']
        },
        twitchId: '123jeff567890'
    }
    storeUserData(jeff)

    const steff = {
        username: 'steff',
        token: {
            value: 'steff_token',
            scopes: ['steff:read', 'steff:moderator:steff']
        },
        twitchId: '123steff567890'
    }

    storeUserData(steff)
    let result = getUserData('jeff')
    expect(result).toEqual(jeff)
    result = getUserData('steff')
    expect(result).toEqual(steff)
})