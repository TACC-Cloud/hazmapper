import { usePost } from '../../requests';
import { ApiService, Project, ProjectRequest } from '../../types';

const useCreateProject = () => {
  const endpoint = '/projects/';

  return usePost<ProjectRequest, Project>({
    endpoint,
    apiService: ApiService.Geoapi,
  });
};

export default useCreateProject;
