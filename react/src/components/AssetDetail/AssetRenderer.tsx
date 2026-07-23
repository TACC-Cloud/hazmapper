import React from 'react';
import { Feature, FeatureType, getFeatureType } from '@hazmapper/types';
import { SectionMessage } from '@tacc/core-components';
import AssetPointCloud from './AssetPointCloud';
import AssetQuestionnaire from './AssetQuestionnaire';
import AssetStreetview from './AssetStreetview';

import styles from './AssetDetail.module.css';

interface AssetRendererProps {
  isPublicView: boolean;
  selectedFeature: Feature;
  featureSource: string;
}

const AssetRenderer: React.FC<AssetRendererProps> = ({
  isPublicView,
  selectedFeature,
  featureSource,
}) => {
  const featureType: FeatureType = getFeatureType(selectedFeature);

  const isGeometry = (featureType: FeatureType): boolean => {
    return featureType.includes(selectedFeature.geometry.type);
  };

  switch (featureType) {
    case FeatureType.Image:
      return (
        <img
          className={styles.assetImage}
          src={featureSource}
          alt="Asset"
          loading="lazy"
        />
      );
    case FeatureType.Video:
      return (
        <video src={featureSource} controls preload="metadata">
          <track kind="captions" />
        </video>
      );
    case FeatureType.PointCloud:
      return <AssetPointCloud featureSource={featureSource} />;
    case FeatureType.Streetview:
      return (
        <AssetStreetview
          feature={selectedFeature}
          isPublicView={isPublicView}
        />
      );
    case FeatureType.Questionnaire:
      return (
        <AssetQuestionnaire
          feature={selectedFeature}
          featureSource={featureSource}
        />
      );
    case FeatureType.Vector:
      // Vector data is rendered on the map from its PMTiles asset, so there is
      // no image/video preview to show here.
      return (
        <div style={{ flex: '0 0 auto', margin: 'auto' }}>
          <SectionMessage type="info">
            This vector layer is displayed on the map. Click a feature on the
            map to see its attributes.
          </SectionMessage>
        </div>
      );
    case FeatureType.GeometryCollection:
    default:
      if (isGeometry(featureType)) {
        return (
          <div style={{ flex: '0 0 auto', margin: 'auto' }}>
            <SectionMessage type="info">
              This feature has no asset.
            </SectionMessage>
          </div>
        );
      }
      return (
        <div style={{ flex: '0 0 auto', margin: 'auto' }}>
          <SectionMessage type="warn">Unknown asset</SectionMessage>
        </div>
      );
  }
};

export default AssetRenderer;
