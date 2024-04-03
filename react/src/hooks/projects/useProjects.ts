import { UseQueryResult } from 'react-query';
import { Project } from '../../types';
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
