FROM nginx

FROM node:10 as node

COPY . /www
WORKDIR /www
RUN npm install -g @angular/cli@8.0.3
RUN npm install
RUN ng build --prod

COPY --from=node /www/dist/ /usr/share/nginx/html

