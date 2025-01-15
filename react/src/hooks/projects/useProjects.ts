import { UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  Project,
  DesignSafeProjectCollection,
  ApiService,
} from '@hazmapper/types';
import { useGet, useDelete } from '@hazmapper/requests';

type QueryError = {
  message?: string;
};

export const useProjects = (): UseQueryResult<Project[]> => {
  const query = useGet<Project[]>({
    endpoint: '/projects/',
    key: ['projects'],
  });
  return query;
};

interface UseProjectParams {
  projectUUID?: string;
  isPublicView: boolean;
  options: object;
}

export const useProject = ({
  projectUUID,
  isPublicView,
  options,
}: UseProjectParams): UseQueryResult<Project> => {
  const projectRoute = isPublicView ? 'public-projects' : 'projects';
  const endpoint = `/${projectRoute}/?uuid=${projectUUID}`;
  const query = useGet<Project>({
    endpoint,
    key: ['project'],
    options,
    transform: (data) => data[0], // result is a list with a single Project
  });
  return query;
};

export const useDsProjects = (): UseQueryResult<
  DesignSafeProjectCollection | undefined
> => {
  const query = useGet<DesignSafeProjectCollection>({
    endpoint: `/api/projects/v2/`,
    key: ['projectsv2'],
    apiService: ApiService.DesignSafe,
  });
  return query;
};

export function useProjectsWithDesignSafeInformation() {
  const dsProjectQuery = useDsProjects();
  const projectQuery = useProjects();

  const alteredProjectData = useMemo(() => {
    if (projectQuery.isSuccess && dsProjectQuery.isSuccess) {
      return projectQuery.data.map((proj) => {
        const dsProj = dsProjectQuery.data?.result?.find(
          (ds_proj) => proj?.system_id?.replace('project-', '') === ds_proj.uuid
        );
        if (dsProj) {
          return {
            ...proj,
            ds_project: dsProj,
          };
        }
        return proj;
      });
    }
    return projectQuery.data;
  }, [dsProjectQuery.data, projectQuery.data]);

  return {
    data: alteredProjectData,
    isLoading: dsProjectQuery.isLoading || projectQuery.isLoading,
    isError: dsProjectQuery.error || projectQuery.error,
    isSuccess: dsProjectQuery.isSuccess && projectQuery.isSuccess,
    error: dsProjectQuery.error || projectQuery.error,
  };
}

type DeleteProjectParams = {
  projectId: number;
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useDelete<void, DeleteProjectParams>({
    endpoint: ({ projectId }) => `/projects/${projectId}/`,
    apiService: ApiService.Geoapi,
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: 'projects' });
      },
    },
  });
};
