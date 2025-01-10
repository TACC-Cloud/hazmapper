import React from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLock } from '@fortawesome/free-solid-svg-icons';

import { Button, LoadingSpinner } from '@tacc/core-components';

import {
  useProject,
  useProjectsWithDesignSafeInformation,
  useProjectUsers,
  useFeatureLoadingState,
  useMapMousePosition,
  useAuthenticatedUser,
} from '@hazmapper/hooks';
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
   * Whether or not the map project is a public view.
   */
  isPublicView: boolean;
}

/**
 * A horizontal control bar on top
 */
const MapControlbar: React.FC<Props> = ({ isPublicView }) => {
  const navigate = useNavigate();
  const { projectUUID } = useParams();

  const { data: authenticatedUser } = useAuthenticatedUser();

  const {
    data: activeProject,
    isLoading: isActiveProjectLoading,
    error: isLoadingActiveProjectError,
  } = useProject({
    projectUUID,
    isPublicView,
    options: { enabled: !!projectUUID },
  });
  const { data: activeProjectUsers } = activeProject?.id
    ? useProjectUsers({
        projectId: activeProject.id,
        options: {
          enabled: isPublicView && authenticatedUser && !!activeProject?.id,
        },
      })
    : { data: null };

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

  if (isActiveProjectLoading) {
    return (
      <div className={styles.root}>
        <LoadingSpinner placement="inline" />
      </div>
    );
  }

  if (isLoadingActiveProjectError) {
    return <div className={styles.root}>Unable to access this map</div>;
  }

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
      <span>Project: TODO</span>
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
