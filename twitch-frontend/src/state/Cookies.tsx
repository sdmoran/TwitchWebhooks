import { COOKIE_NAME } from '../constants'
import { type UserData } from './Types'

interface CookieData {
    ActiveUserName: string
    Users: UserData[]
}

// Get ALL UserData from cookies.
function getAllUserData (): UserData[] {
    const c = readCookie()
    return c.Users
}

function getActiveUserName(): string {
    const c = readCookie()
    return c.ActiveUserName
}

function setActiveUserName(username: string) {
    const c = readCookie()
    c.ActiveUserName = username
    writeCookie(c)
}

// Try to get UserData matching a username from cookies.
function getUserData (username: string): UserData {
  const userDataList = getAllUserData()
  console.log(userDataList)
  for (const userData of userDataList) {
    if (userData.username === username) {
      return userData
    }
  }
  // Empty user if not found. TODO revisit, maybe null instead?
  return { username: '', token: { value: '', scopes: [] }, twitchId: '' }
}

// Store an array of UserData objects.
function storeAllUserData (userData: UserData[]): void {
    const c = readCookie()
    c.Users = userData
    writeCookie(c)
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


// Type guard for CookieData
function isCookieData(c: CookieData | object): c is CookieData {
    return 'Users' in c && 'Token' in c
}

// Read all cookies from storage and write to 
function readCookie(): CookieData {
    function getCookie(name: string) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts != undefined && parts.length === 2) {
            return parts[1].split(';').shift();
        }
      }

    const c = getCookie(COOKIE_NAME) || ""
    try {
        const parsed = JSON.parse(c) as CookieData
        if (isCookieData(parsed)) {
            return parsed
        } else {
            throw Error('Could not deserialize cookie into CookieData!')
        }
    } catch(e) {
        console.log(e)
        return {
            ActiveUserName: '',
            Users: [],
        }
    }
}

function writeCookie(c: CookieData) {
    document.cookie = `${COOKIE_NAME}=${JSON.stringify(c)}` // expiry?
}

export {
  storeUserData,
  getUserData,
  setActiveUserName,
  getActiveUserName,
}
