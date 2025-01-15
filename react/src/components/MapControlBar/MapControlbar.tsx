import React, { useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLock } from '@fortawesome/free-solid-svg-icons';

import { Button, LoadingSpinner } from '@tacc/core-components';

import {
  useDesignSafeProject,
  useProjectUsers,
  useFeatureLoadingState,
  useMapMousePosition,
  useAuthenticatedUser,
} from '@hazmapper/hooks';
import { Project } from '@hazmapper/types';
import * as ROUTES from '@hazmapper/constants/routes';

import styles from './MapControlbar.module.css';

const CoordinatesDisplay = () => {
  const { position } = useMapMousePosition();
  if (!position) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-white p-2 rounded shadow">
      Lat: {position.lat.toFixed(4)} Lon: {position.lng.toFixed(4)}
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

  const { data: activeProjectUsers } = activeProject?.id
    ? useProjectUsers({
        projectId: activeProject.id,
        options: {
          // Only fetch users when viewing a public map, user is authenticated, and
          // there is an active project - this determines if we need to check list of users
          // to see if current user can switch to private view
          enabled: Boolean(
            isPublicView && authenticatedUser && activeProject?.id
          ),
        },
      })
    : { data: null };

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

  const { isLoading: isFeaturesLoading, isError: isFeaturesError } =
    useFeatureLoadingState();

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
      <span>
        {mapPrefix}: {activeProject?.name}
      </span>
      {designSafeProject && (
        <span>
          Project: {designSafeProject.value.projectId} |{' '}
          {designSafeProject.value.title}
        </span>
      )}

      {canSwitchToPrivateMap && (
        // TODO: Add tooltip "View private map" to this button
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
        <div className={styles.loadingData}>
          <span>Error Loading Data TODO</span>
        </div>
      )}
      <CoordinatesDisplay />
    </div>
  );
};

export default MapControlbar;
