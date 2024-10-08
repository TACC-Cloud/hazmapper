import axios from 'axios';
import store from './redux/store';
import { AxiosError } from 'axios';
import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
} from 'react-query';
import {
  useAppConfiguration,
  useEnsureAuthenticatedUserHasValidTapisToken,
} from './hooks';
import { ApiService, AppConfiguration, AuthState } from './types';
import { v4 as uuidv4 } from 'uuid';

function getBaseApiUrl(
  apiService: ApiService,
  configuration: AppConfiguration
): string {
  switch (apiService) {
    case ApiService.Geoapi:
      return configuration.geoapiUrl;
    case ApiService.DesignSafe:
      return configuration.designsafePortalUrl;
    case ApiService.Tapis:
      return 'https://designsafe.tapis.io';
    default:
      throw new Error('Unsupported api service Type.');
  }
}

function usesTapisToken(apiService: ApiService) {
  const servicesUsingTapisToken = [
    ApiService.Geoapi,
    ApiService.Tapis,
    ApiService.DesignSafe,
  ];
  return servicesUsingTapisToken.includes(apiService);
}

export function getHeaders(apiService: ApiService, auth: AuthState) {
  const hasTapisAuthToken = !!auth.authToken?.token;

  if (hasTapisAuthToken && usesTapisToken(apiService)) {
    return { 'X-Tapis-Token': auth.authToken?.token };
  }

  // TODO_REACT add mapillary support

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

type UsePostParams<RequestType, ResponseType> = {
  endpoint: string;
  options?: UseMutationOptions<ResponseType, AxiosError, RequestType>;
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

  useEnsureAuthenticatedUserHasValidTapisToken();

  const baseUrl = getBaseApiUrl(apiService, configuration);
  const headers = getHeaders(apiService, state.auth);

  let url = `${baseUrl}${endpoint}`;

  /* TODO_V3 Send analytics-related params to features endpoint (i.e.
    /projects/<project_id>/features or /public-projects/<project_id>/features)
    only (until we use headers again in
    https://tacc-main.atlassian.net/browse/WG-192). We are using query params
    instead of custom headers due to https://tacc-main.atlassian.net/browse/WG-191 */
  if (/\/(projects|public-projects)\/\d+\/features/.test(endpoint)) {
    let analytics_params = {};

    analytics_params = { ...analytics_params, application: 'hazmapper' };

    // for guest users, add a unique id
    if (!state.auth.authToken?.token) {
      // Get (or create if needed) the guestUserID in local storage

      let guestUuid = localStorage.getItem('guestUuid');

      if (!guestUuid) {
        guestUuid = uuidv4();
        localStorage.setItem('guestUuid', guestUuid as string);
      }

      analytics_params = { ...analytics_params, guest_uuid: guestUuid };
    }

    const queryParams = new URLSearchParams(analytics_params).toString();
    if (url.includes('?')) {
      // If the URL contains other parameters, prepend with '&'
      url += `&${queryParams}`;
    } else {
      // If the URL contains no parameters, start with '?'
      url += `?${queryParams}`;
    }
  }

  const getUtil = async () => {
    const request = await client.get(url, { headers });
    return transform ? transform(request.data) : request.data;
  };

  return useQuery<ResponseType, AxiosError>(key, getUtil, options);
}

export function usePost<RequestType, ResponseType>({
  endpoint,
  options = {},
  apiService = ApiService.Geoapi,
}: UsePostParams<RequestType, ResponseType>) {
  const client = axios;
  const state = store.getState();
  const configuration = useAppConfiguration();

  useEnsureAuthenticatedUserHasValidTapisToken();

  const baseUrl = getBaseApiUrl(apiService, configuration);

  const headers = getHeaders(apiService, state.auth);

  const postUtil = async (requestData: RequestType) => {
    const response = await client.post<ResponseType>(
      `${baseUrl}${endpoint}`,
      requestData,
      {
        headers: headers,
      }
    );
    return response.data;
  };

  return useMutation<ResponseType, AxiosError, RequestType>(postUtil, options);
}
