import axios, { AxiosError } from 'axios';
import store from './redux/store';
import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
  useQueryClient,
} from '@tanstack/react-query';
import { useAppConfiguration } from '@hazmapper/hooks';
import { useMapillaryToken } from '@hazmapper/context/MapillaryTokenProvider';

import {
  useEnsureAuthenticatedUserHasValidTapisToken,
  useIsPublicProjectRoute,
} from '@hazmapper/hooks';
import { ApiService, AppConfiguration, AuthState } from '@hazmapper/types';
import { v4 as uuidv4 } from 'uuid';

const getApiClient = (apiService: ApiService) => {
  const axiosConfig = {
    timeout: 60 * 1000, // 1 minute
  };
  if (apiService === ApiService.Geoapi) {
    Object.assign(axiosConfig, {
      xsrfCookieName: 'csrftoken',
      xsrfHeaderName: 'x-csrftoken',
      withCredentials: true, // Ensure cookies are sent with requests
      withXSRFToken: true,
    });
  }
  return axios.create(axiosConfig);
};

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
      return configuration.tapisUrl;
    case ApiService.Mapillary:
      return configuration.mapillary.apiUrl;
    default:
      throw new Error('Unsupported api service Type.');
  }
}

function usesTapisToken(apiService: ApiService) {
  const servicesUsingTapisToken = [ApiService.Tapis, ApiService.DesignSafe];
  return servicesUsingTapisToken.includes(apiService);
}

interface GetHeadersOptions {
  apiService: ApiService;
  auth: AuthState;
  mapillaryAuthToken?: string | null;
  isPublicRoute?: boolean;
}

export function getHeaders({
  apiService,
  auth,
  mapillaryAuthToken,
  isPublicRoute = false,
}: GetHeadersOptions) {
  const headers: { [key: string]: string } = {};

  if (usesTapisToken(apiService) && auth.authToken?.token) {
    headers['X-Tapis-Token'] = auth.authToken.token;
  }

  if (apiService === ApiService.Geoapi) {
    // Add analytics-related headers for GeoAPI requests
    headers['X-Geoapi-Application'] = 'hazmapper';
    headers['X-Geoapi-IsPublicView'] = isPublicRoute ? 'True' : 'False';

    // for guest users, add a unique id
    if (!auth.authToken?.token) {
      // get (or create if needed) the guestUserID in local storage
      let guestUuid = localStorage.getItem('guestUuid');
      if (!guestUuid) {
        guestUuid = uuidv4();
        localStorage.setItem('guestUuid', guestUuid as string);
      }
      headers['X-Guest-UUID'] = guestUuid;
    }
  }

  if (apiService === ApiService.Mapillary && mapillaryAuthToken) {
    headers['authorization'] = `OAuth ${mapillaryAuthToken}`;
  }

  return headers;
}

type UseGetParams<ResponseType, TransformedResponseType> = {
  endpoint: string;
  key: QueryKey;
  params?: { [key: string]: string };
  options?: Omit<
    UseQueryOptions<ResponseType, AxiosError, TransformedResponseType>,
    'queryKey' | 'queryFn'
  >;
  transform?: (data: any) => ResponseType;
  apiService?: ApiService;
  prefetch?: boolean;
};

type UsePostParams<RequestType, ResponseType> = {
  endpoint: string;
  options?: UseMutationOptions<ResponseType, AxiosError, RequestType>;
  apiService?: ApiService;
};

export function useGet<ResponseType, TransformedResponseType = ResponseType>({
  endpoint,
  key: queryKey,
  params = {},
  options = {},
  apiService = ApiService.Geoapi,
  transform,
  prefetch,
}: UseGetParams<ResponseType, TransformedResponseType>) {
  const client = getApiClient(apiService);
  const state = store.getState();
  const configuration = useAppConfiguration();
  const { accessToken: mapillaryAuthToken } = useMapillaryToken();

  const isPublicRoute = useIsPublicProjectRoute();

  // Check auth and redirect only if not a public route
  useEnsureAuthenticatedUserHasValidTapisToken({ redirect: !isPublicRoute });

  const baseUrl = getBaseApiUrl(apiService, configuration);

  const headers = getHeaders({
    apiService,
    auth: state.auth,
    mapillaryAuthToken,
    isPublicRoute,
  });

  const url = `${baseUrl}${endpoint}`;

  const getUtil = async () => {
    const request = await client.get(url, { headers, params });
    return transform ? transform(request.data) : request.data;
  };

  const query = {
    queryKey,
    queryFn: getUtil,
    ...options,
  };
  const queryClient = useQueryClient();
  if (prefetch) queryClient.ensureQueryData(query);

  return useQuery<ResponseType, AxiosError, TransformedResponseType>(query);
}

export function usePost<RequestType, ResponseType>({
  endpoint,
  options = {},
  apiService = ApiService.Geoapi,
}: UsePostParams<RequestType, ResponseType>) {
  const client = getApiClient(apiService);
  const state = store.getState();
  const configuration = useAppConfiguration();

  useEnsureAuthenticatedUserHasValidTapisToken();

  const baseUrl = getBaseApiUrl(apiService, configuration);

  const headers = getHeaders({
    apiService,
    auth: state.auth,
  });

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

  return useMutation<ResponseType, AxiosError, RequestType>({
    mutationFn: postUtil,
    ...options,
  });
}

type UseDeleteParams<ResponseType, Variables> = {
  endpoint: string | ((variables: Variables) => string);
  options?: Omit<
    UseMutationOptions<ResponseType, AxiosError, Variables>,
    'mutationFn'
  >;
  apiService?: ApiService;
};

export function useDelete<ResponseType, Variables>({
  endpoint,
  options = {},
  apiService = ApiService.Geoapi,
}: UseDeleteParams<ResponseType, Variables>) {
  const client = getApiClient(apiService);
  const state = store.getState();
  const configuration = useAppConfiguration();

  useEnsureAuthenticatedUserHasValidTapisToken();

  const baseUrl = getBaseApiUrl(apiService, configuration);
  const headers = getHeaders({
    apiService,
    auth: state.auth,
  });

  const deleteUtil = async (variables: Variables) => {
    const finalEndpoint =
      typeof endpoint === 'function' ? endpoint(variables) : endpoint;

    const response = await client.delete<ResponseType>(
      `${baseUrl}${finalEndpoint}`,
      { headers }
    );
    return response.data;
  };

  return useMutation<ResponseType, AxiosError, Variables>({
    mutationFn: deleteUtil,
    ...options,
  });
}

export function usePut<RequestType, ResponseType>({
  endpoint,
  options = {},
  apiService = ApiService.Geoapi,
}: UsePostParams<RequestType, ResponseType>) {
  const client = getApiClient(apiService);
  const state = store.getState();
  const configuration = useAppConfiguration();

  const baseUrl = getBaseApiUrl(apiService, configuration);

  const headers = getHeaders({
    apiService,
    auth: state.auth,
  });

  const putUtil = async (requestData: RequestType) => {
    const response = await client.put<ResponseType>(
      `${baseUrl}${endpoint}`,
      requestData,
      {
        headers: headers,
      }
    );
    return response.data;
  };

  return useMutation<ResponseType, AxiosError, RequestType>({
    mutationFn: putUtil,
    ...options,
  });
}
