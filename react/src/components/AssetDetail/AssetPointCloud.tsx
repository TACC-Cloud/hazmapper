import React from 'react';
import DOMPurify from 'dompurify';
import styles from './AssetDetail.module.css';

type PointCloudProps = {
  featureSource: string;
};

const AssetPointCloud: React.FC<PointCloudProps> = ({ featureSource }) => {
  const sanitizedSource = DOMPurify.sanitize(featureSource + '/preview.html');

  return (
    <iframe
      className={styles.pointCloud}
      src={sanitizedSource}
      title={featureSource}
    ></iframe>
  );
};
export default AssetPointCloud;
