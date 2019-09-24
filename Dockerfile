FROM nginx

FROM node:12 as node

RUN mkdir /www
COPY package.json /www
WORKDIR /www
RUN npm install -g @angular/cli@8.0.3
RUN npm install
WORKDIR /
COPY . /www
WORKDIR /www
RUN ng build --prod
RUN ls
WORKDIR /
COPY --from=node /www/dist/ /usr/share/nginx/html

