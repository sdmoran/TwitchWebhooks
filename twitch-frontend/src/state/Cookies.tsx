import { type CustomizeOptions } from '../components/Notification'
import { USER_COOKIE_NAME, OPTIONS_COOKIE_NAME } from '../constants'
import { type UserData } from './Types'

interface CookieData {
  ActiveUserName: string
  Users: UserData[]
}

// Get ALL UserData from cookies.
function getAllUserData (): UserData[] {
  const c = readCookie(USER_COOKIE_NAME)
  if (c?.Users !== null) {
    return c.Users
  }
  return []
}

// Get ACTIVE user name from cookies.
// (active user is the user whose token is currently being used to subscribe to events.)
function getActiveUserName (): string {
  const c = readCookie(USER_COOKIE_NAME)
  if (c !== null) {
    return c.ActiveUserName
  }
  return ''
}

// Set active user name.
function setActiveUserName (username: string): void {
  const c = readCookie(USER_COOKIE_NAME)
  c.ActiveUserName = username
  writeCookie(c, USER_COOKIE_NAME)
}

// Try to get UserData matching a username from cookies. Returns empty user if not found TODO revisit, maybe null instead?
function getUserData (username: string): UserData {
  const userDataList = getAllUserData()
  if (userDataList !== undefined) {
    for (const userData of userDataList) {
      if (userData.username === username) {
        return userData
      }
    }
  }
  return { username: '', token: { value: '', scopes: [] }, twitchId: '' }
}

// Store an array of UserData objects.
function storeAllUserData (userData: UserData[]): void {
  let c = readCookie(USER_COOKIE_NAME)
  if (c === null || !guardType(c, isCookieData)) {
    c = { ActiveUserName: '', Users: [] }
  }
  c.Users = userData
  writeCookie(c, USER_COOKIE_NAME)
}

// Store a single UserData object
function storeUserData (userData: UserData): void {
  let userDataList = getAllUserData()
  if (userDataList === undefined) {
    userDataList = [userData]
  } else {
    for (const user of userDataList) {
      if (user.username === userData.username) {
        user.token = userData.token
        return
      }
    }
    userDataList.push(userData)
  }

  storeAllUserData(userDataList)
}

// Type guard for CookieData
function isCookieData (c: CookieData | object): c is CookieData {
  return 'Users' in c && 'Token' in c
}

// Type guard for CustomizeOptions

function guardType (obj: any, typeGuard: (c: any) => boolean): boolean {
  try {
    const parsed = JSON.parse(obj)
    return typeGuard(parsed)
  } catch (e) {
    console.log('Could not deserialize cookie!', e)
    return false
  }
}

// Read cookie with given name from storage
function readCookie (cookieName: string): any {
  function getCookie (name: string): string {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts !== undefined && parts.length === 2) {
      return parts[1].split(';').shift() ?? ''
    }
    return ''
  }

  const c = getCookie(cookieName) ?? ''

  try {
    const parsed = JSON.parse(c)
    return parsed
  } catch (e) {
    console.log("Couldn't parse cookie")
    return null
  }
}

// Write cookie for notifications options
function writeNotificationOptions (options: CustomizeOptions): void {
  writeCookie(options, OPTIONS_COOKIE_NAME)
}

// Read notification options
function readNotificationOptions (): CustomizeOptions {
  return readCookie(OPTIONS_COOKIE_NAME) as CustomizeOptions
}

function writeCookie (cookie: any, cookieName: string): void {
  document.cookie = `${cookieName}=${JSON.stringify(cookie)}` // expiry?
}

export {
  storeUserData,
  getUserData,
  setActiveUserName,
  getActiveUserName,
  writeNotificationOptions,
  readNotificationOptions
}
