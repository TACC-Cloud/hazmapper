import { UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  Project,
  DesignSafeProject,
  DesignSafeProjectCollection,
  ApiService,
  ProjectRequest,
} from '@hazmapper/types';
import { useGet, useDelete, usePut } from '@hazmapper/requests';
import { useParams } from 'react-router-dom';

export const useProjects = (): UseQueryResult<Project[]> => {
  const query = useGet<Project[]>({
    endpoint: '/projects/',
    key: ['projects'],
  });
  return query;
};

interface UseProjectParams {
  projectUUID?: string;
  options: object;
}

export const useProject = ({
  projectUUID,
  options,
}: UseProjectParams): UseQueryResult<Project> => {
  const endpoint = `/projects/?uuid=${projectUUID}`;
  const query = useGet<Project>({
    endpoint,
    key: ['project', projectUUID],
    options,
    transform: (data) => data[0], // result is a list with a single Project
  });
  return query;
};

interface UseDesignSafeProjectParams {
  designSafeProjectUUID: string;
  options?: object;
}

export const useDesignSafeProject = ({
  designSafeProjectUUID,
  options = {},
}: UseDesignSafeProjectParams): UseQueryResult<
  DesignSafeProject | undefined
> => {
  const query = useGet<DesignSafeProject>({
    endpoint: `/api/projects/v2/${designSafeProjectUUID}/`,
    key: ['designsafe-single-projectv2', designSafeProjectUUID],
    options,
    apiService: ApiService.DesignSafe,
    transform: (data) => data.baseProject,
  });
  return query;
};

export const useDesignSafeProjects = (): UseQueryResult<
  DesignSafeProjectCollection | undefined
> => {
  // TODO add offset and a high limit (as default is 100 for this endpoint)
  const query = useGet<DesignSafeProjectCollection>({
    endpoint: `/api/projects/v2/`,
    key: ['designsafe-projectsv2'],
    apiService: ApiService.DesignSafe,
  });
  return query;
};

export function useProjectsWithDesignSafeInformation() {
  const dsProjectQuery = useDesignSafeProjects();
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
  }, [
    dsProjectQuery.data,
    dsProjectQuery.isSuccess,
    projectQuery.data,
    projectQuery.isSuccess,
  ]);

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
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
    },
  });
};
export const useUpdateProjectInfo = () => {
  const queryClient = useQueryClient();
  const params = useParams<{ projectUUID: string }>();
  const projectUUID = params.projectUUID ?? '';
  const { data: currentProject } = useProject({
    projectUUID,
    options: {
      enabled: !!projectUUID,
    },
  });

  return usePut<ProjectRequest, Project>({
    endpoint: `/projects/${currentProject?.id}/`,
    apiService: ApiService.Geoapi,
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        queryClient.invalidateQueries({ queryKey: ['project', projectUUID] });
      },
    },
  });
};
