import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './MapProjectNavBar.module.css';
import { QueryNavItem } from '../../core-wrappers';
import { queryPanelKey, Panel } from '../../utils/panels';

interface NavItem {
  label: string;
  icon_image: string;
  panel: Panel;
  showWhenPublic: boolean;
}

interface NavBarPanelProps {
  items?: NavItem[];
  isPublic?: boolean;
}

const MapProjectNavBar: React.FC<NavBarPanelProps> = ({
  items = [],
  isPublic = false,
}) => {
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const activePanel = queryParams.get(queryPanelKey);

  console.log(items);
  console.log(isPublic);

  return (
    <div className={styles.root}>
      <QueryNavItem
        icon="applications" /* TODO_REACT*/
        to={
          activePanel == Panel.Assets ? '' : `?${queryPanelKey}=${Panel.Assets}`
        }
        active={activePanel == Panel.Assets}
      >
        Assets
      </QueryNavItem>
      <QueryNavItem
        icon="upload" /* TODO_REACT*/
        to={
          activePanel == Panel.PointClouds
            ? ''
            : `?${queryPanelKey}=${Panel.PointClouds}`
        }
        active={activePanel == Panel.PointClouds}
      >
        Point Clouds
      </QueryNavItem>
      <QueryNavItem
        icon="burger" /* TODO_REACT*/
        to={
          activePanel == Panel.Layers ? '' : `?${queryPanelKey}=${Panel.Layers}`
        }
        active={activePanel == Panel.Layers}
      >
        Layers
      </QueryNavItem>
      <QueryNavItem
        icon="search" /* TODO_REACT*/
        to={
          activePanel == Panel.Filters
            ? ''
            : `?${queryPanelKey}=${Panel.Filters}`
        }
        active={activePanel == Panel.Filters}
      >
        Filters
      </QueryNavItem>
      <QueryNavItem
        icon="reverse-order" /* TODO_REACT*/
        to={
          activePanel == Panel.Streetview
            ? ''
            : `?${queryPanelKey}=${Panel.Streetview}`
        }
        active={activePanel == Panel.Streetview}
      >
        Streetview
      </QueryNavItem>
      <QueryNavItem
        icon="project" /* TODO_REACT*/
        to={
          activePanel == Panel.Manage ? '' : `?${queryPanelKey}=${Panel.Manage}`
        }
        active={activePanel == Panel.Manage}
      >
        Manage
      </QueryNavItem>
    </div>
  );
};

export default MapProjectNavBar;
