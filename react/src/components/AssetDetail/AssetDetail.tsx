import React, { Suspense } from 'react';
import _ from 'lodash';
import { useAppConfiguration } from '@hazmapper/hooks';
import AssetPointCloud from './AssetPointCloud';
import AssetButton from './AssetButton';
import {
  FeatureTypeNullable,
  Feature,
  getFeatureType,
  FeatureType,
} from '@hazmapper/types';
import { FeatureIcon } from '@hazmapper/components/FeatureIcon';
import { Button, LoadingSpinner, SectionMessage } from '@tacc/core-components';
import styles from './AssetDetail.module.css';

type AssetModalProps = {
  onClose: () => void;
  selectedFeature: Feature;
  isPublicView: boolean;
};

const AssetDetail: React.FC<AssetModalProps> = ({
  selectedFeature,
  onClose,
  isPublicView,
}) => {
  const config = useAppConfiguration();
  const geoapiUrl = config.geoapiUrl;

  const featureSource: string =
    geoapiUrl + '/assets/' + selectedFeature?.assets?.[0]?.path;

  const fileType: FeatureType = getFeatureType(selectedFeature);

  const isGeometry = (fileType: FeatureType): boolean => {
    return fileType.includes(selectedFeature.geometry.type);
  };

  const AssetRenderer = () => {
    switch (fileType) {
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
        /*TODO Add questionnaire */
        return <div> source={featureSource}</div>;
      case FeatureType.GeometryCollection:
      default:
        if (isGeometry(fileType)) {
          return (
            <SectionMessage type="info">
              This feature has no asset.
            </SectionMessage>
          );
        }
        return <SectionMessage type="warn">Unknown asset</SectionMessage>;
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.topSection}>
        <FeatureIcon featureType={fileType as FeatureTypeNullable} />
        {selectedFeature?.assets?.length > 0
          ? selectedFeature?.assets.map((asset) =>
              // To make sure fileTree name matches title and catches null
              asset.display_path
                ? asset.display_path.split('/').pop()
                : asset.id
                ? asset.id
                : selectedFeature.id
            )
          : selectedFeature?.id}
        <Button type="link" iconNameAfter="close" onClick={onClose}></Button>
      </div>
      <div className={styles.middleSection}>
        <Suspense fallback={<LoadingSpinner />}>
          <div className={styles.assetContainer}>
            <AssetRenderer />
          </div>
          <AssetButton
            selectedFeature={selectedFeature}
            featureSource={featureSource}
            isPublicView={isPublicView}
          />
        </Suspense>
      </div>
      <div className={styles.bottomSection}>
        <div className={styles.metadataTable}>
          <table>
            <thead>
              <tr>
                <th colSpan={2}>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {selectedFeature?.properties &&
              Object.keys(selectedFeature.properties).length > 0 ? (
                Object.entries(selectedFeature.properties)
                  .filter(([key]) => !key.startsWith('_hazmapper'))
                  .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) // Alphabetizes metadata
                  .map(([propKey, propValue]) => (
                    <tr key={propKey}>
                      <td>{_.startCase(propKey)}</td>
                      <td>
                        {propKey.startsWith('description') ? (
                          <code>{propValue}</code>
                        ) : (
                          _.trim(JSON.stringify(propValue), '"')
                        )}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={2}>There are no metadata properties.</td>
                </tr>
              )}
            </tbody>
          </table>
          <table>
            <thead>
              <tr>
                <th colSpan={2}>Geometry</th>
              </tr>
            </thead>
            <tbody>
              {selectedFeature?.geometry &&
                Object.entries(selectedFeature.geometry).map(
                  ([propKey, propValue]) =>
                    propValue &&
                    propValue !== undefined &&
                    propValue.toString().trim() !== '' &&
                    propValue.toString() !== 'null' && (
                      <tr key={propKey}>
                        <td>{_.trim(_.startCase(propKey.toString()), '"')}</td>
                        <td>
                          {' '}
                          {Array.isArray(propValue) && propValue.length === 2
                            ? `Latitude: ${propValue[0].toString()},
                             Longitude: ${propValue[1].toString()}`
                            : _.trim(JSON.stringify(propValue), '"')}
                        </td>
                      </tr>
                    )
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
