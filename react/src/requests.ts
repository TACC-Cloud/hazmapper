import axios from 'axios';
import store from './redux/store';
import { AxiosError, AxiosRequestHeaders } from 'axios';
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
