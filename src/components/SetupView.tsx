import React from "react";
import User from "../models/User";
import UserInfoCard from "./UserInfoCard";

const TWITCH_GET_USER_URL = "https://api.twitch.tv/helix/users";

// Interface for method callback to return data from setup view.
interface ISetupViewProps {
    setupCallback(userToken: string, user: User): void
    TOKEN: string
    CLIENT_ID: string
}

// View to do all necessary setup for the app to run.
// Things that need to be done here:
// - Get authorizations for application
// - Get user ID from API
function SetupView(props: ISetupViewProps) {
    let [twitchUserName, setTwitchUserName] = React.useState("")
    let [userInfo, setUserInfo] = React.useState({id: undefined})
    let [err, setErr] = React.useState("")
    const TOKEN = props.TOKEN;
    const CLIENT_ID = props.CLIENT_ID; 
    
    const handleChange = function(event: React.ChangeEvent<HTMLInputElement>) {
        setTwitchUserName(event.target.value);
    }

    const getUserId = async function (userName: string) {
        try {
            const resp = await fetch(
                TWITCH_GET_USER_URL + `?login=${userName}`,
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${TOKEN}`,
                            "Client-Id": CLIENT_ID,
                            "Content-Type": "application/json"
                        }
                    }
                );
            
            let respBody = await resp.json();
    
            if (resp.status == 200 && respBody.data && respBody.data.length > 0 && respBody.data[0].id) {
                // TODO ERROR HANDLING and checking for data[0].id etc...
                const userInfo = respBody.data[0]
                setUserInfo(userInfo);
                setErr("")
            }
            else {
                console.log(respBody);
                setErr("Failed to get User ID from Twitch: " + respBody.message)
            }
        } catch (e) {
            setErr("Failed to request a UserId from Twitch: " + e)
        }
    }

    let userInfoCard = undefined;
    let submitButton = undefined;
    if (userInfo.id != undefined) {
        userInfoCard = <UserInfoCard user={userInfo}/>
        submitButton = <button onClick={() => props.setupCallback("example_token", userInfo)}>Subscribe to Follower Notifications</button>
    }


    return (
        <div className="Setup">
            <h1>Setup</h1>
            <p>Enter the name of a Twitch user below to subscribe to events.</p>
            {userInfoCard}

            <h2>{err}</h2>

            <div className="container">
                <h3>Follower Notifications</h3>
                <input type="text" value={twitchUserName} onChange={handleChange} placeholder="Twitch Username"></input>
                <button onClick={() => getUserId(twitchUserName)}>Get User ID</button>
                {submitButton}
            </div>
        </div>
    )
}

export default SetupView;