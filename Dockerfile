FROM node:18

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

RUN cp -r /usr/src/app/twitch-frontend/build /usr/src/app/twitch-backend/public

WORKDIR /usr/src/app/twitch-backend
RUN npm init -y
RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]
