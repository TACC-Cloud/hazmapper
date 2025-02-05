import React from 'react';
import { Project } from '@hazmapper/types';
import { Flex, Table, Card } from 'antd';
import { useProjectUsers } from '@hazmapper/hooks';
import { LoadingSpinner, SectionMessage } from '@tacc/core-components';

interface MembersTabProps {
  project: Project;
}

const MembersTabContent: React.FC<MembersTabProps> = ({ project }) => {
  const { data, isLoading, isError, error } = useProjectUsers({
    projectId: project.id,
    options: {
      /* Only fetch if the map is associated with a DS project*/
      enabled: Boolean(project.ds_project),
    },
  });

  return (
    <>
      <Flex vertical justify="center" align="center">
        {data ? (
          <Table
            dataSource={data}
            rowKey={(data) => data.id}
            columns={[
              {
                title: 'Username',
                dataIndex: 'username',
                key: 'username',
              },
            ]}
            pagination={{
              position: ['bottomCenter'],
              hideOnSinglePage: true,
              showSizeChanger: false,
            }}
            style={{ width: '90%' }}
          >
            {isLoading && <LoadingSpinner />}
            {isError && (
              <SectionMessage type="error">
                {' '}
                There was an error loading the members of this project. Error:{' '}
                {error}
              </SectionMessage>
            )}
          </Table>
        ) : (
          <Card type="inner">
            There are no members becuase this map is not saved to a DesignSafe
            project. Members are managed by DesignSafe projects.
          </Card>
        )}
      </Flex>
    </>
  );
};

export default MembersTabContent;
