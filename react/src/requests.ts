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

type UseGetParams<ResponseType> = {
  endpoint: string;
  key: QueryKey;
  options?: Omit<
    UseQueryOptions<ResponseType, AxiosError>,
    'queryKey' | 'queryFn'
  >;
  baseUrl: string;
};

type UsePostParams<RequestType, ResponseType> = {
  endpoint: string;
  options?: UseMutationOptions<ResponseType, AxiosError, RequestType>;
  baseUrl: string;
};

export function useGet<ResponseType>({
  endpoint,
  key,
  options = {},
  baseUrl,
}: UseGetParams<ResponseType>) {
  const client = axios;
  const state = store.getState();
  const token = state.auth.token?.token;
  // change to prod const { baseUrl } = useConfig();
  const getUtil = async () => {
    const request = await client.get<ResponseType>(
      `${baseUrl}${endpoint}`,

      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return request.data;
  };
  return useQuery<ResponseType, AxiosError>(key, () => getUtil(), options);
}

export function usePost<RequestType, ResponseType>({
  endpoint,
  options = {},
  baseUrl,
}: UsePostParams<RequestType, ResponseType>) {
  const client = axios;
  const state = store.getState();
  const token = state.auth.token?.token;

  const postUtil = async (requestData: RequestType) => {
    const response = await client.post<ResponseType>(
      `${baseUrl}${endpoint}`,
      requestData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  };

  return useMutation<ResponseType, AxiosError, RequestType>(postUtil, options);
}
