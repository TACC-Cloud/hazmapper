import { UseQueryResult, useQuery } from 'react-query';
import { Project, DesignSafeProjectCollection, ApiService } from '../../types';
import { useGet } from '../../requests';

export const useProjects = (): UseQueryResult<Project[]> => {
  const query = useGet<Project[]>({
    endpoint: '/projects/',
    key: ['projects'],
  });
  return query;
};

interface UseProjectParams {
  projectUUID?: string;
  isPublic: boolean;
  options: object;
}

export const useProject = ({
  projectUUID,
  isPublic,
  options,
}: UseProjectParams): UseQueryResult<Project> => {
  const projectRoute = isPublic ? 'public-projects' : 'projects';
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
  const query = useGet<DesignSafeProjectCollection | undefined>({
    endpoint: `/api/projects/v2/`,
    key: ['projectsv2'],
    apiService: ApiService.DesignSafe,
  });
  return query;
};

export const mergeDesignSafeProject = (
  ds_project: UseQueryResult<DesignSafeProjectCollection | undefined>
): UseQueryResult<Project[] | undefined> => {
  const projectQuery = useProjects();

  const query = useQuery<Project[] | undefined>({
    queryFn: () => {
      if (!ds_project.data || !projectQuery.data) return undefined;
      const mergedProjects = projectQuery.data.map((proj) => {
        const dsProj = ds_project.data?.result?.find(
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
      return mergedProjects;
    },
    enabled: !!projectQuery.data && !!ds_project.data,
  });
  return query;
};
