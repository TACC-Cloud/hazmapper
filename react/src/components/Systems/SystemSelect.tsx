import React, { useEffect, useState } from 'react';
import { useDsProjects, useSystems } from '../../hooks';
import { DesignSafeProject } from '@hazmapper/types';

interface SystemSelectProps {
  className: string;
  showPublicSystems: boolean;
  onSystemSelect: (selectedSystem: string) => void;
}

export const SystemSelect: React.FC<SystemSelectProps> = ({
  className,
  showPublicSystems,
  onSystemSelect,
}) => {
  const { myDataSystem, communityDataSystem, publishedDataSystem } =
    useSystems();

  const [dsProjects, setDsProjects] = useState<DesignSafeProject[]>([]);

  const { data: dsProjectsResult } = useDsProjects();

  useEffect(() => {
    if (dsProjectsResult) {
      setDsProjects(dsProjectsResult?.result || []);
    }
  }, [dsProjectsResult]);

  useEffect(() => {
    if (myDataSystem) {
      onSystemSelect(myDataSystem?.id);
    }
  }, [myDataSystem]);

  return (
    <>
      <select
        className={className}
        onChange={(e) => onSystemSelect(e.target.value)}
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
