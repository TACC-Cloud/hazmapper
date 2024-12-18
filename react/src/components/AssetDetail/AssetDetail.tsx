import React, { Suspense } from 'react';
import _ from 'lodash';
import AssetGeometry from './AssetGeometry';
import { useAppConfiguration } from '@hazmapper/hooks';
import { FeatureTypeNullable, Feature, getFeatureType } from '@hazmapper/types';
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

  const fileType = getFeatureType(selectedFeature);

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
                <th colSpan={2} className="text-center">
                  Metadata
                </th>
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
          <AssetGeometry
            selectedFeature={selectedFeature}
          />
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
