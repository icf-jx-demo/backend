FROM node:11-alpine

WORKDIR /usr/src/app

EXPOSE 3001

CMD ["yarn", "start"]

ADD package.json yarn.lock /usr/src/app/
RUN yarn install

ADD . .
