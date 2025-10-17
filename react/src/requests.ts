import axios, { AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
  useQueryClient,
  AnyUseQueryOptions,
} from '@tanstack/react-query';
import { useAppConfiguration } from '@hazmapper/hooks';
import { useMapillaryToken } from '@hazmapper/context/MapillaryTokenProvider';

import {
  useEnsureAuthenticatedUserHasValidTapisToken,
  useIsPublicProjectRoute,
  useAuthenticatedUser,
} from '@hazmapper/hooks';
import { ApiService, AppConfiguration, AuthToken } from '@hazmapper/types';
import { HASHED_SESSION } from '@hazmapper/utils/requestUtils';

export const getApiClient = (
  apiService: ApiService = ApiService.Geoapi,
  geoapiEnv: string
) => {
  const axiosConfig = {
    timeout: 60 * 1000, // 1 minute
  };
  if (apiService === ApiService.Geoapi) {
    Object.assign(axiosConfig, {
      xsrfCookieName: `csrftoken-${geoapiEnv}`,
      xsrfHeaderName: `x-csrftoken-${geoapiEnv}`,
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

export function usesTapisToken(apiService: ApiService) {
  const servicesUsingTapisToken = [ApiService.Tapis, ApiService.DesignSafe];
  return servicesUsingTapisToken.includes(apiService);
}

interface GetHeadersOptions {
  apiService: ApiService;
  isTapisTokenRequest: boolean;
  authToken?: AuthToken | null;
  mapillaryAuthToken?: string | null;
  isPublicRoute?: boolean;
}

export function getHeaders({
  apiService,
  isTapisTokenRequest,
  authToken,
  mapillaryAuthToken,
  isPublicRoute = false,
}: GetHeadersOptions) {
  const headers: { [key: string]: string } = {};

  if (isTapisTokenRequest && authToken?.token) {
    headers['X-Tapis-Token'] = authToken.token;
  }

  if (apiService === ApiService.Geoapi) {
    // Add analytics-related headers for GeoAPI requests
    headers['X-Geoapi-Application'] = 'hazmapper';
    headers['X-Geoapi-IsPublicView'] = isPublicRoute ? 'True' : 'False';

    // for guest users, add a unique id
    if (!authToken?.token) {
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

  if (apiService === ApiService.Tapis) {
    headers['X-Tapis-Tracking-ID'] = `portals.${HASHED_SESSION}`;
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
  const configuration = useAppConfiguration();
  const client = getApiClient(apiService, configuration.geoapiEnv);
  const { accessToken: mapillaryAuthToken } = useMapillaryToken();

  const isPublicRoute = useIsPublicProjectRoute();

  const baseUrl = getBaseApiUrl(apiService, configuration);

  const isTapisTokenRequest = usesTapisToken(apiService);
  const {
    data: { authToken, hasValidTapisToken },
  } = useAuthenticatedUser();

  // If request uses Tapis token, check auth and redirect if not a public route
  useEnsureAuthenticatedUserHasValidTapisToken({
    isTapisTokenRequest,
    authToken,
    hasValidTapisToken,
  });
  const headers = getHeaders({
    apiService,
    isTapisTokenRequest,
    authToken: authToken,
    mapillaryAuthToken,
    isPublicRoute,
  });

  const url = `${baseUrl}${endpoint}`;

  const getUtil = async () => {
    const request = await client.get(url, { headers, params });
    return transform ? transform(request.data) : request.data;
  };

  const query: AnyUseQueryOptions = {
    queryKey,
    queryFn: getUtil,
    ...options,
    retry: false,
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
  const configuration = useAppConfiguration();
  const client = getApiClient(apiService, configuration.geoapiEnv);

  const baseUrl = getBaseApiUrl(apiService, configuration);

  const isTapisTokenRequest = usesTapisToken(apiService);
  const {
    data: { authToken, hasValidTapisToken },
  } = useAuthenticatedUser();

  // If request uses Tapis token, check auth and redirect if not a public route
  useEnsureAuthenticatedUserHasValidTapisToken({
    isTapisTokenRequest,
    authToken,
    hasValidTapisToken,
  });
  const headers = getHeaders({
    apiService,
    isTapisTokenRequest,
    authToken: authToken,
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
  const configuration = useAppConfiguration();
  const client = getApiClient(apiService, configuration.geoapiEnv);

  const baseUrl = getBaseApiUrl(apiService, configuration);
  const isTapisTokenRequest = usesTapisToken(apiService);
  const {
    data: { authToken, hasValidTapisToken },
  } = useAuthenticatedUser();

  // If request uses Tapis token, check auth and redirect if not a public route
  useEnsureAuthenticatedUserHasValidTapisToken({
    isTapisTokenRequest,
    authToken,
    hasValidTapisToken,
  });
  const headers = getHeaders({
    apiService,
    isTapisTokenRequest,
    authToken: authToken,
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
  const configuration = useAppConfiguration();
  const client = getApiClient(apiService, configuration.geoapiEnv);

  const baseUrl = getBaseApiUrl(apiService, configuration);

  const isTapisTokenRequest = usesTapisToken(apiService);
  const {
    data: { authToken, hasValidTapisToken },
  } = useAuthenticatedUser();

  // If request uses Tapis token, check auth and redirect if not a public route
  useEnsureAuthenticatedUserHasValidTapisToken({
    isTapisTokenRequest,
    authToken,
    hasValidTapisToken,
  });
  const headers = getHeaders({
    apiService,
    isTapisTokenRequest,
    authToken: authToken,
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
