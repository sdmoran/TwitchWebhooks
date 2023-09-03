FROM node:18

ARG REACT_APP_CLIENT_ID
ENV REACT_APP_CLIENT_ID $REACT_APP_CLIENT_ID

# build frontend
WORKDIR /usr/src/app

COPY twitch-frontend ./twitch-frontend
COPY twitch-backend ./twitch-backend

WORKDIR /usr/src/app/twitch-frontend
RUN npm init -y
RUN npm install
RUN npm install react-scripts
RUN npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
# RUN npm ci --only=production
RUN npm run build

# copy frontend to backend directory, so frontend files can be served
RUN cp -r /usr/src/app/twitch-frontend/build /usr/src/app/twitch-backend/public
# delete .map files
RUN find /usr/src/app/twitch-backend/public -type f -name "*.map" -delete

# build backend
WORKDIR /usr/src/app/twitch-backend
RUN npm init -y
RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["node", "server.js"]
