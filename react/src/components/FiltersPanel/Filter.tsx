import React from 'react';
import styles from './Filters.module.css';
import DatePicker from 'react-datepicker';
import { Button } from 'antd';
import 'react-datepicker/dist/react-datepicker.css';

interface FiltersProps {
  selectedAssetTypes: string[];
  onFiltersChange: (selectedAssetTypes: string[]) => void;
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
  toggleDateFilter: boolean;
  setToggleDateFilter: (toggleDateFilter: boolean) => void;
}

interface CustomInputProps {
  value?: string;
  onClick?: () => void;
}

export const assetTypeOptions = {
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
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  toggleDateFilter,
  setToggleDateFilter,
}) => {
  const handleFilterChange = (assetType: string) => {
    if (selectedAssetTypes.includes(assetType)) {
      onFiltersChange(selectedAssetTypes.filter((type) => type !== assetType));
    } else {
      onFiltersChange([...selectedAssetTypes, assetType]);
    }
  };

  const CustomInputWithTooltip = React.forwardRef<
    HTMLInputElement,
    CustomInputProps
  >(({ value, onClick }, ref) => (
    <div className={styles.customInputContainer}>
      <input
        className={styles.customInput}
        value={value}
        onClick={onClick}
        ref={ref}
        readOnly
      />
      <span
        className={styles.tooltip}
        title="Choose the date(s) corresponding to when the data collection occurred in the field, not when the data was uploaded to the map project."
      >
        ?
      </span>
    </div>
  ));

  CustomInputWithTooltip.displayName = 'CustomInputWithTooltip';

  return (
    <div className={styles.root}>
      <h3>Filters</h3>
      {toggleDateFilter ? (
        <>
          <Button onClick={() => setToggleDateFilter(false)}>
            Disable Date Range Filter
          </Button>
          <h2>Date Range</h2>
          <h5>Start Date</h5>
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date as Date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            customInput={<CustomInputWithTooltip />}
          />
          <h5>End Date</h5>
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => setEndDate(date as Date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            customInput={<CustomInputWithTooltip />}
          />
        </>
      ) : (
        <Button type="primary" onClick={() => setToggleDateFilter(true)}>
          Enable Date Range Filter
        </Button>
      )}
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
