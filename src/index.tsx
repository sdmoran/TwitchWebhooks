import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { NotificationView, twitchUserIdLoader } from './components/NotificationView';
import View404 from './components/View404';
import SetupView from './components/SetupView';

import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";

const TOKEN = process.env.REACT_APP_TWITCH_TOKEN || "fake_token";
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || "fake_client_id";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SetupView token={TOKEN} clientId={CLIENT_ID}/>
  },
  {
    path: "/notifications/:twitchUserId",
    element: <NotificationView />,
    loader: twitchUserIdLoader
  },
  // catch-all route
  {
    path: "*",
    element: <View404 />
  }
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <div className="App">
      <RouterProvider router={router} />
    </div>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
