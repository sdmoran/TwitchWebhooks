interface UserData {
  username: string // the user's Twitch username.
  token: TokenData // the Twitch token associated with the user, passed with requests to subscribe to events.
  twitchId: string // the Twitch ID of the user.
}

interface TokenData {
  value: string
  scopes: string[]
}

export {
  type UserData
}
