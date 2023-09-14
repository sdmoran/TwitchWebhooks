import { type CustomizeOptions } from '../components/Notification'
import { USER_COOKIE_NAME, ACTIVE_USER_COOKIE_NAME, OPTIONS_COOKIE_NAME } from '../constants'
import { type UserData } from './Types'

interface ActiveUser {
  UserName: string
}

interface CookieData {
  Users: UserData[]
}

class CookieManager {
  private static instance: CookieManager | null = null

  private constructor () {}

  public static getInstance (): CookieManager {
    if (this.instance === null) {
      this.instance = new CookieManager()
    }
    return this.instance
  }

  private getCookie (cookieName: string): any {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${cookieName}=`)
    if (parts !== undefined && parts.length === 2) {
      return parts[1].split(';').shift() ?? ''
    }
    return ''
  }

  public readCookie (cookieName: string): any {
    const c = this.getCookie(cookieName) ?? ''

    try {
      const parsed = JSON.parse(c)
      return parsed
    } catch (e) {
      return undefined
    }
  }

  public writeCookie (cookie: any, cookieName: string): void {
    const cookieStr = `${cookieName}=${JSON.stringify(cookie)}; path=/`
    console.log('Writing cookie', cookieStr)
    document.cookie = cookieStr
  }

  public deleteAllCookies (): void {
    const cookies = document.cookie.split(';')

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i]
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }

  // Get ALL UserData from cookies.
  public getAllUserData (): UserData[] {
    const c = this.readCookie(USER_COOKIE_NAME)
    if (c?.Users !== undefined) {
      return c.Users
    }
    return []
  }

  // Get ACTIVE user name from cookies.
  // (active user is the user whose token is currently being used to subscribe to events.)
  public getActiveUserName (): string {
    const c = this.readCookie(ACTIVE_USER_COOKIE_NAME)
    if (c !== undefined) {
      return c.UserName
    }
    return ''
  }

  // Set active user name.
  public async setActiveUserName (username: string): Promise<void> {
    const activeUser: ActiveUser = {
      UserName: username
    }
    this.writeCookie(activeUser, ACTIVE_USER_COOKIE_NAME)
    await Promise.resolve()
  }

  // Try to get UserData matching a username from cookies. Returns empty user if not found TODO revisit, maybe null instead?
  public getUserData (username: string): UserData {
    const userDataList = this.getAllUserData()
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
  public async storeAllUserData (userData: UserData[]): Promise<void> {
    let c = this.readCookie(USER_COOKIE_NAME)
    if (c === undefined || !this.guardType(c, this.isCookieData)) {
      c = { ActiveUserName: '', Users: [] }
    }
    c.Users = userData
    this.writeCookie(c, USER_COOKIE_NAME)
    await Promise.resolve()
  }

  // Store a single UserData object
  public async storeUserData (userData: UserData): Promise<void> {
    let userDataList = this.getAllUserData()
    if (userDataList === undefined) {
      userDataList = [userData]
    } else {
      for (const user of userDataList) {
        if (user.username === userData.username) {
          user.token = userData.token
          await Promise.resolve(); return
        }
      }
      userDataList.push(userData)
    }

    await this.storeAllUserData(userDataList)
    await Promise.resolve()
  }

  // Type guard for CookieData
  private isCookieData (c: CookieData | object): c is CookieData {
    return 'Users' in c && 'Token' in c
  }

  // Type guard to make sure the cookie being read is the expected type
  private guardType (obj: any, typeGuard: (c: any) => boolean): boolean {
    try {
      const parsed = JSON.parse(obj)
      return typeGuard(parsed)
    } catch (e) {
      console.log('Could not deserialize cookie!', e)
      return false
    }
  }

  // Write cookie for notifications options
  public writeNotificationOptions (options: CustomizeOptions): void {
    this.writeCookie(options, OPTIONS_COOKIE_NAME)
  }

  // Read notification options
  public readNotificationOptions (): CustomizeOptions {
    return this.readCookie(OPTIONS_COOKIE_NAME) as CustomizeOptions
  }
}

export default CookieManager
