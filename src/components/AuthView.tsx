import React from "react";

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || "fake_client_id";
const REDIRECT_URI = `${window.location.toString()}redirect`;
const TWITCH_AUTH_URL_BASE = "https://id.twitch.tv/oauth2/authorize?";

// TODO move somewhere central or pass as props - probably AFTER user chooses event types to be notified for so
// we know what scopes will be required. At the moment only chat:read is required for follower notifications
const SCOPES = [
    "chat:read",
]

function AuthView() {
    const params = new URLSearchParams();
    params.set("response_type", "token");
    params.set("client_id", CLIENT_ID);
    params.set("scope", SCOPES.join(" "));

    const AUTH_URL = TWITCH_AUTH_URL_BASE + params.toString() + `&redirect_uri=${REDIRECT_URI}`; // Redirect URI should contain LITERAL "/" and ":", NOT URI-ENCODED.

    return (
        <div>
            <h1>Authorize Application</h1>
            <a href={AUTH_URL}>Authorize with Twitch</a>
        </div>
    )
}

export default AuthView;