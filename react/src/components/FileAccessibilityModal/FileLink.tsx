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
