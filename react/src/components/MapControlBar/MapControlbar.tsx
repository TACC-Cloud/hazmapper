import React, { useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLock } from '@fortawesome/free-solid-svg-icons';

import { LoadingSpinner } from '@tacc/core-components';

import { Typography, Button, Tooltip, Flex } from 'antd';

const { Text } = Typography;

import {
  useDesignSafeProject,
  useProjectUsers,
  useMapMousePosition,
  useAuthenticatedUser,
  useCurrentFeatures,
  useAppConfiguration,
} from '@hazmapper/hooks';
import { Project } from '@hazmapper/types';
import * as ROUTES from '@hazmapper/constants/routes';

import styles from './MapControlbar.module.css';

const CoordinatesDisplay = () => {
  const { position } = useMapMousePosition();
  if (!position) return null;

  return (
    <div className={styles.coordinatesDisplay}>
      <Text>
        Lat: {position.lat.toFixed(4)} Lon: {position.lng.toFixed(4)}
      </Text>
    </div>
  );
};

interface Props {
  /**
   * Active project (info for Taggit link).
   */
  activeProject: Project;

  /**
   * Whether or not the map project is a public view.
   */
  isPublicView: boolean;
}

/**
 * A horizontal control bar on top
 */
const MapControlbar: React.FC<Props> = ({ activeProject, isPublicView }) => {
  const navigate = useNavigate();
  const { username, hasValidTapisToken } = useAuthenticatedUser();

  const { data: activeProjectUsers } = useProjectUsers({
    projectId: activeProject?.id ?? -1, // Provide a dummy fallback value
    options: {
      // Only fetch users when viewing a public map, user is authenticated, and
      // there is an active project - this determines if we need to check list of users
      // to see if current user can switch to private view
      enabled: Boolean(isPublicView && hasValidTapisToken && activeProject?.id),
    },
  });

  const designSafeProjectUUID = useMemo(() => {
    return activeProject?.system_id?.startsWith('project-')
      ? activeProject.system_id.split('project-')[1]
      : '';
  }, [activeProject?.system_id]);

  const { data: designSafeProject } = useDesignSafeProject({
    designSafeProjectUUID: designSafeProjectUUID,
    options: {
      // Only fetch DS project when there is an associated one and when user is authenticated
      enabled: Boolean(hasValidTapisToken && designSafeProjectUUID),
    },
  });

  const { isFetching: isFeaturesLoading, isError: isFeaturesError } =
    useCurrentFeatures();

  const mapPrefix = isPublicView ? 'Public Map' : 'Map';

  /* for public maps, check if user is logged in and in the activeProjectUsers list */
  const canSwitchToPrivateMap =
    isPublicView &&
    hasValidTapisToken &&
    activeProjectUsers?.find((u) => u.username === username)
      ? true
      : false;

  const config = useAppConfiguration();

  const navigateToCorrespondingTaggitGallery = () => {
    // We set some info in local storage for Taggit and then navigate to Taggit

    // key for local storage is backend-specific
    const lastProjectKeyword = `${config.geoapiEnv}LastProject`;

    // note that entire project gets stringified but only `id` is used by taggit
    localStorage.setItem(lastProjectKeyword, JSON.stringify(project));
    window.open(config.taggitUrl, '_blank', 'noreferrer noopener');
  };

  return (
    <div className={styles.root}>
      {!isPublicView && (
        <Button
          className={styles.homeArrow}
          onClick={() => navigate(ROUTES.MAIN)}
          type="link"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </Button>
      )}
      <div className={styles.infoContainer}>
        <Text ellipsis>
          {mapPrefix}: {activeProject?.name}
        </Text>
        {designSafeProject && (
          <Text ellipsis>
            Project: {designSafeProject.value.projectId} |{' '}
            {designSafeProject.value.title}
          </Text>
        )}
        {canSwitchToPrivateMap && (
          <Tooltip title="View private map">
            <Button
              onClick={() => {
                const { pathname, search } = window.location;
                const newPath = pathname.replace(
                  '/project-public/',
                  '/project/'
                );
                navigate(`${newPath}${search}`);
              }}
              type="link"
              title="View private map"
            >
              <FontAwesomeIcon icon={faLock} />
            </Button>
          </Tooltip>
        )}
        {isFeaturesLoading && (
          <div className={styles.loadingData}>
            <LoadingSpinner placement="inline" />
            <span>Loading Data</span>
          </div>
        )}
        {isFeaturesError && (
          <div className={styles.loadingDataError}>
            <span>Error Loading Data</span>
          </div>
        )}
      </div>
      <Flex justify="center" gap="small">
        <Button className={styles.taggitButton}
          data-testid="taggit-button"
          type="primary"
          onClick={() => navigateToCorrespondingTaggitGallery()}
        >
          View Project in Taggit
        </Button>
      </Flex>
      <CoordinatesDisplay />
    </div>
  );
};

export default MapControlbar;
