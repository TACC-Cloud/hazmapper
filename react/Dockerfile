FROM node:20.10.0-alpine3.18 as node

RUN mkdir /www
COPY react /www
WORKDIR /www

# Creating dummy local file as it is not dynamically loaded; not actually used in prod  TODO_REACT
RUN cp src/secret_local.example.ts src/secret_local.ts

RUN npm ci
RUN npm run build

FROM nginx:1.24-alpine
WORKDIR /
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=node /www/dist/ /usr/share/nginx/html
