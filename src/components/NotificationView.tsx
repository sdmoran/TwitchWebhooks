import React, { type ReactElement, useEffect } from 'react'
import Notification from './Notification'
import { type LoaderFunctionArgs, useLoaderData, useSearchParams, type Params } from 'react-router-dom'
import { type ViewerEvent, ViewerEventSource, ViewerEventType } from '../models/ViewerEvent'
import TwitchWSClient from '../api/TwitchWSClient'
import ErrorMessage from './ErrorMessage'
import { EVENT_TYPES_URL_PARAMETER, PREVIEW_URL_PARAMETER } from '../constants'
import { useUserContext } from '../state/UserContext'

const WEBSOCKET_URL = 'wss://eventsub-beta.wss.twitch.tv/ws'
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID ?? 'fake_client_id'

const TEST_EVENT: ViewerEvent = {
  type: ViewerEventType.FOLLOW,
  source: ViewerEventSource.TWITCH,
  userName: 'Sample User',
  timestamp: 'now'
}

function twitchUserIdLoader (data: LoaderFunctionArgs): Params<string> {
  return data.params
}

function NotificationView (): ReactElement {
  const { userData } = useUserContext()
  const TOKEN = userData.token

  // Get loader data from router. TODO types for this
  const obj = useLoaderData() as any
  const [userId] = React.useState(obj?.twitchUserId)
  const [error, setError] = React.useState<Error | undefined>(undefined)
  const [messageDisplaySeconds] = React.useState(5)
  const [displayMessage, setDisplayMessage] = React.useState(false)
  const [events, setEvents] = React.useState<ViewerEvent[]>([])
  const [currentEvent, setCurrentEvent] = React.useState<ViewerEvent | undefined>(undefined)
  const [twitchClient] = React.useState<TwitchWSClient>(new TwitchWSClient(WEBSOCKET_URL, TOKEN, CLIENT_ID, receiveEvent))
  const [queryParams] = useSearchParams()

  function receiveEvent (event: ViewerEvent): void {
    setEvents([...events, event])
    showNotification(event) // TODO make so this won't overwrite if multiple follows in succession. Queue it up somehow.
  }

  // On view creation, setup client
  useEffect((): void => {
    const init = async (): Promise<void> => {
      await twitchClient.initialize()

      const subscriptions = queryParams.get(EVENT_TYPES_URL_PARAMETER)
      if (subscriptions === null || subscriptions?.length < 1) {
        setError(new Error(
          'No subscriptions selected!',
          {
            cause: 'Make sure you include the ENTIRE URL when copying.'
          }
        ))
        return
      }

      // Get subscriptions and subscribe one at a time, error and stop if something goes wrong.
      for (const subscription of subscriptions.split(',')) {
        const subscribeErr = await setupSubscription(subscription, userId)
        if (subscribeErr !== null) {
          setError(subscribeErr)
          break
        }
      }

      // Test event will show once on initial page render if query parameter present.
      if (queryParams.get(PREVIEW_URL_PARAMETER) === '1') {
        showNotification(TEST_EVENT)
      }
    }
    init().catch(() => { console.log('FAILED TO RENDER') })
  }, [])

  // Show notification message at top of screen for a duration.
  function showNotification (event: ViewerEvent): void {
    setDisplayMessage(true)
    setCurrentEvent(event)

    setTimeout(() => {
      setDisplayMessage(false)
    }, messageDisplaySeconds * 1000)
  }

  // Call Twitch API and enable subscription for the provided userId.
  async function setupSubscription (eventType: string, userId: string): Promise<Error | undefined> {
    if (twitchClient === undefined) {
      return new Error('SubscriptionSetupFailed', { cause: 'TwitchClient is undefined' })
    }
    return await twitchClient.subscribeToEvent(eventType, userId)
  }

  const elt = (error != null) ? <ErrorMessage err={error}/> : <Notification viewerEvent={currentEvent} show={displayMessage} />

  return (
        <div className="container">
            {elt}
        </div>
  )
}

export {
  NotificationView,
  twitchUserIdLoader
}
