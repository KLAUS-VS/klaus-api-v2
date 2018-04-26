FROM node:9
LABEL maintainer="SUBHUMAN <wachter@hydra-newmedia.com>"

WORKDIR /app

COPY package.json package.json
RUN npm install

ADD . /app/

EXPOSE 8080

CMD [ "npm", "start" ]
