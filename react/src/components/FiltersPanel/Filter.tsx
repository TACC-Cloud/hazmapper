import React, { useState } from 'react';
import styles from './Filters.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import the CSS

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
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());
  const handleFilterChange = (assetType: string) => {
    if (selectedAssetTypes.includes(assetType)) {
      onFiltersChange(selectedAssetTypes.filter((type) => type !== assetType));
    } else {
      onFiltersChange([...selectedAssetTypes, assetType]);
    }
  };

  return (
    <div className={styles.root}>
      <h3>Filters</h3>
      <h2>Date Range</h2>
      <h5>Start Date</h5>
      <DatePicker
        selected={selectedStartDate}
        onChange={(date) => setSelectedStartDate(date)}
      />
      <h5>End Date</h5>
      <DatePicker
        selected={selectedEndDate}
        onChange={(date) => setSelectedEndDate(date)}
      />
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
