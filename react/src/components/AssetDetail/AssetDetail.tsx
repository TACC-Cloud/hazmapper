import React, { Suspense, useState, useEffect } from 'react';
import _ from 'lodash';
import { useAppConfiguration } from '@hazmapper/hooks';
import { Asset, FeatureTypeNullable, Feature } from '@hazmapper/types';
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

  const [selectedFeatureAsset, setSelectedFeatureAsset] = useState<
    Asset | undefined
  >(selectedFeature?.assets[0]);

  useEffect(() => {
    const featureAsset = selectedFeature?.assets[0];
    setSelectedFeatureAsset(featureAsset);
  }, [selectedFeature]);

  const featureSource: string | undefined =
    geoapiUrl + '/assets/' + selectedFeatureAsset?.path;

  const fileType: string | undefined = selectedFeatureAsset?.asset_type;

  const AssetRenderer = React.memo(
    ({
      type,
      source,
    }: {
      type: string | undefined;
      source: string | undefined;
    }) => {
      switch (type) {
        case 'image':
          return <img src={source} alt="Asset" loading="lazy" />;
        case 'video':
          return (
            <video src={source} controls preload="metadata">
              <track kind="captions" />
            </video>
          );
        case 'point_cloud':
          /*TODO Add pointcloud */
          return <div> source={source}</div>;
        case 'questionnaire':
          /*TODO Add questionnaire */
          return <div> source={source}</div>;
        default:
          return null;
      }
    }
  );
  AssetRenderer.displayName = 'AssetRenderer';

  return (
    <div className={styles.root}>
      <div className={styles.topSection}>
        <FeatureIcon featureType={fileType as FeatureTypeNullable} />
        {selectedFeature && selectedFeature?.assets?.length > 0
          ? selectedFeature?.assets.map((asset) =>
              asset.display_path.split('/').pop()
            )
          : selectedFeature?.id}
        <Button type="link" iconNameAfter="close" onClick={onClose}></Button>
      </div>
      <div className={styles.middleSection}>
        {fileType ? (
          <>
            <Suspense fallback={<LoadingSpinner />}>
              <div className={styles.assetContainer}>
                <AssetRenderer type={fileType} source={featureSource} />
              </div>
            </Suspense>
            <Button /*TODO Download Action */>Download</Button>
          </>
        ) : (
          <>
            <SectionMessage type="info">Feature has no asset.</SectionMessage>
            {!isPublicView && (
              <Button type="primary" /* TODO Add asset to a feature */>
                Add asset from DesignSafe
              </Button>
            )}
          </>
        )}
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
