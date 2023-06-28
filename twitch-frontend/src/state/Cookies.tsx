import { type UserData } from './Types'

interface CookieData {
    Users: UserData[]
    Token: string
}

// Get ALL UserData from cookies.
function getAllUserData (): UserData[] {
    const c = readCookie()
    return c.Users
}

// Try to get UserData matching a username from cookies. If not found, returns null.
function getUserData (username: string): UserData | null {
  const userDataList = getAllUserData()
  console.log(userDataList)
  for (const userData of userDataList) {
    if (userData.username === username) {
      return userData
    }
  }
  return null
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

function getToken (): string {
    const c = readCookie()
    return c.Token
}

function storeToken (token: string): void {
    const c = readCookie()
    c.Token = token
    writeCookie(c)
}

// Type guard for CookieData
function isCookieData(c: CookieData | object): c is CookieData {
    return 'Users' in c && 'Token' in c
}

// Read all cookies from storage and write to 
function readCookie(): CookieData {
    const c = document.cookie
    console.log(c)
    try {
        const parsed = JSON.parse(document.cookie) as CookieData
        if (isCookieData(parsed)) {
            return parsed
        } else {
            throw Error("Could not deserialize cookie into CookieData!")
        }
    } catch(e) {
        console.log(e)
        return {
            Users: [],
            Token: ""
        }
    }
}

function writeCookie(c: CookieData) {
    document.cookie = JSON.stringify(c) // expiry?
}

export {
  getToken,
  storeToken,
  storeUserData,
  getUserData
}
