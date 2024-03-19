import React, { useState } from 'react';
import styles from './Filters.module.css';

interface FilterOptions {
  Images: boolean;
  Videos: boolean;
  PointClouds: boolean;
  Streetview: boolean;
  Questionnaire: boolean;
  NoAssetVector: boolean;
}

const FilterOptions: FilterOptions = {
  Images: false,
  Videos: false,
  PointClouds: false,
  Streetview: false,
  Questionnaire: false,
  NoAssetVector: false,
};

const FilterOption: React.FC<{
  label: string;
  checked: boolean;
  onChange: (filterName: string) => void;
}> = ({ label, checked, onChange }) => (
  <label className={styles.filterOption}>
    <input type="checkbox" checked={checked} onChange={() => onChange(label)} />
    {label}
  </label>
);

const Filters: React.FC = () => {
  const [selectedFilters, setSelectedFilters] = useState(FilterOptions);

  const handleFilterChange = (filterName: keyof FilterOptions) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: !prevFilters[filterName],
    }));
  };

  return (
    <div className={styles.root}>
      <h2>Asset Types</h2>
      {Object.entries(selectedFilters).map(([filterName, isChecked]) => (
        <FilterOption
          key={filterName}
          label={filterName}
          checked={isChecked}
          onChange={() => handleFilterChange(filterName as keyof FilterOptions)}
        />
      ))}
    </div>
  );
};

export default Filters;
