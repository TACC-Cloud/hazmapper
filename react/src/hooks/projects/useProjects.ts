import { UseQueryResult } from 'react-query';
import { Project } from '../../types';
import { useGet } from '../../requests';

const useProjects = (): UseQueryResult<Project[]> => {
  const query = useGet<Project[]>({
    endpoint: '/projects/',
    key: ['project'],
    baseUrl: 'https://agave.designsafe-ci.org/geo/v2',
  });
  return query;
};

export default useProjects;
