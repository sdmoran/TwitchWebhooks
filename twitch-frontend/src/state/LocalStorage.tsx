import { type UserData } from './Types'

const USERDATA_KEY = 'twitchUserData'

// TODO so this should probably be cookies, not localstorage bc cookies are more secure.

// Get ALL UserData from localstorage.
function getAllUserData (): UserData[] {
  const storedData = localStorage.getItem(USERDATA_KEY)
  if (storedData !== null) {
    try {
      return JSON.parse(storedData) as UserData[]
    } catch {

    }
  }
  return []
}

// Try to get UserData matching a username from localstorage. If not found, returns null.
function getUserData (username: string): UserData | null {
  const userDataList = getAllUserData()
  for (const userData of userDataList) {
    if (userData.username === username) {
      return userData
    }
  }
  return null
}

// Store an array of UserData objects.
function storeAllUserData (userData: UserData[]): void {
  localStorage.setItem(USERDATA_KEY, JSON.stringify(userData))
}

function storeUserData (userData: UserData): void {
  const userDataList = getAllUserData()
  for (const user of userDataList) {
    if (user.username === userData.username) {
      user.token = userData.token
      return
    }
  }
  userDataList.push(userData)
  storeAllUserData(userDataList)
}

const TOKEN_KEY = 'twitchUserToken'

function getToken (): string {
  return localStorage.getItem(TOKEN_KEY) ?? ''
}

function storeToken (token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export {
  getToken,
  storeToken,
  storeUserData,
  getUserData
}
