import { usePost } from '../../requests';
import {
  ApiService,
  TapisFilePath,
  GeoapiMessageAcceptedResponse,
} from '@hazmapper/types';

type ImportFeature = {
  files: TapisFilePath[];
};

export const useImportFeature = (projectId: number) => {
  const endpoint = `/projects/${projectId}/features/files/import/`;
  return usePost<ImportFeature, GeoapiMessageAcceptedResponse>({
    endpoint,
    apiService: ApiService.Geoapi,
  });
};
