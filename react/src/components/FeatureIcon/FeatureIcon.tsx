import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { FeatureTypeNullable } from '@hazmapper/types';
import { featureTypeToIcon } from '@hazmapper/utils/featureIconUtil';
import styles from './FeatureIcon.module.css';

interface Props {
  featureType: FeatureTypeNullable;
}

export const FeatureIcon: React.FC<Props> = ({ featureType }) => {
  const icon = featureTypeToIcon(featureType);

  return <FontAwesomeIcon className={styles.icon} icon={icon} size="sm" />;
};
