import React from 'react';
import styles from './Filters.module.css';
import { DatePicker } from 'antd';
import { Button, Flex, Tooltip } from 'antd';
import type { Dayjs } from 'dayjs';
import { QuestionCircleOutlined } from '@ant-design/icons';

interface FiltersProps {
  selectedAssetTypes: string[];
  onFiltersChange: (selectedAssetTypes: string[]) => void;
  startDate: Dayjs;
  setStartDate: (date: Dayjs) => void;
  endDate: Dayjs;
  setEndDate: (date: Dayjs) => void;
  toggleDateFilter: boolean;
  setToggleDateFilter: (toggleDateFilter: boolean) => void;
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

  return (
    <Flex vertical className={styles.root}>
      {toggleDateFilter ? (
        <>
          <Button onClick={() => setToggleDateFilter(false)}>
            Disable Date Range Filter
          </Button>
          <Flex vertical>
            <h2>
              <Flex align="center" justify="space-between">
                Date Range
                <Tooltip
                  title="Choose the date(s) corresponding to when the data collection occurred in the field, not when the data was uploaded to the map project."
                  placement="right"
                >
                  <Button type="link" icon={<QuestionCircleOutlined />} />
                </Tooltip>
              </Flex>
            </h2>
            <h5>Start Date</h5>
            <DatePicker
              defaultValue={startDate}
              onChange={setStartDate}
              allowClear={false}
            />
            <h5>End Date</h5>
            <DatePicker
              defaultValue={endDate}
              onChange={setEndDate}
              allowClear={false}
            />
          </Flex>
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
    </Flex>
  );
};

export default Filters;
