import React, { Suspense } from 'react';
import _ from 'lodash';
import AssetGeometry from './AssetGeometry';
import { useAppConfiguration } from '@hazmapper/hooks';
import { shortDisplayText } from '@hazmapper/utils/featureUtils';
import AssetRenderer from './AssetRenderer';
import AssetButton from './AssetButton';
import {
  FeatureTypeNullable,
  Feature,
  getFeatureType,
  FeatureType,
} from '@hazmapper/types';
import { useSelectedVectorFeature } from '@hazmapper/context/SelectedVectorFeatureContext';
import { FeatureIcon } from '@hazmapper/components/FeatureIcon';
import { Button, LoadingSpinner } from '@tacc/core-components';
import styles from './AssetDetail.module.css';

type AssetDetailProps = {
  onClose: () => void;
  selectedFeature: Feature;
  isPublicView: boolean;
  onQuestionnaireClick;
};

const AssetDetail: React.FC<AssetDetailProps> = ({
  selectedFeature,
  onClose,
  isPublicView,
  onQuestionnaireClick,
}) => {
  const config = useAppConfiguration();
  const geoapiUrl = config.geoapiUrl;
  const { selectedVectorFeature, setSelectedVectorFeature } =
    useSelectedVectorFeature();

  const handleClose = () => {
    setSelectedVectorFeature(null);
    onClose();
  };

  const featureSource: string =
    geoapiUrl + '/assets/' + selectedFeature?.assets?.[0]?.path;

  const featureType: FeatureType = getFeatureType(selectedFeature);
  const displayName = shortDisplayText(selectedFeature);

  const isVector = featureType === FeatureType.Vector;

  // For a vector feature the "Metadata" table is replaced by the attributes of
  // the specific geometry the user clicked on the map. `null` means nothing has
  // been clicked yet; `{}` means a geometry was clicked but has no attributes —
  // these need different empty-state messages.
  const clickedVectorProperties =
    isVector && selectedVectorFeature?.featureId === selectedFeature.id
      ? selectedVectorFeature.properties
      : null;
  const hasClickedVectorSegment = clickedVectorProperties !== null;

  const metadataTitle = isVector ? 'Selected feature' : 'Metadata';
  let emptyMetadataMessage: string;
  if (!isVector) {
    emptyMetadataMessage = 'There are no metadata properties.';
  } else if (hasClickedVectorSegment) {
    emptyMetadataMessage = 'This feature has no attributes.';
  } else {
    emptyMetadataMessage = 'Click a feature on the map to see its attributes.';
  }

  // Property entries to render in the table: the clicked geometry's attributes
  // for a vector, otherwise the feature's own (non-internal) properties.
  const displayedProperties: [string, unknown][] = isVector
    ? Object.entries(clickedVectorProperties ?? {}).sort(([keyA], [keyB]) =>
        keyA.localeCompare(keyB)
      )
    : Object.entries(selectedFeature?.properties ?? {})
        .filter(([key]) => !key.startsWith('_hazmapper'))
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

  return (
    <div className={styles.root}>
      <div className={styles.topSection}>
        <FeatureIcon featureType={featureType as FeatureTypeNullable} />
        {displayName}
        <Button
          type="link"
          iconNameAfter="close"
          onClick={handleClose}
        ></Button>
      </div>
      <div className={styles.middleSection}>
        <Suspense fallback={<LoadingSpinner />}>
          {featureType == FeatureType.Collection ? (
            <div>Collections of assets not supported</div>
          ) : (
            <>
              <div className={styles.assetContainer}>
                <AssetRenderer
                  isPublicView={isPublicView}
                  selectedFeature={selectedFeature}
                  featureSource={featureSource}
                />
              </div>
              <div className={styles.buttonContainer}>
                <AssetButton
                  selectedFeature={selectedFeature}
                  featureSource={featureSource}
                  isPublicView={isPublicView}
                  onQuestionnaireClick={onQuestionnaireClick}
                />
              </div>
            </>
          )}
        </Suspense>
      </div>
      {featureType !== FeatureType.Questionnaire && (
        <div className={styles.bottomSection}>
          <div className={styles.metadataTable}>
            <table>
              <thead>
                <tr>
                  <th colSpan={2} className="text-center">
                    {metadataTitle}
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedProperties.length > 0 ? (
                  displayedProperties.map(([propKey, propValue]) => (
                    <tr key={propKey}>
                      <td>{_.startCase(propKey)}</td>
                      <td>
                        {propKey.startsWith('description') ? (
                          <code>{String(propValue)}</code>
                        ) : (
                          _.trim(JSON.stringify(propValue), '"')
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2}>{emptyMetadataMessage}</td>
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
