import React, { useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLock } from '@fortawesome/free-solid-svg-icons';

import { Button, LoadingSpinner } from '@tacc/core-components';

import {
  useDesignSafeProject,
  useProjectUsers,
  useMapMousePosition,
  useAuthenticatedUser,
  useCurrentFeatures,
} from '@hazmapper/hooks';
import { Project } from '@hazmapper/types';
import * as ROUTES from '@hazmapper/constants/routes';

import styles from './MapControlbar.module.css';

const CoordinatesDisplay = () => {
  const { position } = useMapMousePosition();
  if (!position) return null;

  return (
    <div className={styles.coordinatesDisplay}>
      <span> Lat: </span>
      <span>{position.lat.toFixed(4)}</span>
      <span> Lon: </span>
      <span>{position.lng.toFixed(4)}</span>
    </div>
  );
};

interface Props {
  /**
   * Active project
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
  const { data: authenticatedUser } = useAuthenticatedUser();

  const { data: activeProjectUsers } = useProjectUsers({
    projectId: activeProject?.id ?? -1, // Provide a dummy fallback value
    options: {
      // Only fetch users when viewing a public map, user is authenticated, and
      // there is an active project - this determines if we need to check list of users
      // to see if current user can switch to private view
      enabled: Boolean(isPublicView && authenticatedUser && activeProject?.id),
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
      // Only fetch users when user is authenticated
      enabled: Boolean(authenticatedUser && designSafeProjectUUID),
    },
  });

  const {
    isLatestQueryPending: isFeaturesLoading,
    isLatestQueryError: isFeaturesError,
  } = useCurrentFeatures();

  const mapPrefix = isPublicView ? 'Public Map' : 'Map';

  /* for public maps, check if user is logged in and in the activeProjectUsers list */
  const canSwitchToPrivateMap =
    isPublicView &&
    authenticatedUser &&
    activeProjectUsers?.find((u) => u.username === authenticatedUser.username)
      ? true
      : false;

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
        <span className={styles.projectName}>
          {mapPrefix}: {activeProject?.name}
        </span>
        {designSafeProject && (
          <span className={styles.designSafeInfo}>
            Project: {designSafeProject.value.projectId} |{' '}
            {designSafeProject.value.title}
          </span>
        )}
        {canSwitchToPrivateMap && (
          // TODO_REACT: Add tooltip "View private map" to this button
          <Button
            onClick={() => {
              const { pathname, search } = window.location;
              const newPath = pathname.replace('/project-public/', '/project/');
              navigate(`${newPath}${search}`);
            }}
            type="link"
          >
            <FontAwesomeIcon icon={faLock} />
          </Button>
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
      <CoordinatesDisplay />
    </div>
  );
};

export default MapControlbar;
