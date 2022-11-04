# Hazmapper

Hazmapper is an application for creating, visualizing, and analyzing geospatial data in a variety of formats.

See https://github.com/TACC-Cloud/geoapi which is an associated restful API.

## Local Development
### Getting started
- Get a JWT from Joe M or someone on the CIC team
- GOTO jwt.io and edit that JWT to have your username/details
- Create a file in src/environments called jwt.ts that has this in it: 
        
        export const jwt = "YOUR JWT FROM ABOVE"

### Development server

Two ways to run a dev server:
* `ng serve --host hazmapper.local`. Navigate to `http://hazmapper.local:4200/`.  (Note that `hazmapper.local` needs to be added to your `/etc/hosts`)
* `ng serve`. Navigate to `http://localhost:4200/`.

The app will automatically reload if you change any of the source files.

### Configuring geoapi backend

The `backend` in [src/environments/environment.ts](src/environments/environment.ts) can be used to select which backend `geoapi` is used by the app:

* `EnvironmentType.Production`
* `EnvironmentType.Staging`
* `EnvironmentType.Local`\*

\*See https://github.com/TACC-Cloud/geoapi for more details on running geoapi locally.

## React client

`react/` has the react client

#### Run

```
npm ci
npm run dev
```

#### Running unit tests

Run `npm run test`


#### Running linters

Run `npm run lint` to run linter

Run `npm run lint:fix` to fix any linting/pretty errors

## Angular client

`angular/` has the angular client

### Code scaffolding

Run `ng generate component components/component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Kubernetes (Production/Staging environments)

Information on Kubernetes configuration for production and staging environments can be found in the [kube/README.md](kube/README.md) including information
on kube commands and Jenkins deployment workflows.
