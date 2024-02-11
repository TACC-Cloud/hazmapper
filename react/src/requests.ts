import axios from 'axios';
import store from './redux/store';
import { AxiosError } from 'axios';
import { useQuery, UseQueryOptions, QueryKey } from 'react-query';
import { useAppConfiguration } from './hooks';
import {
  ApiService,
  AppConfiguration,
  AuthState,
  GeoapiBackendEnvironment,
} from './types';
import { v4 as uuidv4 } from 'uuid';

function getBaseApiUrl(
  apiService: ApiService,
  configuration: AppConfiguration
): string {
  switch (apiService) {
    case ApiService.Geoapi:
      return configuration.geoapiUrl;
    case ApiService.DesignSafe:
      return configuration.designSafeUrl;
    case ApiService.Tapis:
      // Tapis and DesignSafe are currently the same
      return configuration.designSafeUrl;
    default:
      throw new Error('Unsupported api service Type.');
  }
}

export function getHeaders(
  apiService: ApiService,
  configuration: AppConfiguration,
  auth: AuthState
) {
  // TODO_REACT add mapillary support
  if (auth.token?.token && apiService !== ApiService.Mapillary) {
    //Add auth information in header for DesignSafe, Tapis, Geoapi for logged in users
    if (
      apiService === ApiService.Geoapi &&
      configuration.geoapiBackend === GeoapiBackendEnvironment.Local
    ) {
      // Use JWT in request header because local geoapi API is not behind ws02
      return { 'X-JWT-Assertion-designsafe': configuration.jwt };
    }
    return { Authorization: `Bearer ${auth.token.token}` };
  }
  return {};
}

type UseGetParams<ResponseType> = {
  endpoint: string;
  key: QueryKey;
  options?: Omit<
    UseQueryOptions<ResponseType, AxiosError>,
    'queryKey' | 'queryFn'
  >;
  transform?: (data: any) => ResponseType;
  apiService?: ApiService;
};

export function useGet<ResponseType>({
  endpoint,
  key,
  options = {},
  apiService = ApiService.Geoapi,
  transform,
}: UseGetParams<ResponseType>) {
  const client = axios;
  const state = store.getState();
  const configuration = useAppConfiguration();
  const baseUrl = getBaseApiUrl(apiService, configuration);
  const headers = getHeaders(apiService, configuration, state.auth);

  let url = `${baseUrl}${endpoint}`;

  /* TODO_V3 Send analytics-related params to features endpoint (i.e. /projects/<project_id>/features
  or /public-projects/<project_id>/features)
   only (until we use headers again in https://tacc-main.atlassian.net/browse/WG-192). We are using
   query params instead of custom headers due to https://tacc-main.atlassian.net/browse/WG-191 */
  if (/\/(projects|public-projects)\/\d+\/features/.test(endpoint)) {
    let analytics_params = {};

    analytics_params = { ...analytics_params, application: 'hazmapper' };

    // for guest users, add a unique id
    if (!state.auth.token) {
      // Get (or create if needed) the guestUserID in local storage

      let guestUuid = localStorage.getItem('guestUuid');

      if (!guestUuid) {
        guestUuid = uuidv4();
        localStorage.setItem('guestUuid', guestUuid as string);
      }

      analytics_params = { ...analytics_params, guest_uuid: guestUuid };
    }

    const queryParams = new URLSearchParams(analytics_params).toString();
    url += `?${queryParams}`;
  }

  const getUtil = async () => {
    const request = await client.get(url, { headers });
    return transform ? transform(request.data) : request.data;
  };

  return useQuery<ResponseType, AxiosError>(key, getUtil, options);
}
