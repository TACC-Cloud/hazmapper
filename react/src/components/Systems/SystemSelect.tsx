import React, { useEffect } from 'react';
import { useProjectsWithDesignSafeInformation, useSystems } from '../../hooks';

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

  const { data: projects } = useProjectsWithDesignSafeInformation();

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
          {projects?.map((proj) => {
            return (
              <option key={proj.id} value={proj.system_id}>
                PRJ-{proj.id} | {proj.name}
              </option>
            );
          })}
        </optgroup>
      </select>
    </>
  );
};
