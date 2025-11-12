import React from 'react';
import { Typography, Tooltip } from 'antd';
import { useAppConfiguration } from '@hazmapper/hooks/';

const { Text } = Typography;

/**
 * Truncate middle of string with ellipsis
 */
const truncateMiddle = (str: string, maxLength: number = 30): string => {
  if (str.length <= maxLength) return str;
  const charsToShow = maxLength - 3; // Reserve 3 chars for '...'
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return (
    str.substring(0, frontChars) + '...' + str.substring(str.length - backChars)
  );
};

/**
 * Clickable link to DesignSafe with truncated display
 */
export const DesignSafeFileLink: React.FC<{
  system: string | null;
  path: string | null;
  truncate?: boolean;
}> = ({ system, path, truncate = true }) => {
  const { designsafePortalUrl } = useAppConfiguration();

  const hasPath = Boolean(system && path);

  const getDesignSafeUrl = (
    system: string | null,
    path: string | null
  ): string | null => {
    if (!system || !path) return null;
    if (system.startsWith('project-')) {
      const projectUUid = system.split('project-')[1];
      return `${designsafePortalUrl}/data/browser/projects/${projectUUid}${path}`;
    } else {
      return `${designsafePortalUrl}/data/browser/tapis/${system}${path}`;
    }
  };

  if (!hasPath) {
    return (
      <Text type="secondary" style={{ fontSize: '11px' }}>
        N/A
      </Text>
    );
  }

  const dsUrl = getDesignSafeUrl(system, path);
  const fullPath = `${system}${path}`;
  const displayPath = truncate ? truncateMiddle(fullPath, 40) : fullPath;

  if (!dsUrl) {
    return (
      <Tooltip title={fullPath}>
        <Text code style={{ fontSize: '11px' }}>
          {displayPath}
        </Text>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={`Open in DesignSafe`}>
      <a
        href={dsUrl}
        target="_blank"
        rel="noreferrer"
        style={{ fontSize: '11px', fontFamily: 'monospace' }}
      >
        {displayPath}
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
    <a href={url} target="_blank" rel="noreferrer">
      Feature {featureId}
    </a>
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
      <a
        href={url}
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
      </a>
    </Tooltip>
  );
};
