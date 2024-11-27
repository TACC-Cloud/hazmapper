import React, { useEffect } from 'react';
import { useSystems } from '@hazmapper/hooks';
import { System } from '@hazmapper/types';

interface SystemSelectProps {
  className: string;
  onSystemSelect: (selectedSystem: string) => void;
}

export const SystemSelect: React.FC<SystemSelectProps> = ({
  className,
  onSystemSelect,
}) => {
  const { data: systems } = useSystems();

  // use dsProjects hook here
  const dsProjects: any[] = [];

  const findSystemById = (id: string): System | undefined => {
    return systems?.find((system) => system.id === id);
  };

  const myDataSystem = findSystemById('designsafe.storage.default');
  const communityDataSystem = findSystemById('designsafe.storage.community');
  const publishDataSystem = findSystemById('designsafe.storage.published');

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
        {communityDataSystem && (
          <option value={communityDataSystem.id}>Community Data</option>
        )}
        {publishDataSystem && (
          <option value={publishDataSystem.id}>Published Data</option>
        )}
        <optgroup label="My Projects">
          {dsProjects.map((proj) => {
            return (
              <option key={proj.id} value={proj.id}>
                {proj.ds_project.title}
              </option>
            );
          })}
        </optgroup>
      </select>
    </>
  );
};
