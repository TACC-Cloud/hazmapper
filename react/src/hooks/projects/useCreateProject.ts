import { usePost } from '../../requests';
import { Project } from '../../types';

type ProjectData = {
  // TO-DO: Make sure project data structure is correct for API
  name: string;
  description: string;
  system_file: string;
};

// type ProjectData = {
//     id: number;
//     name: string;
//     description: string;
//     public: boolean;
//     uuid: string;
//     system_file: string;
//     system_id: string;
//     system_path: string;
//     deletable: boolean;
//   };

const useCreateProject = () => {
  const baseUrl = 'https://agave.designsafe-ci.org/geo/v2';
  const endpoint = '/projects/';

  return usePost<ProjectData, Project>({
    endpoint,
    baseUrl,
  });
};

export default useCreateProject;
