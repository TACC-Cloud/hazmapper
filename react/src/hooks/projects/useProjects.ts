import { UseQueryResult } from 'react-query';
import {
  Project,
  DesignSafeProject,
  DesignSafeProjectCollection,
  ApiService,
} from '../../types';
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
export const useDsProjects =
  (): UseQueryResult<DesignSafeProjectCollection> => {
    const query = useGet<DesignSafeProjectCollection>({
      endpoint: `/api/projects/v2/`,
      key: ['projectsv2'],
      apiService: ApiService.DesignSafe,
    });
    return query;
  };

export const mergeDesignSafeProject = (
  projects: Project[],
  dsProjects: DesignSafeProject[]
): Project[] => {
  if (dsProjects && dsProjects.length > 0) {
    return projects.map((proj) => {
      const dsProject: DesignSafeProject | undefined = dsProjects.find(
        (dsproj?) => dsproj?.uuid == proj.system_id?.replace('project-', '')
      );
      proj.ds_project = dsProject;
      proj.ds_project_id = dsProject?.value.projectId;
      proj.ds_project_title = dsProject?.value.title;
      return proj;
    });
  }
  return projects;
};
