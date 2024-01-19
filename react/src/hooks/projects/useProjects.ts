import { UseQueryResult } from 'react-query';
import { Project } from '../../types';
import { useGet } from '../../requests';

const useProjects = (): UseQueryResult<Project[]> => {
  const query = useGet<Project[]>({
    endpoint: '/projects/',
    key: ['projects'],
  });
  return query;
};

export default useProjects;
