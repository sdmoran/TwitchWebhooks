import fs from 'fs'
import { EventWithScopes } from "./models"

// Gets client token from twitch
async function getClientToken(clientId: string, clientSecret: string, grantType: string): Promise<string> {
    const baseUrl = "https://id.twitch.tv/oauth2/token"
    const params = new URLSearchParams()
    params.set("client_id", clientId)
    params.set("client_secret", clientSecret)
    params.set("grant_type", grantType)

    try {
        const resp = await fetch(
            `${baseUrl}?${params.toString()}`,
            {
                method: "POST"
            }
        )
        const respJson = await (resp.json())
        if (resp.status == 200 && respJson.access_token?.length > 0) {
            return Promise.resolve(respJson.access_token)
        }
        else {
            console.log("DID NOT GET TOKEN", respJson)
            return Promise.reject(respJson)
        }
    } catch(err) {
        console.log(err)
        return Promise.reject(err)
    }
}

async function getUserId(username: string, clientToken: string, clientId: string): Promise<any> {
    const baseUrl = "https://api.twitch.tv/helix/users"
    const params = new URLSearchParams()
    params.set("login", username)

    try {
        const resp = await fetch(
            `${baseUrl}?${params.toString()}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${clientToken}`,
                    "Client-Id": clientId
                }
            },
        )
        return Promise.resolve(resp.json())
    } catch(err) {
        console.log(err)
        return Promise.resolve({})
    }
}

async function getEventsWithScopes(filePath: string): Promise<EventWithScopes[] | null> {
    try {
      // Read the file asynchronously
      const fileData = await fs.promises.readFile(filePath, 'utf-8');
  
      // Handle the case when the file is empty
      if (!fileData.trim()) {
        console.error('File is empty.');
        return null;
      }
  
      // Try parsing the JSON data
      let jsonData;
      try {
        jsonData = JSON.parse(fileData) as EventWithScopes[];
      } catch (error: any) {
        console.error('Invalid JSON format:', error.message);
        return null;
      }
  
      // Make sure the parsed data is an array
      if (!Array.isArray(jsonData)) {
        console.error('Invalid JSON format: The content is not an array.');
        return null;
      }
  
      // Return the deserialized data
      return jsonData;
    } catch (error: any) {
      // Handle file not found or other file read errors
      console.error('Error reading the file:', error.message);
      return null;
    }
  }

export {
    getClientToken,
    getUserId,
    getEventsWithScopes
}