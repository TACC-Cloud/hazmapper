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
  designSafeProjectId: string | null;
  truncate?: boolean;
}> = ({ system, path, designSafeProjectId, truncate = true }) => {
  const { designsafePortalUrl } = useAppConfiguration();

  const hasPath = Boolean(system && path);

  const getDesignSafeInfo = (
    system: string | null,
    path: string | null,
    designSafeProjectId: string | null
  ): { url: string | null; displayPath: string } => {
    if (!system || !path) return { url: null, displayPath: '' };

    let url: string | null = null;
    let displayPath: string = '';

    if (designSafeProjectId) {
      if (system === `designsafe.storage.published`) {
        url = `${designsafePortalUrl}/data/browser/public/${path}`;
        displayPath = `${designSafeProjectId}${path}`;
      } else {
        url = `${designsafePortalUrl}/data/browser/projects/${designSafeProjectId}/workdir${path}`;
        displayPath = `${designSafeProjectId}/workdir${path}`;
      }
    } else if (system.startsWith('project-')) {
      const projectUuid = system.split('project-')[1];
      url = `${designsafePortalUrl}/data/browser/projects/${projectUuid}${path}`;
      displayPath = `PRJ-${projectUuid}/workdir${path}`;
    } else if (system == `designsafe.storage.default`) {
      const projectUuid = system.split('project-')[1];
      url = `${designsafePortalUrl}/data/browser/projects/${projectUuid}${path}`;
      displayPath = `My Data${path}`;
    } else {
      url = `${designsafePortalUrl}/data/browser/tapis/${system}${path}`;
      displayPath = `${system}${path}`;
    }

    return { url, displayPath };
  };

  if (!hasPath) {
    return (
      <Text type="secondary" style={{ fontSize: '11px' }}>
        N/A
      </Text>
    );
  }

  const { url, displayPath } = getDesignSafeInfo(
    system,
    path,
    designSafeProjectId
  );

  const truncatedDisplayPath = truncate
    ? truncateMiddle(displayPath, 40)
    : displayPath;

  if (!url) {
    return (
      <Tooltip title={`Open in DesignSafe: ${displayPath}`}>
        <Text code style={{ fontSize: '11px' }}>
          {truncatedDisplayPath}
        </Text>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={`Open in DesignSafe: ${displayPath}`}>
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
