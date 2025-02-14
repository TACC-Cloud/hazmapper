import React, { useEffect, useState } from 'react';
import {
  useDesignSafeProjects,
  useGetSystems,
  TransformedGetSystemsResponse,
} from '../../hooks';
import { useFormContext } from 'react-hook-form';
import { DesignSafeProject } from '@hazmapper/types';

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
    isFetching,
  } = useGetSystems();
  const { myDataSystem, communityDataSystem, publishedDataSystem } =
    systemsData;

  const [dsProjects, setDsProjects] = useState<DesignSafeProject[]>([]);

  const { data: dsProjectsResult } = useDesignSafeProjects();

  const { register, reset } = useFormContext();

  useEffect(() => {
    if (dsProjectsResult) {
      setDsProjects(dsProjectsResult?.result || []);
    }
  }, [dsProjectsResult]);

  useEffect(() => {
    reset();
  }, [isFetching]);

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
        {publishedDataSystem && showPublicSystems && (
          <option value={publishedDataSystem.id}>Published Data</option>
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
      </select>
    </>
  );
};
