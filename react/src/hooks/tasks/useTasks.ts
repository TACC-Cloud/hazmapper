import { Task } from '@hazmapper/types';
import { useGet } from '@hazmapper/requests';
import { UseQueryResult } from '@tanstack/react-query';

export const KEY_USE_TASKS = 'tasks';

interface UseTasksParams {
  projectId: number;
  options?: object;
}

export const useTasks = ({
  projectId,
  options = {},
}: UseTasksParams): UseQueryResult<Task[]> => {
  const endpoint = `/projects/${projectId}/tasks/`;

  const query = useGet<Task[]>({
    endpoint,
    key: [
      KEY_USE_TASKS,
      {
        projectId,
      },
    ],
    options,
  });
  return query;
};
