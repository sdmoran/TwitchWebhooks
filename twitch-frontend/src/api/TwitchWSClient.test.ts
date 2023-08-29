import { TwitchWSClient, NOTIFICATION_TYPE, MESSAGE_TYPE } from './TwitchWSClient'
import Server from 'jest-websocket-mock'

describe('TwitchWSClient', () => {
  let server: Server

  beforeEach(() => {
    // Create a mock WebSocket server
    server = new Server('ws://localhost:1234')
  })

  afterEach(() => {
    // Clean up the mock WebSocket server after each test
    server.close()
  })

  it('should initialize the WebSocket client', async () => {
    const sendEventMock = jest.fn()
    const client = new TwitchWSClient('ws://localhost:1234', 'token', 'clientId', sendEventMock)

    // Simulate the WebSocket server sending a welcome message
    const welcomeMessage = {
      metadata: { message_type: MESSAGE_TYPE.WELCOME },
      payload: { session: { id: 'session123' } }
    }

    server.on('connection', () => {
      server.send(JSON.stringify(welcomeMessage))
    })

    await client.initialize()

    // Check that the session ID and isInitialized flag are correctly set
    expect(client.sessionId).toBe('session123')
    expect(client.isInitialized).toBe(true)
  })

  it('should subscribe to follow events', async () => {
    const sendEventMock = jest.fn()
    const client = new TwitchWSClient('ws://localhost:1234', 'token', 'clientId', sendEventMock)
    client.sessionId = 'session123' // Set a session ID

    // Mock the fetch response for successful subscription
    const response = new Response(JSON.stringify({}), { status: 202 })
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValueOnce(response)

    await client.subscribeToEvent(NOTIFICATION_TYPE.FOLLOW, 'broadcaster123')

    // Check that the correct data was sent in the fetch request
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.twitch.tv/helix/eventsub/subscriptions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token',
          'Client-Id': 'clientId',
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
          type: NOTIFICATION_TYPE.FOLLOW,
          version: '2',
          condition: { broadcaster_user_id: 'broadcaster123', moderator_user_id: 'broadcaster123' },
          transport: { method: 'websocket', session_id: 'session123' }
        })
      })
    )

    fetchMock.mockRestore()
  })
})
