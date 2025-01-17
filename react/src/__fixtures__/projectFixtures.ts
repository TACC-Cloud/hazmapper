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
          email: 'test1@test.com',
          fname: 'Fixture First Name',
          lname: 'Fixture Last Name',
          username: 'fixture1Username',
        },
        {
          inst: 'University of Texas at Austin (utexas.edu)',
          role: 'co_pi',
          email: 'test2@test.com',
          fname: 'Tester',
          lname: 'Test',
          username: 'fixture2Username',
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
      description: 'Map Test description required.',
      nhLongitude: '',
      projectType: 'None',
      teamMembers: [],
      awardNumbers: [],
      guestMembers: [],
      hazmapperMaps: [
        {
          name: 'Hazmapper_TestProject',
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
