import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Tooltip } from 'antd';
import { useAppConfiguration } from '@hazmapper/hooks/';
import { buildDesignSafeLink } from '@hazmapper/utils/designsafe';
import { truncateMiddle } from '@hazmapper/utils/truncateMiddle';

const { Text } = Typography;

/**
 * Clickable link to DesignSafe with truncated display
 */
export const DesignSafeFileLink: React.FC<{
  system: string | null;
  path: string | null;
  designSafeProjectId: string | null;
  truncate?: boolean;
}> = ({ system, path, designSafeProjectId, truncate = true }) => {
  const { designsafePortalUrl } = useAppConfiguration();

  const hasPath = Boolean(system && path);

  if (!hasPath) {
    return (
      <Text type="secondary" style={{ fontSize: '11px' }}>
        N/A
      </Text>
    );
  }

  const { url, displayPath } = buildDesignSafeLink(
    system,
    path,
    designSafeProjectId,
    designsafePortalUrl
  );

  const truncatedDisplayPath = truncate
    ? truncateMiddle(displayPath, 40)
    : displayPath;

  if (!url) {
    return (
      <Tooltip title={`View in DesignSafe: ${displayPath}`}>
        <Text code style={{ fontSize: '11px' }}>
          {truncatedDisplayPath}
        </Text>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={`View in DesignSafe: ${displayPath}`}>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        style={{ fontSize: '11px', fontFamily: 'monospace' }}
      >
        {truncatedDisplayPath}
      </a>
    </Tooltip>
  );
};

/**
 * Link to a map feature
 */
export const FeatureLink: React.FC<{
  featureId: number;
  projectUuid: string;
}> = ({ featureId, projectUuid }) => {
  const url = `/project/${projectUuid}/?panel=Assets&selectedFeature=${featureId}`;
  return (
    <Link to={url} target="_blank" rel="noreferrer">
      Feature {featureId}
    </Link>
  );
};

/**
 * Link to a tile layer (opens Assets panel)
 */
export const LayerLink: React.FC<{
  layerName: string;
  projectUuid: string;
}> = ({ layerName, projectUuid }) => {
  const url = `/project/${projectUuid}/?panel=Assets`;

  return (
    <Tooltip title={layerName}>
      <Link
        to={url}
        target="_blank"
        rel="noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center' }}
      >
        <span>Layer: </span>
        <span
          style={{
            maxWidth: '130px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            direction: 'rtl',
          }}
        >
          <span style={{ direction: 'ltr' }}>{layerName}</span>
        </span>
      </Link>
    </Tooltip>
  );
};
