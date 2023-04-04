# copy build output from frontend to backend directory so it can be served.
copy-item ../twitch-frontend/build/* ./public -recurse -force