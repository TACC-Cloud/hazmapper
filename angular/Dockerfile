FROM node:14.19.1-alpine3.15 as node

RUN mkdir /www
COPY angular /www
WORKDIR /www
RUN npm install -g @angular/cli@8.0.3
RUN npm install
RUN npx patch-package
RUN ng build --prod


FROM nginx:1.17-alpine
WORKDIR /
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=node /www/dist/ /usr/share/nginx/html
