import TwitchNotificationEvent from "../models/Twitch";
import { ViewerEvent, ViewerEventType, ViewerEventSource } from "../models/ViewerEvent";

// Enum for type of WebSocket message.
enum MESSAGE_TYPE {
    NOTIFICAION = "notification",
    WELCOME = "session_welcome",
    KEEPALIVE = "session_keepalive",
    RECONNECT = "session_reconnect",
    REVOCATION = "revocation"
}

// Enum for type of notification received from WebSocket.
enum NOTIFICATION_TYPE {
    FOLLOW = "channel.follow",
}

// Singleton class for Twitch client.
class TwitchWSClient {
    private URL: string;
    private token: string;
    private clientId: string;
    private client?: WebSocket;
    private sessionId: string;
    private sendEvent: (event: ViewerEvent) => void; // Function to return events back to the main app.
    public isInitialized: boolean;

    public constructor(URL: string, token: string, clientId: string, sendEvent: (event: ViewerEvent) => void) {
        this.URL = URL;
        this.token = token;
        this.clientId = clientId;
        this.sendEvent = sendEvent;
        this.isInitialized = false;
        this.sessionId = "placeholder"; // TODO not this. Allow to be undefined and initialize in method probably
        this.client = undefined;
    }

    public async initialize() {
        this.client = new WebSocket(this.URL);

        let wsConnectionInitDone: () => void;
        const connectedCallback = new Promise(function(resolve) {
            wsConnectionInitDone = resolve as () => void;
        })

        if (this.client == null) {
            console.log("Something went wrong setting up WebSocket!")
            return
        }

        let onMessageHandler = (msg: MessageEvent<any>) => {
            const messageJson = JSON.parse(msg.data);
            const metadata = messageJson?.metadata;
            console.log("Metadata: ")
            console.log(metadata)

            switch(metadata.message_type) {
                case MESSAGE_TYPE.WELCOME: {
                    console.log("GOT WELCOME MESSAGE. Session ID: ", messageJson.payload.session.id);
                    this.sessionId = messageJson.payload.session.id;
                    this.isInitialized = true;
                    wsConnectionInitDone();
                    break;
                }
                case MESSAGE_TYPE.NOTIFICAION: {
                    const rawEvent = messageJson as TwitchNotificationEvent;
                    let event: ViewerEvent;

                    // TODO certainly should refactor this out - avoid nested switch statements!
                    switch(rawEvent.metadata.subscription_type) {
                        case NOTIFICATION_TYPE.FOLLOW: {
                            event = {
                                type: ViewerEventType.FOLLOW,
                                source: ViewerEventSource.TWITCH,
                                userName: rawEvent.payload.event.user_name,
                                timestamp: rawEvent.payload.event.followed_at
                            }
                            
                            // show as notify
                            this.sendEvent(event);
                            break;
                        }
                        default: {
                            console.log("Unrecognized type: ", rawEvent.metadata.subscription_type)
                        }
                    }
                    break;
                }
                default: { // keepalive is default, don't need to do anything
                    break
                }
            }
        }

        this.client.onopen = (msg: Event) => {
            console.log("CLIENT OPENED")
            console.log(msg)
        }

        this.client.onclose = function(msg: Event) {
            console.log("CLIENT CLOSED")
            console.log(msg)
        }

        this.client.onmessage = onMessageHandler;
        console.log("WAITING FOR CONNECTED CALLBACK")
        await connectedCallback;
        console.log("TWITCH CLIENT SETUP DONE");
    }

    public async subscribeToEvent(eventType: string, broadcasterId: string) {
        const data = {
            type: eventType, //"channel.follow",
            version: "1",
            condition: { "broadcaster_user_id": broadcasterId},
            transport: {"method": "websocket", "session_id": this.sessionId}
        }

        console.log("Trying to subscribe to event!")
        console.log("Session ID: ", this.sessionId)

        const resp = await fetch(
            "https://api.twitch.tv/helix/eventsub/subscriptions", 
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.token}`,
                    "Client-Id": this.clientId, // TODO ENVIRONMENT VARIABLE,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }
        )
        let msg = await resp.json();
        console.log(msg);
    }

    // Extract event information 
    public getFollowEvent() {

    }

    public getEventType() {

    }
}

export default TwitchWSClient