FROM node:14-alpine as clipps-api
LABEL maintainer="tonymtz <hello@tonymtz.com>"

WORKDIR /api
COPY . .
RUN npm install
RUN node ace build --production

WORKDIR /api/build
RUN npm install --production

EXPOSE ${PORT}
CMD [ "node", "server.js" ]
