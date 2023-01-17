interface TwitchNotificationEventMetadata {
    message_id: string
    message_timestamp: string
    message_type: string
    subscription_type: string
    subscription_version: string
}

interface TwitchNotificationEventPayload {
    event: PayloadEvent
    subscription: PayloadSubscription
}

interface PayloadEvent {
    broadcaster_user_id: string
    broadcaster_user_login: string
    broadcaster_user_name: string
    followed_at: string // TODO is this on everything???
    user_id: string
    user_login: string
    user_name: string
}

interface TwitchTransport {
    method: string
    session_id?: string
    // TODO this can def also have things for HTTP instead of websocket implementations
}

interface TwitchSubscriptionCondition {
    broadcaster_user_id: string
}

interface PayloadSubscription {
    condition: TwitchSubscriptionCondition
    cost: number
    created_at: string
    id: string
    status: string
    transport: TwitchTransport
    type: string
    version: string
}

interface TwitchNotificationEvent {
    metadata: TwitchNotificationEventMetadata
    payload: TwitchNotificationEventPayload
}

export default TwitchNotificationEvent;