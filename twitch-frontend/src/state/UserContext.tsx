import React, { createContext, type ReactNode, useContext, useState } from 'react'
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
    token: ''
  },
  setUserData
}

const UserContext = createContext<UserContextType>(placeholder)

const useUserContext = (): UserContextType => useContext(UserContext)

const UserContextProvider = function ({ children }: Props): any {
  const [user, setUser] = useState<UserData>({ username: '', token: '' })

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
