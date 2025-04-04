import React, { useEffect, useRef, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';

import {
  FeatureTypeNullable,
  Feature,
  getFeatureType,
  FeatureType,
} from '@hazmapper/types';
import { FeatureIcon } from '@hazmapper/components/FeatureIcon';
import { Layout, Button, Spin, Flex } from 'antd';
import { RollbackOutlined } from '@ant-design/icons';
import styles from './MapillaryViewer.module.css';
import { shortDisplayText } from '@hazmapper/utils/featureUtils';
import {
  useMapillaryUserConnection,
  useMapillaryViewer,
} from '@hazmapper/hooks/streetview';

import * as Mapillary from 'mapillary-js';
import 'mapillary-js/dist/mapillary.css';

const { Content, Header } = Layout;

type MapillaryViewerProps = {
  onClose: () => void;
  feature: Feature;
};

const MapillaryViewer: React.FC<MapillaryViewerProps> = ({
  onClose,
  feature,
}) => {
  const [isLoadingViewer, setIsLoadingViewer] = useState(true);
  const { data: mapillaryConnection } = useMapillaryUserConnection();

  const mapillaryToken = mapillaryConnection?.token;

  const viewerRef = useRef<Mapillary.Viewer | null>(null);
  const viewerContainerRef = useRef<HTMLDivElement | null>(null);
  const { height } = useResizeDetector({ targetRef: viewerContainerRef });

  const featureType: FeatureType = getFeatureType(feature);
  const displayName = shortDisplayText(feature);

  const { imageId, setCurrentPosition } = useMapillaryViewer();

  const mapillaryFirstImageId = feature.assets[0].original_name;

  // Initialize viewer only once, when container is ready
  useEffect(() => {
    if (
      height &&
      height > 0 &&
      viewerContainerRef.current &&
      mapillaryToken &&
      mapillaryFirstImageId &&
      !viewerRef.current
    ) {
      viewerRef.current = new Mapillary.Viewer({
        accessToken: mapillaryToken,
        container: viewerContainerRef.current,
        component: {
          cover: true,
        },
      });

      viewerRef.current.on('image', (newImageEvent) => {
        if (isLoadingViewer) {
          // at least first image successfully loaded; can turn of spinner
          setIsLoadingViewer(false);
        }

        // Get the position from each image event and update our context (to be used by map)
        if (newImageEvent && newImageEvent.image) {
          const latLng = newImageEvent.image.lngLat;
          if (latLng) {
            // Note: Mapillary returns [lng, lat] but our context (and Leaflet) expects [lat, lng]
            setCurrentPosition([latLng.lat, latLng.lng]);
          }
        }
      });

      console.log('moving to image', { mapillaryFirstImageId });
      // Explicitly move to image after instantiation
      viewerRef.current.moveTo(mapillaryFirstImageId).catch((err) => {
        console.warn('Failed to move to image:', err);
      });
    }

    return () => {
      viewerRef.current?.remove();
      viewerRef.current = null;
    };
  }, [height, mapillaryToken, mapillaryFirstImageId, setIsLoadingViewer]);

  // Update viewer when imageId changes (if viewer already exists)
  useEffect(() => {
    if (viewerRef.current && imageId) {
      viewerRef.current.moveTo(imageId).catch((err) => {
        console.warn('Failed to move viewer to image:', err);
      });
    }
  }, [imageId]);

  return (
    <div className={styles.root}>
      <Header className={styles.header}>
        <Flex align="center" justify="space-between" style={{ width: '100%' }}>
          <FeatureIcon featureType={featureType as FeatureTypeNullable} />
          <div style={{ flex: 1, textAlign: 'center', fontSize: 'large' }}>
            {displayName}
          </div>
          <Button type="primary" icon={<RollbackOutlined />} onClick={onClose}>
            Close viewer
          </Button>
        </Flex>
      </Header>
      <Content>
        {isLoadingViewer && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spin size="large" />
          </div>
        )}
        <div ref={viewerContainerRef} className={styles.viewerContainer} />
      </Content>
    </div>
  );
};

export default MapillaryViewer;
