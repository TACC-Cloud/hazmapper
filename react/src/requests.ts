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
import { useAppConfiguration } from './hooks';
import {
  ApiService,
  AppConfiguration,
  AuthState,
  GeoapiBackendEnvironment,
} from './types';

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
  if (auth.token && apiService !== ApiService.Mapillary) {
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
  const baseUrl = getBaseApiUrl(apiService, configuration);
  const headers = getHeaders(apiService, configuration, state.auth);

  /* TODO_REACT Send analytics-related params to projects endpoint only (until we use headers
    again in https://tacc-main.atlassian.net/browse/WG-192) */

  const getUtil = async () => {
    const request = await client.get(`${baseUrl}${endpoint}`, { headers });
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

  const baseUrl = getBaseApiUrl(apiService, configuration);
  const headers = getHeaders(apiService, configuration, state.auth);

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
