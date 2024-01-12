import { UseQueryResult } from 'react-query';
import {
  Project,
  DesignSafeProject,
  DesignSafeProjectCollection,
} from '../../types';
import { useGet } from '../../requests';

export const useProjects = (): UseQueryResult<Project[]> => {
  const query = useGet<Project[]>({
    endpoint: '/projects/',
    key: ['projects'],
    baseUrl: 'https://agave.designsafe-ci.org/geo/v2',
  });
  return query;
};

export const useDsProjects =
  (): UseQueryResult<DesignSafeProjectCollection> => {
    const query = useGet<DesignSafeProjectCollection>({
      endpoint: `projects/v2/`,
      key: ['projectsv2'],
      baseUrl: 'https://agave.designsafe-ci.org//',
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
