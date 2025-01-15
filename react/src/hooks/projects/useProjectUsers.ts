import { UseQueryResult } from 'react-query';
import { ProjectUser } from '@hazmapper/types';
import { useGet } from '@hazmapper/requests';

type ProjectUsersParams = {
  projectId: number;
  options: object;
};

export const useProjectUsers = ({
  projectId,
  options,
}: ProjectUsersParams): UseQueryResult<ProjectUser[]> => {
  const query = useGet<ProjectUser[]>({
    endpoint: `/projects/${projectId}/users/`,
    key: ['active-project-users'],
    options,
  });
  return query;
};