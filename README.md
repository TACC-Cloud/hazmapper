# Hazmapper

Hazmapper is an application for creating, visualizing, and analyzing geospatial data in a variety of formats.

See https://github.com/TACC-Cloud/geoapi which is an associated restful API.

## Local Development

`react/` directory contains the React client

To get started, create a local secret file for local development:
```
cp react/src/secret_local.example.ts react/src/secret_local.ts
```

The `geoapiBackend` setting in `react/src/secret_local.ts` ( see the example [react/src/secret_local.example.ts](react/src/secret_local.example.ts) ) controls which backend `GeoAPI` is used by Hazmapper during local development. You can choose from the following:

* `EnvironmentType.Production`
* `EnvironmentType.Staging`
* `EnvironmentType.Dev`
* `EnvironmentType.Local`

To run Hazmapper with the GeoAPI backend locally, configure `geoapiBackend` to use `GeoapiBackendEnvironment.Local` and see the [GeoAPI repository](https://github.com/TACC-Cloud/geoapi) for more detailed instructions.

#### Run

```
npm ci
npm run dev
```

Navigate to `http://localhost:4200/`.

#### Running unit tests

Run `npm run test`

#### Running linters

Run `npm run lint` to run linter

Run `npm run lint:fix` to fix any linting/prettier errors

# Deployment

For deployment information, see https://github.com/TACC-Cloud/geoapi/blob/master/devops/README.md
