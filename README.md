# Hazmapper

Hazmapper is an application for creating, visualizing, and analyzing geospatial data in a variety of formats.

See https://github.com/TACC-Cloud/geoapi which is an associated restful API.

## Local React Development

`react/` directory contains the React client

To get started, create a local secret file for local development:
```
cp react/src/secret_local.example.ts react/src/secret_local.ts
```

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

For deployment information, see https://github.com/TACC-Cloud/geoapi/blob/master/devops/README.md
