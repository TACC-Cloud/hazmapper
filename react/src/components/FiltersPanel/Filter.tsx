import React, { useState } from 'react';
import styles from './Filters.module.css';

interface FiltersProps {
  selectedAssetTypes: string[];
  onFiltersChange: (selectedAssetTypes: string[]) => void;
}

const assetTypeOptions = {
  Image: 'Image',
  Video: 'Video',
  PointCloud: 'Point Cloud',
  Streetview: 'Streetview',
  Questionnaire: 'Questionnaire',
  NoAssetVector: 'No Asset Vector',
};

const Filters: React.FC<FiltersProps> = ({
  selectedAssetTypes,
  onFiltersChange,
}) => {
  const [isTodayChecked, setIsTodayChecked] = useState(false);
  const handleFilterChange = (assetType: string) => {
    if (selectedAssetTypes.includes(assetType)) {
      onFiltersChange(selectedAssetTypes.filter((type) => type !== assetType));
    } else {
      onFiltersChange([...selectedAssetTypes, assetType]);
    }
  };

  const handleTodayChange = () => {
    setIsTodayChecked(!isTodayChecked);
  };

  return (
    <div className={styles.root}>
      <h3>Filters</h3>
      <h2>Date Range</h2>
      <div className={styles.filterOption}>
        <input
          type="checkbox"
          id="date-range-today"
          checked={isTodayChecked}
          onChange={handleTodayChange}
        />
        <label htmlFor="date-range-today" className={styles.filterLabel}>
          Today
        </label>
      </div>
      <h2>Asset Types</h2>
      {Object.entries(assetTypeOptions).map(([key, value]) => (
        <div key={key}>
          <label className={styles.filterOption}>
            <input
              type="checkbox"
              checked={selectedAssetTypes.includes(key)}
              onChange={() => handleFilterChange(key)}
            />
            {value}
          </label>
        </div>
      ))}
    </div>
  );
};

export default Filters;
