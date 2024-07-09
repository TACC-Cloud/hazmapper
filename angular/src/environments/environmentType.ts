export enum EnvironmentType {
  Production = 'production',
  Staging = 'staging',
  Dev = 'dev' /* i.e. dev.geoapi-services.tacc.utexas.edu*/,
  Experimental = 'experimental' /* i.e. experimental.geoapi-services.tacc.utexas.edu*/,
  Local = 'local',
}

export enum DesignSafeEnvironmentType {
  Production = 'production', /* https://www.designsafe-ci.org/ */
  Dev = 'dev' /* https://designsafeci-dev.tacc.utexas.edu/ */ ,
  Next = 'experimental' /* https://designsafeci-next.tacc.utexas.edu/ */,
  Local = 'local', /* not supported but would be designsafe.dev */
}