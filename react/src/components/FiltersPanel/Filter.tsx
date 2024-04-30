import React from 'react';
import styles from './Filters.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface FiltersProps {
  selectedAssetTypes: string[];
  onFiltersChange: (selectedAssetTypes: string[]) => void;
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
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
      <h2>Date Range</h2>
      <h5>Start Date</h5>
      <DatePicker
        selected={startDate}
        onChange={(date: Date) => setStartDate(date)}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        customInput={<CustomInputWithTooltip />}
      />
      <h5>End Date</h5>
      <DatePicker
        selected={endDate}
        onChange={(date: Date) => setEndDate(date)}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        customInput={<CustomInputWithTooltip />}
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
