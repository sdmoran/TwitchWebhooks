import React, { type ReactElement, useEffect, useState } from 'react'
import Notification, { type CustomizeOptions } from './Notification'
import { type LoaderFunctionArgs, useLoaderData, useSearchParams, type Params } from 'react-router-dom'
import { type ViewerEvent, ViewerEventSource, ViewerEventType } from '../models/ViewerEvent'
import { TwitchWSClient } from '../api/TwitchWSClient'
import { EVENT_TYPES_URL_PARAMETER, PREVIEW_URL_PARAMETER } from '../constants'
import { useUserContext } from '../state/UserContext'
import CookieManager from '../state/Cookies'
import ErrorMessage from './ErrorMessage'

const WEBSOCKET_URL = 'wss://eventsub.wss.twitch.tv/ws'
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
  const AUDIO_PATH = '/twinkle.mp3'

  // Get loader data from router. TODO types for this
  const obj = useLoaderData() as any
  const [userId] = React.useState(obj?.twitchUserId)
  const [error, setError] = React.useState<Error | undefined>(undefined)
  const [events, setEvents] = React.useState<ViewerEvent[]>([])
  const [currentEvent, setCurrentEvent] = React.useState<ViewerEvent | undefined>(undefined)
  const [twitchClient] = React.useState<TwitchWSClient>(new TwitchWSClient(WEBSOCKET_URL, userData.token.value, CLIENT_ID, receiveEvent))
  const [queryParams] = useSearchParams()
  const [options, setOptions] = useState<CustomizeOptions>({ color: '', audioFileName: '' })

  function receiveEvent (event: ViewerEvent): void {
    setEvents([...events, event])
  }

  // TODO consider moving to Notification. Could be customizable with options too
  async function playAudioCue (audioPath: string): Promise<void> {
    const audio = new Audio(audioPath)
    await audio.play()
  }

  useEffect(() => {
    if (events.length > 0 && (currentEvent == null)) {
      // Start displaying events if there are events in the list and no current event being displayed
      setCurrentEvent(events[0])
      void playAudioCue(AUDIO_PATH)
      setEvents(prevEvents => prevEvents.slice(1))
    }
  }, [events, currentEvent])

  useEffect(() => {
    if (currentEvent != null) {
      // Display the current event for 3 seconds TODO make configurable
      const timeoutId = setTimeout(() => {
        setCurrentEvent(undefined)
      }, 3000)

      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [currentEvent])

  // On view creation, setup client
  useEffect((): void => {
    const init = async (): Promise<void> => {
      // Setup twitch client
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

      // Read options from cookies
      const options = CookieManager.getInstance().readNotificationOptions()
      if (options !== undefined) {
        setOptions(options)
      }

      // Test event will show once on initial page render if query parameter present.
      if (queryParams.get(PREVIEW_URL_PARAMETER) === '1') {
        receiveEvent(TEST_EVENT)
      }
    }

    init().catch((e) => { console.log('FAILED TO RENDER'); console.log(e) })
  }, [])

  // Call Twitch API and enable subscription for the provided userId.
  async function setupSubscription (eventType: string, userId: string): Promise<Error | undefined> {
    if (twitchClient === undefined) {
      return new Error('SubscriptionSetupFailed', { cause: 'TwitchClient is undefined' })
    }
    return await twitchClient.subscribeToEvent(eventType, userId)
  }

  return (
    <div className="container">
      {
        error !== undefined
          ? <ErrorMessage err={error} />
          : <Notification viewerEvent={currentEvent} customizeOptions={options} />
      }
    </div>
  )
}

export {
  NotificationView,
  twitchUserIdLoader
}
