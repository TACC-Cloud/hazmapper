import React, { useRef, useState } from 'react';
import { Feature, QuestionnaireAsset } from '@hazmapper/types';
import { Carousel, Space, Flex } from 'antd';
import { Button } from '@tacc/core-components';
import styles from './AssetDetail.module.css';
import type { CarouselRef } from 'antd/es/carousel';

type QuestionnaireProps = {
  feature: Feature;
  featureSource: string;
};

export const AssetQuestionnaire: React.FC<QuestionnaireProps> = ({
  feature,
  featureSource,
}) => {
  const carouselRef = useRef<CarouselRef>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const processAssetImages = (): QuestionnaireAsset[] => {
    if (feature.properties?._hazmapper?.questionnaire?.assets) {
      return feature.properties._hazmapper.questionnaire.assets.map((asset) => {
        const pathToFullImage = `${featureSource}/${asset.filename}`;
        const fileExtension = pathToFullImage.substring(
          pathToFullImage.lastIndexOf('.')
        );
        const pathWithoutExtension = pathToFullImage.substring(
          0,
          pathToFullImage.lastIndexOf('.')
        );
        const pathToPreviewImage = `${pathWithoutExtension}.preview${fileExtension}`;

        return {
          filename: asset.filename,
          coordinates: asset.coordinates,
          path: pathToFullImage,
          previewPath: pathToPreviewImage,
        };
      });
    }
    return [];
  };

  const assetImages = processAssetImages();
  const totalImages = assetImages.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalImages - 1;
  const showNav = totalImages > 1;

  const next = () => {
    carouselRef.current?.next();
  };

  const previous = () => {
    carouselRef.current?.prev();
  };

  const handleChange = (_current: number, next: number) => {
    setCurrentIndex(next);
  };

  if (assetImages.length === 0) {
    return <div>No images available</div>;
  }

  return (
    <div className={styles.questionnaireContainer}>
      <div className={styles.questionnaireCarousel}>
        <Carousel
          ref={carouselRef}
          dots={false}
          draggable={showNav}
          beforeChange={handleChange}
        >
          {assetImages.map((asset, index) => (
            <div key={`${asset.filename}-${index}`}>
              <Flex gap="small" vertical>
                <img
                  className={styles.questionnaireImage}
                  src={asset.previewPath}
                  alt={asset.filename}
                />
                <div className={styles.caption}>{asset.filename}</div>
              </Flex>
            </div>
          ))}
        </Carousel>
      </div>

      {showNav && (
        <div className={styles.questionnaireNav}>
          <Space size="large">
            <Button
              iconNameBefore="push-left"
              onClick={previous}
              disabled={isFirst}
            />
            <Button
              iconNameBefore="push-right"
              onClick={next}
              disabled={isLast}
            />
          </Space>
        </div>
      )}
    </div>
  );
};

export default AssetQuestionnaire;
