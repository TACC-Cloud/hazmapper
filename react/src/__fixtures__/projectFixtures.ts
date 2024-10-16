import {
  Project,
  DesignSafeProject,
  DesignSafeProjectCollection,
  ProjectRequest,
} from '../types';

export const projectMock: Project = {
  id: 1,
  uuid: 'abc123',
  name: 'Sample Project',
  description: 'A sample project for testing purposes.',
  public: true,
  system_file: 'sample-file',
  system_id: 'sample-id',
  system_path: '/path/to/sample',
  deletable: true,
  streetview_instances: null,
  ds_project: {
    uuid: 'proj-uuid',
    projectId: 'proj-id',
    title: 'Sample DesignSafe Project',
    value: {
      dois: [],
      coPis: [],
      title: 'Hazmapper V3 PROD Map Test 2024.08.07',
      users: [
        {
          inst: 'University of Texas at Austin (utexas.edu)',
          role: 'pi',
          email: 'jgentle@tacc.utexas.edu',
          fname: 'John',
          lname: 'Gentle',
          username: 'jgentle',
        },
        {
          inst: 'University of Texas at Austin (utexas.edu)',
          role: 'co_pi',
          email: 'sophia.massie@tacc.utexas.edu',
          fname: 'Sophia',
          lname: 'Massie-Perez',
          username: 'smassie',
        },
      ],
      authors: [],
      frTypes: [],
      nhEvent: '',
      nhTypes: [],
      fileObjs: [],
      fileTags: [],
      keywords: [],
      nhEvents: [],
      dataTypes: [],
      projectId: 'PRJ-5566',
      tombstone: false,
      facilities: [],
      nhLatitude: '',
      nhLocation: '',
      description:
        'Hazmapper V3 PROD Map Test 2024.08.07 description required.',
      nhLongitude: '',
      projectType: 'None',
      teamMembers: [],
      awardNumbers: [],
      guestMembers: [],
      hazmapperMaps: [
        {
          name: 'v3_PROD_Hazmapper_2024-08-07_TestProject',
          path: '/',
          uuid: '620aeaf4-f813-4b90-ba52-bc87cfa7b07b',
          deployment: 'production',
        },
      ],
      referencedData: [],
      associatedProjects: [],
    },
  },
};

export const designSafeProjectMock: DesignSafeProject = {
  uuid: 'proj-uuid',
  projectId: 'proj-id',
  title: 'Sample DesignSafe Project',
  value: {},
};

export const designSafeProjectCollectionMock: DesignSafeProjectCollection = {
  result: [designSafeProjectMock],
};

export const projectRequestMock: ProjectRequest = {
  name: 'New Project Request',
  description: 'A description for the new project request.',
  public: true,
  system_file: 'new-project-file',
  system_id: 'new-system-id',
  system_path: '/path/to/new-project',
  watch_content: true,
  watch_users: false,
};
