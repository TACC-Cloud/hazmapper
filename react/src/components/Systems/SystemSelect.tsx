import React, { useEffect, useState } from 'react';
import {
  useDesignSafeProjects,
  useDesignSafePublishedProjects,
  useGetSystems,
  TransformedGetSystemsResponse,
} from '../../hooks';
import { useFormContext } from 'react-hook-form';
import {
  DesignSafeProject,
  DesignSafePublishedProject,
} from '@hazmapper/types';

interface SystemSelectProps {
  className: string;
  showPublicSystems: boolean;
}

export const SystemSelect: React.FC<SystemSelectProps> = ({
  className,
  showPublicSystems,
}) => {
  const {
    data: systemsData = {} as TransformedGetSystemsResponse,
    isFetching: isFetchingSystems,
  } = useGetSystems();

  const { myDataSystem, communityDataSystem } = systemsData;

  const [dsProjects, setDsProjects] = useState<DesignSafeProject[]>([]);

  const { data: dsProjectsResult } = useDesignSafeProjects();

  const {
    data: dsPublishedProjectsResults,
    isFetching: isFetchingPublishedProjects,
  } = useDesignSafePublishedProjects();

  const [dsPublishedProjects, setDsPublishedProjects] = useState<
    DesignSafePublishedProject[]
  >([]);

  const { register, reset } = useFormContext();

  useEffect(() => {
    if (dsProjectsResult) {
      // TODO consider sorgting by projectId
      setDsProjects(dsProjectsResult?.result || []);
    }
  }, [dsProjectsResult]);

  useEffect(() => {
    if (dsPublishedProjectsResults?.result) {
      const sorted = [...dsPublishedProjectsResults.result].sort((a, b) => {
        const aNum = parseInt(a.projectId.replace('PRJ-', ''), 10);
        const bNum = parseInt(b.projectId.replace('PRJ-', ''), 10);
        return bNum - aNum;
      });

      setDsPublishedProjects(sorted);
    }
  }, [dsPublishedProjectsResults]);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetchingSystems, isFetchingPublishedProjects]);

  return (
    <>
      <select
        className={className}
        defaultValue={myDataSystem?.id}
        {...register('system')}
      >
        {myDataSystem && <option value={myDataSystem.id}>My Data</option>}
        {communityDataSystem && showPublicSystems && (
          <option value={communityDataSystem.id}>Community Data</option>
        )}
        <optgroup label="My Projects">
          {dsProjects?.map((proj) => {
            return (
              <option key={proj.uuid} value={`project-${proj.uuid}`}>
                {proj.value.projectId} | {proj.value.title}
              </option>
            );
          })}
        </optgroup>
        {showPublicSystems && (
          <optgroup label="Published Data">
            {dsPublishedProjects?.map((publishedProject) => {
              return (
                <option
                  key={publishedProject.projectId}
                  /* value is PRJ (i.e. PRJ-123) */
                  value={`designsafe.storage.published/${publishedProject.projectId}`}
                >
                  {publishedProject.projectId} | {publishedProject.title}
                </option>
              );
            })}
          </optgroup>
        )}
      </select>
    </>
  );
};
