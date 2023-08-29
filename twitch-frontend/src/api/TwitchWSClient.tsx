import { type TwitchNotificationEvent } from '../models/Twitch'
import { type ViewerEvent, ViewerEventType, ViewerEventSource } from '../models/ViewerEvent'

// Enum for type of WebSocket message.
enum MESSAGE_TYPE {
  NOTIFICAION = 'notification',
  WELCOME = 'session_welcome',
  KEEPALIVE = 'session_keepalive',
  RECONNECT = 'session_reconnect',
  REVOCATION = 'revocation'
}

// Enum for type of notification received from WebSocket.
enum NOTIFICATION_TYPE {
  FOLLOW = 'channel.follow',
}

// Singleton class for Twitch client.
class TwitchWSClient {
  private readonly URL: string
  private readonly token: string
  private readonly clientId: string
  private client?: WebSocket
  public sessionId: string
  private readonly sendEvent: (event: ViewerEvent) => void // Function to return events back to the main app.
  public isInitialized: boolean

  public constructor (URL: string, token: string, clientId: string, sendEvent: (event: ViewerEvent) => void) {
    this.URL = URL
    this.token = token
    this.clientId = clientId
    this.sendEvent = sendEvent
    this.isInitialized = false
    this.sessionId = 'placeholder' // TODO not this. Allow to be undefined and initialize in method probably
    this.client = undefined
  }

  public async initialize (): Promise<void> {
    this.client = new WebSocket(this.URL)

    let wsConnectionInitDone: () => void
    const connectedCallback = new Promise(function (resolve) {
      wsConnectionInitDone = resolve as () => void
    })

    if (this.client == null) {
      console.log('Something went wrong setting up WebSocket!')
      return
    }

    const onMessageHandler = (msg: MessageEvent<any>): void => {
      const messageJson = JSON.parse(msg.data)
      const metadata = messageJson?.metadata
      console.log('Metadata: ')
      console.log(metadata)

      switch (metadata.message_type) {
        case MESSAGE_TYPE.WELCOME: {
          console.log('GOT WELCOME MESSAGE. Session ID: ', messageJson.payload.session.id)
          this.sessionId = messageJson.payload.session.id
          this.isInitialized = true
          wsConnectionInitDone()
          break
        }
        case MESSAGE_TYPE.NOTIFICAION: {
          const rawEvent = messageJson as TwitchNotificationEvent
          let event: ViewerEvent

          // TODO certainly should refactor this out - avoid nested switch statements!
          switch (rawEvent.metadata.subscription_type) {
            case NOTIFICATION_TYPE.FOLLOW: {
              event = {
                type: ViewerEventType.FOLLOW,
                source: ViewerEventSource.TWITCH,
                userName: rawEvent.payload.event.user_name,
                timestamp: rawEvent.payload.event.followed_at
              }

              // show as notify
              this.sendEvent(event)
              break
            }
            default: {
              console.log('Unrecognized type: ', rawEvent.metadata.subscription_type)
            }
          }
          break
        }
        default: { // keepalive is default, don't need to do anything
          break
        }
      }
    }

    this.client.onopen = (msg: Event) => {
      console.log('CLIENT OPENED')
      console.log(msg)
    }

    this.client.onclose = function (msg: Event) {
      console.log('CLIENT CLOSED')
      console.log(msg)
    }

    this.client.onmessage = onMessageHandler
    await connectedCallback
    console.log('TWITCH CLIENT SETUP DONE')
  }

  public async subscribeToEvent (eventType: string, broadcasterId: string): Promise<Error | undefined> {
    const data = {
      type: eventType, // "channel.follow",
      version: eventType === NOTIFICATION_TYPE.FOLLOW ? '2' : '1',
      condition: { broadcaster_user_id: broadcasterId, moderator_user_id: broadcasterId },
      transport: { method: 'websocket', session_id: this.sessionId }
    }

    console.log(`Trying to subscribe to ${eventType} for ${broadcasterId}`)
    console.log('Session ID: ', this.sessionId)

    const resp = await fetch(
      'https://api.twitch.tv/helix/eventsub/subscriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Client-Id': this.clientId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    )

    // Need data even on fail for error reporting
    const dataJson = await resp.json()
    if (resp.status !== 202) { // success status is 202 ACCEPTED, not 200 OK
      return await Promise.resolve(new Error('SubscriptionSetupFailed', { cause: dataJson.message }))
    } else {
      await Promise.resolve(undefined)
    }
  }
}

export {
  TwitchWSClient,
  NOTIFICATION_TYPE,
  MESSAGE_TYPE
}
