# Twitch Notifications
A (currently very) simple web app to display customizable notifications when events occur for a Twitch.tv user.

## Requirements
- Docker desktop
- Kubernetes (through Docker desktop works great)

## Setup
First, you will need to register an application on Twitch to get a client ID and client secret.
- Register an application on Twitch following the guide here: https://dev.twitch.tv/docs/authentication/register-app/. Make sure to create a client secret too.
- Add redirect URLs.
    - For local development, `http://localhost:3001/auth/redirect`
    - For the built Docker image, `http://localhost:30008/auth/redirect`

### Backend
- Create a file called `.env` in the `twitch-backend` directory containing the following environment variables:
```
CLIENT_ID="<your_client_id>"
CLIENT_SECRET="<your_client_secret>"
```

### Frontend
- Create a file called `.env` in the `twitch-frontend` directory containing the following environment variable (value should be the same as your `CLIENT_ID` from above):

```
REACT_APP_CLIENT_ID="<your_client_id>"
```

## Run
To run, navigate to the top level of this repo, and build the Dockerfile with the following command:
```
> docker build . -t full-twitchapp
```
Once the image is built, create the Kubernetes resources (deployment & service) by running `kubectl apply -f full-service.yaml`.

The app will now be available at port 30008 on your Kubernetes cluster (if using Docker desktop k8s, localhost:30008).