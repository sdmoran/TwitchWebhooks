import React, { useEffect, type ReactElement } from 'react'
import { type SubscriptionOption } from '../models/Twitch'
import SubscriptionSelector from './SubscriptionSelector'
import UserInfoCard from './UserInfoCard'

// Interface for method callback to return data from setup view.
interface ISetupViewProps {
  token: string
  clientId: string
}

// View to do all necessary setup for the app to run.
// Things that need to be done here:
// - Get authorizations for application
// - Get user ID from API
function SetupView (props: ISetupViewProps): ReactElement {
  const [twitchUserName, setTwitchUserName] = React.useState('')
  const [userInfo, setUserInfo] = React.useState({ id: undefined })
  const [err, setErr] = React.useState('')
  const [eventsWithScopes, setEventsWithScopes] = React.useState([] as SubscriptionOption[])

  const getScopes = async function (): Promise<void> {
    const scopes = await fetch('/api/scopes',
      {
        method: 'GET'
      })
    const scopeJson = await scopes.json()
    console.log(scopeJson)
    setEventsWithScopes(scopeJson)
  }

  const handleChange = function (event: React.ChangeEvent<HTMLInputElement>): void {
    setTwitchUserName(event.target.value)
  }

  useEffect(() => {
    getScopes()
      .catch((e) => {
        setErr(`Failed to get scopes from backend: ${(e as Error).message}`)
      })
  }, [])

  const getUserId = async function (userName: string): Promise<void> {
    if (userName.length < 1) {
      return
    }
    try {
      const resp = await fetch(
        `${window.location.origin}/api/user/${userName}`, // get user name and image from backend
        {
          method: 'GET'
        }
      )

      const respBody = await resp.json()

      // eslint-disable-next-line
      if (resp.status === 200 && respBody.data && respBody.data.length > 0 && respBody.data[0].id) { 
        // TODO ERROR HANDLING and checking for data[0].id etc...
        const userInfo = respBody?.data[0]
        setUserInfo(userInfo)
        setErr('')
      } else {
        // On resubmit, reset user so we don't have user card AND error message displayed
        setErr('Failed to get User ID from Twitch!')
        setUserInfo({ id: undefined })
      }
    } catch (e) {
      setErr(`Failed to request a UserId from Twitch: ${(e as Error).message}`)
    }
  }

  let userInfoCard
  let submitButton
  if (userInfo.id !== undefined) {
    userInfoCard = <UserInfoCard user={userInfo}/>
    submitButton = <button onClick={() => { window.location.href = 'https://id.twitch.tv/oauth2/authorize?response_type=token&amp;client_id=153e68kq58wn04srqjrf6cuc9vw329&amp;scope=chat%3Aread+moderator%3Aread%3Afollowers&amp;redirect_uri=http://localhost:3000/auth/redirect' }}>Authenticate with Twitch to Subscribe to Notifications {'>>'}</button>
  }

  return (
    <div className="Setup">
      <h1>Setup</h1>
      <p>Enter the name of a Twitch user below to subscribe to notifications when events occur (like a user following the channel).</p>
      <p>After selecting event subscriptions, you will be prompted to login. Your account may need to be granted access to be notified when some events occur.</p>

      <div className="container">
        <input type="text" value={twitchUserName} onChange={handleChange} placeholder="Twitch Username"></input>
        {/* eslint-disable-next-line */}
        <button onClick={async (): Promise<void> => { await getUserId(twitchUserName) }}>Get User ID</button>
        <div>
            {userInfoCard}
            <h2>{err}</h2>
        </div>
        <br/>
        <SubscriptionSelector subscriptionTypes={eventsWithScopes}/>
        <br/>
        <br/>
        {submitButton}
      </div>
    </div>
  )
}

export default SetupView
