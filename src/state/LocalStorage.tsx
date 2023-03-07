import React, { createContext, ReactNode, useContext, useState } from 'react'

const TOKEN_KEY = 'twitchUserToken'

function getToken(): string {
    return localStorage.getItem(TOKEN_KEY) ?? ""
}

function storeToken (token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
}

export {
    getToken,
    storeToken
}