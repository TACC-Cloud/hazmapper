import React, { useState, useEffect } from 'react';
import { Feature, FeatureType, getFeatureType } from '@hazmapper/types';
import { SectionMessage } from '@tacc/core-components';
import AssetPointCloud from './AssetPointCloud';
import AssetQuestionnaire from './AssetQuestionnaire';

interface AssetRendererProps {
  selectedFeature: Feature;
  featureSource: string;
}

const AssetRenderer: React.FC<AssetRendererProps> = ({
  selectedFeature,
  featureSource,
}) => {
  const [currentFeatureType, setCurrentFeatureType] = useState<FeatureType>(
    () => getFeatureType(selectedFeature)
  );
  useEffect(() => {
    const newFeatureType = getFeatureType(selectedFeature);
    if (newFeatureType !== currentFeatureType) {
      setCurrentFeatureType(newFeatureType);
    }
  }, [selectedFeature, currentFeatureType]);
  const isGeometry = (currentFeatureType: FeatureType): boolean => {
    return currentFeatureType.includes(selectedFeature.geometry.type);
  };

  switch (currentFeatureType) {
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
    case FeatureType.Questionnaire:
      return (
        <AssetQuestionnaire
          feature={selectedFeature}
          featureSource={featureSource}
        />
      );
    case FeatureType.GeometryCollection:
    default:
      if (isGeometry(currentFeatureType)) {
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
