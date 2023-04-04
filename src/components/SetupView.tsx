import React, { type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import SubscriptionSelector from './SubscriptionSelector'
import UserInfoCard from './UserInfoCard'
import { EVENT_TYPES_URL_PARAMETER, PREVIEW_URL_PARAMETER } from '../constants'

const SUBSCRIPTION_OPTIONS = [
  {
    type: 'channel.follow',
    friendlyName: 'Channel Follow',
    requiredPermission: 'moderator:read:followers',
    selected: false
  }
]

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
  const [preview, setPreview] = React.useState(true)

  const handleChange = function (event: React.ChangeEvent<HTMLInputElement>): void {
    setTwitchUserName(event.target.value)
  }

  const handleNavigate = (): void => {
    const route = `/notifications/${userInfo.id ?? '404'}`
    const selectedEventNames = SUBSCRIPTION_OPTIONS.filter((elt) => { return elt.selected }).map((elt) => { return elt.type })
    const params = new URLSearchParams()
    params.append(EVENT_TYPES_URL_PARAMETER, selectedEventNames.join(','))
    if (preview) {
      params.append(PREVIEW_URL_PARAMETER, '1')
    }
    navigate(`${route}?${params.toString()}`)
  }

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

  const navigate = useNavigate()

  let userInfoCard
  let submitButton
  if (userInfo.id !== undefined) {
    userInfoCard = <UserInfoCard user={userInfo}/>
    submitButton = <button onClick={() => { handleNavigate() }}>Subscribe to Follower Notifications {'>>'}</button>
  }

  return (
        <div className="Setup">
            <h1>Setup</h1>
            <p>Enter the name of a Twitch user below to subscribe to events.</p>

            <div className="container">
                <input type="text" value={twitchUserName} onChange={handleChange} placeholder="Twitch Username"></input>
                {/* eslint-disable-next-line */}
                <button onClick={async (): Promise<void> => { await getUserId(twitchUserName) }}>Get User ID</button>
                <div>
                    {userInfoCard}
                    <h2>{err}</h2>
                </div>
                <br/>
                <SubscriptionSelector subscriptionTypes={SUBSCRIPTION_OPTIONS}/>
                <br/>
                <h2>Show preview?
                    {/* Feels a little weird to have a button inside a header, but W3C says it's ok so I'm going with it :) */}
                    <button
                        onClick={() => { setPreview(!preview) }}
                        className={preview ? 'ToggleButton active' : 'ToggleButton'}
                    >
                        {preview ? 'Yes' : 'No'}
                    </button>
                </h2>
                <p>If &quot;Show Preview&quot; is selected, the notification page will display an example notification when it is first loaded. This may be useful for positioning the element in OBS.</p>
                <br/>
                <p>After you&apos;ve selected the events you want to display on your stream, click the button below to be redirected to a page where notifications will appear whenever the events you&apos;ve selected occur.</p>
                <p>Then, <b>copy the URL and paste it into your OBS as a Browser Source</b>, and position or resize however you want.</p>
                {submitButton}
            </div>
        </div>
  )
}

export default SetupView
