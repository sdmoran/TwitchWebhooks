import { exit } from "process";
import { getClientToken, getUserId, getEventsWithScopes } from "./util"

import express from 'express';
import path from 'path';

const app = express()
app.use('/', express.static("public/"))
const port = 3000

// Initialize on startup
let CLIENT_TOKEN = ""

// Constants
const CLIENT_ID: string = process.env.CLIENT_ID || ""
const CLIENT_SECRET: string = process.env.CLIENT_SECRET || ""
const GRANT_TYPE: string = "client_credentials";

// iife to get token
(async() => {
    CLIENT_TOKEN = await getClientToken(CLIENT_ID, CLIENT_SECRET, GRANT_TYPE)
})()

// Make sure we have client ID and secret
if (CLIENT_ID.length === 0 || CLIENT_SECRET.length === 0) {
    console.error("CLIENT_ID and CLIENT_SECRET environment variables must both be defined! Exiting.")
    exit(0)
}

app.get('/api/user/:username', async (req, res) => {
    console.log("getting info for req.params.username", )
    let userInfo = await getUserId(req.params.username, CLIENT_TOKEN, CLIENT_ID)
    console.log(userInfo)
    res.send(userInfo)
})

app.get('/api/scopes', async (req, res) => {
    let scopes = await getEventsWithScopes("eventsWithScopes.json");
    res.send(scopes);
})

app.get('*', (req, res) =>{
    res.sendFile(path.join(__dirname+'/public/index.html'));
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})