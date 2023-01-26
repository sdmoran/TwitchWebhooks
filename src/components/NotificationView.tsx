import React, { useEffect } from "react";
import Notification from "./Notification";
import { LoaderFunctionArgs, useLoaderData, useSearchParams } from "react-router-dom";
import { ViewerEvent, ViewerEventSource, ViewerEventType } from "../models/ViewerEvent";
import TwitchWSClient from "../api/TwitchWSClient";
import ErrorMessage from "./ErrorMessage";

const WEBSOCKET_URL = "wss://eventsub-beta.wss.twitch.tv/ws";
const TOKEN = process.env.REACT_APP_TWITCH_TOKEN || "fake_token";
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || "fake_client_id";

const TEST_EVENT: ViewerEvent = {
    type: ViewerEventType.FOLLOW,
    source: ViewerEventSource.TWITCH,
    userName: "Sample User",
    timestamp: "now"
}

function twitchUserIdLoader(data: LoaderFunctionArgs) {
    return data.params;
}

function NotificationView() {
    // Get loader data from router. TODO types for this
    const obj = useLoaderData() as any;
    const [userId, setUserId] = React.useState(obj?.twitchUserId); 
    const [error, setError] = React.useState<Error | undefined>(undefined);
    const [messageDisplaySeconds, setMessageDisplaySeconds] = React.useState(5);
    const [displayMessage, setDisplayMessage] = React.useState(false);
    const [events, setEvents] = React.useState<Array<ViewerEvent>>([]);
    const [currentEvent, setCurrentEvent] = React.useState<ViewerEvent | undefined>(undefined);
    const [twitchClient, setTwitchClient] = React.useState<TwitchWSClient>(new TwitchWSClient(WEBSOCKET_URL, TOKEN, CLIENT_ID, receiveEvent));
    const [queryParams, setQueryParams] = useSearchParams();

    function receiveEvent(event: ViewerEvent) {
        setEvents([...events, event])
        showNotification(event) // TODO make so this won't overwrite if multiple follows in succession. Queue it up somehow.
    }

    // On view creation, setup client
    useEffect(() => {
        const init = async () => {
            await twitchClient.initialize();
            const subscribeErr = await setupSubscription("channel.follow", userId);
            if (subscribeErr != undefined) {
                setError(subscribeErr);
                return
            }
            if (queryParams.get("showTest") === "1") {
                showNotification(TEST_EVENT); // Test event will now show once on initial page render.
            }
        }
        init();
    }, [])

    // Show notification message at top of screen for a duration.
    function showNotification(event: ViewerEvent) {
        setDisplayMessage(true)
        setCurrentEvent(event)

        setTimeout(() => {
        setDisplayMessage(false)
        }, messageDisplaySeconds * 1000)
    }

    // Call Twitch API and enable subscription for the provided userId.
    async function setupSubscription(eventType: string, userId: string): Promise<Error | undefined> {
        if (twitchClient == undefined) {
            Promise.resolve(new Error("SubscriptionSetupFailed", {cause: "TwitchClient is undefined"}));
        }
        return twitchClient.subscribeToEvent(eventType, userId);
    }

    const elt = error ? <ErrorMessage err={error}/> : <Notification viewerEvent={currentEvent} show={displayMessage}/>;

    return (
        <div className="container">
            {elt}
        </div>
    )
}

export {
    NotificationView,
    twitchUserIdLoader
};