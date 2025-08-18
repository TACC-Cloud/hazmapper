import React, { useMemo } from 'react';
import { Project } from '@hazmapper/types';
import { List, Button } from 'antd';
import { LoadingSpinner, SectionMessage } from '@tacc/core-components';
import {
  useAppConfiguration,
  useDesignSafeProjects,
  useAuthenticatedUser,
} from '@hazmapper/hooks';
import { renderFilePathLabel } from '@hazmapper/utils/fileUtils';

interface SaveTabProps {
  project: Project;
}

const SaveTabContent: React.FC<SaveTabProps> = ({ project }) => {
  const config = useAppConfiguration();
  const {
    data: designSafeProjects,
    isError,
    isLoading,
    error,
  } = useDesignSafeProjects();
  const { username } = useAuthenticatedUser();
  const dsDataDepotUrl = `${config.designsafePortalUrl}/data/browser/`;
  const dsProj = designSafeProjects?.result?.find(
    (ds_project) =>
      project.system_id.replace('project-', '') === ds_project.uuid
  );

  const { dsProjectHref, dsFolderHref, myDataHref } = useMemo(() => {
    let dsProjectHref = '';
    let dsFolderHref = '';
    let myDataHref = '';

    if (project.system_id) {
      if (project.system_id.startsWith('project')) {
        dsFolderHref = `${dsDataDepotUrl}projects/${dsProj?.value.projectId}/${project.system_path}`;

        if (project.system_file) {
          dsProjectHref = `${dsDataDepotUrl}projects/${dsProj?.value.projectId}`;
        }
      } else {
        myDataHref = `${dsDataDepotUrl}tapis/${project.system_id}/`;
        dsFolderHref = `${myDataHref}${project.system_path}/`;
      }
    }

    return { dsProjectHref, dsFolderHref, myDataHref };
  }, [
    project.system_id,
    project.system_path,
    project.system_file,
    dsDataDepotUrl,
    dsProj?.value.projectId,
  ]);

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <SectionMessage type="error">
        {' '}
        There was an error loading the save location of this map.{' '}
        {error ? `Error: ${error}` : ''}
      </SectionMessage>
    );

  return (
    <List>
      <List.Item>
        <List.Item.Meta
          title="File"
          description={`${project.system_file}.hazmapper`}
        />
      </List.Item>
      <List.Item>
        <List.Item.Meta
          title="Path"
          description={
            <>
              <Button
                type="link"
                href={dsFolderHref}
                target="_blank"
                rel="noreferrer"
                style={{ padding: 0 }}
              >
                {renderFilePathLabel(
                  project.system_path,
                  username,
                  project.system_id
                )}
              </Button>
            </>
          }
        />
      </List.Item>
      <List.Item>
        <List.Item.Meta
          title="Project"
          description={
            <>
              {dsProj ? (
                <Button
                  type="link"
                  href={dsProjectHref}
                  target="_blank"
                  rel="noreferrer"
                  style={{ padding: 0 }}
                >
                  {dsProj.value.projectId}
                  {' | '}
                  {dsProj.value.title}
                </Button>
              ) : (
                <Button
                  type="link"
                  href={myDataHref}
                  target="_blank"
                  rel="noreferrer"
                  style={{ padding: 0 }}
                >
                  My Data
                </Button>
              )}
            </>
          }
        />
      </List.Item>
    </List>
  );
};
export default SaveTabContent;
