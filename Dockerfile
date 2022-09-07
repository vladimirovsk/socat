FROM node:latest

WORKDIR /

RUN npm install -g npm@8.17.0

COPY package*.json ./

RUN npm install

COPY . .

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

CMD [ "node", "main.js" ]

ARG ENV

