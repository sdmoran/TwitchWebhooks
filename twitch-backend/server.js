const express = require('express')
require('dotenv').config();
const path = require('path')

const app = express()
app.use("/",express.static("public"))

const port = 3000

let CLIENT_TOKEN = ""
getClientToken()

async function getClientToken() {
    const baseUrl = "https://id.twitch.tv/oauth2/token"
    const params = new URLSearchParams()
    params.set("client_id", process.env.CLIENT_ID)
    params.set("client_secret", process.env.CLIENT_SECRET)
    params.set("grant_type", "client_credentials")

    const resp = await fetch(
        `${baseUrl}?${params.toString()}`,
        {
            method: "POST"
        }
    )
    const respJson = await (resp.json())
    if (resp.status == 200) {
        console.log("GOT TOKEN: ", respJson)
        CLIENT_TOKEN = respJson.access_token
    }
    else {
        console.log("DID NOT GET TOKEN", respJson)
    }

}

async function getUserId(username) {
    const baseUrl = "https://api.twitch.tv/helix/users"
    const params = new URLSearchParams()
    params.set("login", username)

    const resp = await fetch(
        `${baseUrl}?${params.toString()}`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${CLIENT_TOKEN}`,
                "Client-Id": process.env.CLIENT_ID
            }
        },
    )
    return resp.json()
}

app.get('/api/user/:username', async (req, res) => {
    console.log("getting info for req.params.username", )
    let userInfo = await getUserId(req.params.username)
    console.log(userInfo)
    res.send(userInfo)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})