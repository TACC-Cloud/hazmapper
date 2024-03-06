# Hazmapper

Hazmapper is an application for creating, visualizing, and analyzing geospatial data in a variety of formats.

See https://github.com/TACC-Cloud/geoapi which is an associated restful API.

### Getting started
- Get a JWT from someone on WMA-Geospatial subgroup
- GOTO jwt.io and edit that JWT to have your username/details
- Create a file in angular/src/environments called jwt.ts that has this in it:

    export const jwt = "YOUR JWT FROM ABOVE"

## Local React Development (work-in-progress)

`react/` has the React client

To get started, create a local secret file for local development:
```
cp react/src/secret_local.example.ts react/src/secret_local.ts
```

Add the jwt retrieved from [Getting started](###getting-started) to `react/src/secret_local.ts`.  

The `geoapiBackend` in ( see [react/src/secret_local.example.ts](react/src/secret_local.example.ts) ) can be used to select which backend `geoapi` is used by Hazmapper during local development (e.g. `EnvironmentType.Production`, `EnvironmentType.Staging`, `EnvironmentType.Dev`, * `EnvironmentType.Local`

See https://github.com/TACC-Cloud/geoapi for more details on running geoapi locally.

#### Run

```
npm ci
npm run dev
```

Navigate to `http://localhost:4200/` or `http://hazmapper.local:4200/`.  (Note that `hazmapper.local` needs to be added to your `/etc/hosts`)

#### Running unit tests

Run `npm run test`

#### Running linters

Run `npm run lint` to run linter

Run `npm run lint:fix` to fix any linting/prettier errors

## Local Angular Development

`angular/` has the angular client

Two ways to run a dev server:
* `npm run start:local`. Navigate to `http://hazmapper.local:4200/`.  (Note that `hazmapper.local` needs to be added to your `/etc/hosts`)
* `npm run start`. Navigate to `http://localhost:4200/`.

The app will automatically reload if you change any of the source files.

### Configuring which geoapi-backend is used

The `backend` in [angular/src/environments/environment.ts](angular/src/environments/environment.ts) can be used to select which backend `geoapi` is used by the app:

* `EnvironmentType.Production`
* `EnvironmentType.Staging`
* `EnvironmentType.Local`\*

\*See https://github.com/TACC-Cloud/geoapi for more details on running geoapi locally.

### Running unit tests

Run `npm run test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running linters

Run `npm run lint` to run all of the linters.

Run `npm run lint:js` to run linter for angular files.
Run `npm run lint:css` to run linter for css files.

Run `npm run lint:js -- --fix` to fix angular files.
Run `npm run lint:css -- --fix` to fix css files.

### Code scaffolding

Run `ng generate component components/component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

# Deployment

## Images building + Jenkins

The deployment of images and updating of the services and applications is performed by a Jenkins
workflow found [here](https://jenkins01.tacc.utexas.edu/view/Hazmapper+Geoapi/.)

The images used in deployment are built automatically for the master branch using TravisCI and 
pushed to Docker Hub (see https://hub.docker.com/r/taccaci/hazmapper).


## Additional Information/Tips

For additional information like access and troubleshooting see [geoapi's devops directory TODO: create devops/README.md](https://github.com/TACC-Cloud/geoapi/tree/master/devops).
