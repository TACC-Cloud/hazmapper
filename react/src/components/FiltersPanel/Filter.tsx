import React, { useState, useEffect } from 'react';
import styles from './Filters.module.css';

interface FilterOptions {
  Image: boolean;
  Video: boolean;
  PointCloud: boolean;
  Streetview: boolean;
  Questionnaire: boolean;
  NoAssetVector: boolean;
}

const FilterOptions: FilterOptions = {
  Image: true,
  Video: true,
  PointCloud: true,
  Streetview: true,
  Questionnaire: true,
  NoAssetVector: true,
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

interface FiltersProps {
  projectId?: number;
  isPublic: boolean;
  onFiltersChange: (selectedAssetTypes: string[]) => void;
}

const Filters: React.FC<FiltersProps> = ({ onFiltersChange }) => {
  const [isTodayChecked, setIsTodayChecked] = useState(false);
  const [selectedFilters, setSelectedFilters] =
    useState<FilterOptions>(FilterOptions);
  useEffect(() => {
    const formatAssetTypeName = (name: string) => {
      switch (name) {
        case 'PointCloud':
          return 'point_cloud';
        case 'NoAssetVector':
          return 'no_asset_vector';
        default:
          return name.toLowerCase();
      }
    };
    const selectedAssetTypes = Object.entries(selectedFilters)
      .filter(([, isSelected]) => isSelected)
      .map(([key]) => formatAssetTypeName(key));

    onFiltersChange(selectedAssetTypes);
  }, [selectedFilters, onFiltersChange]);

  const handleFilterChange = (filterName: keyof FilterOptions) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: !prevFilters[filterName],
    }));
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
