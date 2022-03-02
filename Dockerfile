FROM node:14-alpine as clipps-api
LABEL maintainer="tonymtz <hello@tonymtz.com>"

WORKDIR /app
COPY . .
RUN npm install
RUN node ace build --production

WORKDIR /app/build
RUN npm install --production

EXPOSE ${PORT}
CMD [ "node", "server.js" ]
