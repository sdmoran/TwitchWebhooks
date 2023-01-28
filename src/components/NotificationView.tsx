import React, { useEffect } from "react";
import Notification from "./Notification";
import { LoaderFunctionArgs, useLoaderData, useSearchParams } from "react-router-dom";
import { ViewerEvent, ViewerEventSource, ViewerEventType } from "../models/ViewerEvent";
import TwitchWSClient from "../api/TwitchWSClient";
import ErrorMessage from "./ErrorMessage";
import { EVENT_TYPES_URL_PARAMETER, PREVIEW_URL_PARAMETER } from "../constants";

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

            const subscriptions = queryParams.get(EVENT_TYPES_URL_PARAMETER);
            if(subscriptions == undefined || subscriptions?.length < 1) {
                setError(new Error(
                    "No subscriptions selected!",
                    {
                        cause: "Make sure you include the ENTIRE URL when copying."
                    }
                ));
                return
            }

            // Get subscriptions and subscribe one at a time, error and stop if something goes wrong.
            for(let subscription of subscriptions.split(",")) {
                const subscribeErr = await setupSubscription(subscription, userId);
                if (subscribeErr != undefined) {
                    setError(subscribeErr);
                    break;
                }
            }
            
            // Test event will show once on initial page render if query parameter present.
            if (queryParams.get(PREVIEW_URL_PARAMETER) === "1") {
                showNotification(TEST_EVENT);
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