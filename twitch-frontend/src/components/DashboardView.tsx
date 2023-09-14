/*
Dashboard.
A few options from here:
- go to notification view
- change permissions/account (clears token)
*/

import React, { useEffect, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { getScopes } from '../api/LocalAPI'
import { EVENT_TYPES_URL_PARAMETER, PREVIEW_URL_PARAMETER } from '../constants'
import { type SubscriptionOption } from '../models/Twitch'
import CookieManager from '../state/Cookies'
import { useUserContext } from '../state/UserContext'
import SubscriptionSelector from './SubscriptionSelector'

function DashboardView (): ReactElement {
  const [preview, setPreview] = React.useState(true)
  const { userData } = useUserContext()
  const [eventsWithScopes, _setEventsWithScopes] = React.useState([] as SubscriptionOption[])

  const setup = async function (): Promise<void> {
    try {
      const scopes = await getScopes()
      setEventsWithScopes(scopes)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    void setup()
  }, [])

  const setEventsWithScopes = function (scopes: SubscriptionOption[]): void {
    _setEventsWithScopes(scopes)
  }

  const navigate = useNavigate()

  const handleNavigate = (): void => {
    const route = userData.twitchId.length < 1 ? '/404' : `/notifications/${userData.twitchId}` // TODO better error handling, 404 not very descriptive
    const selectedEventNames = eventsWithScopes.filter((elt) => { return elt.selected }).map((elt) => { return elt.name })
    const params = new URLSearchParams()
    params.append(EVENT_TYPES_URL_PARAMETER, selectedEventNames.join(','))
    if (preview) {
      params.append(PREVIEW_URL_PARAMETER, '1')
    }
    navigate(`${route}?${params.toString()}`)
  }

  return (
    <div className='container'>
      <h1>Dashboard</h1>
      <h2>Notification Settings</h2>
      <p>Manage your notification settings here. Select the events you would like to appear, then click the button to go to the Notification page.</p>

        <h3>Scopes Provided by Token</h3>
        <p>These are the available scopes you can select for this account based on your current authorization token.</p>
        <div className='list-container'>
        <ul>
          {userData.token.scopes.map(elt => { return <li key={elt}>{elt}</li> })}
        </ul>
      </div>

      <SubscriptionSelector subscriptionTypes={eventsWithScopes} setSubscriptionTypes={setEventsWithScopes}/>

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

      <p>After you&apos;ve selected the events you want to display on your stream, click the button below to be redirected to a page where notifications will appear whenever the events you&apos;ve selected occur.</p>
      <p>Then, <b>copy the URL and paste it into your OBS as a Browser Source</b>, and position or resize however you want.</p>

      <button onClick={() => { handleNavigate() }}>Go to Notification View</button>
      <h2>Clear Credentials</h2>
      <p>If needed, you can clear your credentials and select new events to follow, then sign back in using the button below.</p>
      <button onClick={() => { CookieManager.getInstance().deleteAllCookies() }}>Clear Credentials</button>
    </div>
  )
}

export default DashboardView
