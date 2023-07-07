import React, { createContext, type ReactNode, useContext, useState } from 'react'
import { getUserData, getActiveUserName, storeUserData, setActiveUserName } from './Cookies'
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
  const userData = getUserData(getActiveUserName())
  const [user, _setUser] = useState<UserData>(userData)

  const setUser = function (user: UserData): void {
    storeUserData(user)
    setActiveUserName(user.username)
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
