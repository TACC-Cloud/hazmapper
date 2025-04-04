import React from 'react';
import { Feature, FeatureType, getFeatureType } from '@hazmapper/types';
import { SectionMessage } from '@tacc/core-components';
import AssetPointCloud from './AssetPointCloud';
import AssetQuestionnaire from './AssetQuestionnaire';
import AssetStreetview from './AssetStreetview';

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
      return <img src={featureSource} alt="Asset" loading="lazy" />;
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
    case FeatureType.GeometryCollection:
    default:
      if (isGeometry(featureType)) {
        return (
          <SectionMessage type="info">
            This feature has no asset.
          </SectionMessage>
        );
      }
      return <SectionMessage type="warn">Unknown asset</SectionMessage>;
  }
};

export default AssetRenderer;
