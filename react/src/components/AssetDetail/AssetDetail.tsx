import React, { Suspense } from 'react';
import _ from 'lodash';
import AssetGeometry from './AssetGeometry';
import { useAppConfiguration } from '@hazmapper/hooks';
import AssetRenderer from './AssetRenderer';
import AssetButton from './AssetButton';
import {
  FeatureTypeNullable,
  Feature,
  getFeatureType,
  FeatureType,
} from '@hazmapper/types';
import { FeatureIcon } from '@hazmapper/components/FeatureIcon';
import { Button, LoadingSpinner } from '@tacc/core-components';
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

  const featureType: FeatureType = getFeatureType(selectedFeature);

  return (
    <div className={styles.root}>
      <div className={styles.topSection}>
        <FeatureIcon featureType={featureType as FeatureTypeNullable} />
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
            <AssetRenderer
              selectedFeature={selectedFeature}
              featureSource={featureSource}
            />
          </div>
          <AssetButton
            selectedFeature={selectedFeature}
            featureSource={featureSource}
            isPublicView={isPublicView}
          />
        </Suspense>
      </div>
      {featureType !== FeatureType.Questionnaire && (
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
                  (() => {
                    /* Function check that shows the "There are no metadata properties" 
                  in any of these cases:
                  - The properties object is empty or null
                  - The properties object only contains keys that start with "_hazmapper"
                  - The properties object exists but has no properties*/
                    const filteredProperties = Object.entries(
                      selectedFeature.properties
                    )
                      .filter(([key]) => !key.startsWith('_hazmapper'))
                      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
                    return filteredProperties.length > 0 ? (
                      filteredProperties.map(([propKey, propValue]) => (
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
                    );
                  })()
                ) : (
                  <tr>
                    <td colSpan={2}>There are no metadata properties.</td>
                  </tr>
                )}
              </tbody>
            </table>
            <AssetGeometry selectedFeature={selectedFeature} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetail;
