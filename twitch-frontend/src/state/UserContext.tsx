import React, { createContext, type ReactNode, useContext, useState } from 'react'
import CookieManager from './Cookies'
import { type UserData } from './Types'

interface Props {
  children?: ReactNode
}

interface UserContextType {
  userData: UserData
  setUserData: any
}

const setUserData = (): void => { }

const placeholder = {
  userData: {
    username: '',
    token: { value: '', scopes: [] },
    twitchId: ''
  },
  setUserData
}

const UserContext = createContext<UserContextType>(placeholder)

const useUserContext = (): UserContextType => useContext(UserContext)

const UserContextProvider = function ({ children }: Props): any {
  const cookieManager = CookieManager.getInstance()
  const userData = cookieManager.getUserData(cookieManager.getActiveUserName())
  const [user, _setUser] = useState<UserData>(userData)

  const setUser = async function (user: UserData): Promise<void> {
    await cookieManager.storeUserData(user)
    await cookieManager.setActiveUserName(user.username)
    _setUser(user)
  }

  const value = React.useMemo(() => ({
    userData: user,
    setUserData: setUser
  }), [user, setUser])

  return (
    <UserContext.Provider value = {value}>
     {children}
    </UserContext.Provider>
  )
}

export {
  UserContextProvider,
  UserContext,
  useUserContext,
  type UserData
}
