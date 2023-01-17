import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import Notification from "./components/Notification"
import TwitchWSClient from './api/TwitchWSClient';
import SetupView from './components/SetupView';
import { ViewerEvent, ViewerEventSource, ViewerEventType } from './models/ViewerEvent';

const WEBSOCKET_URL = "wss://eventsub-beta.wss.twitch.tv/ws";
const TOKEN = process.env.REACT_APP_TWITCH_TOKEN || "fake_token";
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || "fake_client_id";


const TEST_EVENT: ViewerEvent = {
  type: ViewerEventType.FOLLOW,
  source: ViewerEventSource.TWITCH,
  userName: "Sample User",
  timestamp: "now"
}

interface User {
  id: string
}

function App() {
  const [messageDisplaySeconds, setMessageDisplaySeconds] = React.useState(5);
  const [displayMessage, setDisplayMessage] = React.useState(false);
  const [user, setUser] = React.useState({} as User);
  const [events, setEvents] = React.useState<Array<ViewerEvent>>([]);
  const [currentEvent, setCurrentEvent] = React.useState<ViewerEvent | undefined>(undefined);
  const [twitchClient, setTwitchClient] = React.useState<TwitchWSClient | undefined>(undefined);

  function receiveEvent(event: ViewerEvent) {
    setEvents([...events, event])
    showNotification(event) // TODO make so this won't overwrite if multiple follows in succession. Queue it up somehow.
  }

  // Setup useEffect. Called once at app intialization.
  useEffect(() => {
    setTwitchClient(new TwitchWSClient(WEBSOCKET_URL, TOKEN, CLIENT_ID, receiveEvent));
  }, [])

  // maybe more conditions here later, hence reason for being a method instead of a simple check
  function setupComplete(): boolean {
    return user.id != null;
  }

  // Call Twitch API and enable subscription for the provided userId.
  async function setupSubscription(eventType: string, userId: string) {
    
    console.log("user ID in setupSubscription: ", userId)

    if (twitchClient != null && !twitchClient?.isInitialized) {
      await twitchClient.initialize();
    }

    twitchClient?.subscribeToEvent(eventType, userId)
  }

  // Show notification message at top of screen for a duration.
  function showNotification(event: ViewerEvent) {
    setDisplayMessage(true)
    setCurrentEvent(event)

    setTimeout(() => {
      setDisplayMessage(false)
    }, messageDisplaySeconds * 1000)
  }

  // RENDER

  // First get setup info about user to follow
  if (!setupComplete()) {
    const setupCallback = (userToken: string, user: User) => {
      console.log("IN SETUP CALLBACK :) id ", user.id)
      if (user.id != undefined) {
        setUser(user);
        setupSubscription("channel.follow", user.id)
      }
      console.log(userToken, user)
    }
    return (
      <div>
        <SetupView setupCallback={setupCallback} TOKEN={TOKEN} CLIENT_ID={CLIENT_ID}/>
      </div>
    )
  }

  // If that is done, show main screen display
  return (
    <div className="App">
      <Notification viewerEvent={currentEvent} show={displayMessage}/>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <button onClick={() => showNotification(TEST_EVENT)}>Test Notification</button>
        {/* <button onClick={() => setupSubscription("channel.update", user.id)}>Subscribe to Channel Updates</button> // TODO enable this. Will need to handle in Notification.tsx*/} 
        <h3>Current Event</h3>
        <p>{JSON.stringify(currentEvent)}</p>
        <h3>Events Received</h3>
        <p>{JSON.stringify(events)}</p>
      </header>
    </div>
  );
}

export default App;