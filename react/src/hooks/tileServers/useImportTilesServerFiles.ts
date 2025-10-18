import { usePost } from '@hazmapper/requests';

import { TapisFilePath, GeoapiMessageAcceptedResponse } from '@hazmapper/types';

/* List of geotiffs */
type ImportTileServerFiles = {
  files: TapisFilePath[];
};

interface UsePostImportTileServerFiles {
  projectId: number;
}

/* TODO GeoapiMessageAcceptedResponse is probably not correct here or other places as its the TASK that is returnedt?) */
export const usePostImportTileServerFiles = ({
  projectId,
}: UsePostImportTileServerFiles) => {
  return usePost<ImportTileServerFiles, GeoapiMessageAcceptedResponse>({
    endpoint: `/projects/${projectId}/tile-servers/files/import/`,
  });
};
