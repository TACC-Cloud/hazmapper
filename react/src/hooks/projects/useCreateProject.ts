import { usePost } from '../../requests';
import { Project } from '../../types';

type ProjectData = {
  observable: boolean;
  watch_content: boolean;
  project: {
    name: string;
    description: string;
    system_file: string;
    system_id: string;
    system_path: string;
  };
};

const useCreateProject = () => {
  const baseUrl = 'https://agave.designsafe-ci.org/geo/v2';
  const endpoint = '/projects/';

  return usePost<ProjectData, Project>({
    endpoint,
    baseUrl,
  });
};

export default useCreateProject;
