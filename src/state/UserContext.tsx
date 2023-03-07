import React, { createContext, ReactNode, useContext, useState } from 'react'
import { getToken } from './LocalStorage'

interface Props {
    children?: ReactNode 
}

interface UserData {
  username: string,
  token: string,
}

interface UserContextType {
  userData: UserData,
  setUserData: any
}

const userdata =  {
  username: '',
  token: ''
}

const setUserData = () => { }

const placeholder = {
  userData: userdata,
  setUserData: setUserData
}

let UserContext = createContext<UserContextType>(placeholder);

const useUserContext = () => useContext(UserContext);

const UserContextProvider = function ( { children }: Props): any {
  const userInfo = {
    username: '',
    token: getToken()
  }

  const [user, setUser] = useState<UserData>(userInfo)

  const value = React.useMemo(() =>({
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
