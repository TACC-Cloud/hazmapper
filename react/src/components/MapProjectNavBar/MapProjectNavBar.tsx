import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './MapProjectNavBar.module.css';
import { QueryNavItem } from '@tacc/core-components';
import { queryPanelKey, Panel } from '@hazmapper/utils/panels';

import assetsImage from '../../assets/assets.png';
import pointCloudImage from '../../assets/point-clouds.png';
import layersImage from '../../assets/layers.png';
import filtersImage from '../../assets/filters.png';
import streetviewImage from '../../assets/streetview.png';
import taggitImage from '../../assets/taggit.png';
import manageImage from '../../assets/users-solid.png';

interface NavItem {
  label: string;
  imagePath: string;
  panel: Panel;
  showWhenPublic: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Assets',
    imagePath: assetsImage,
    panel: Panel.Assets,
    showWhenPublic: true,
  },
  {
    label: 'Point Clouds',
    imagePath: pointCloudImage,
    panel: Panel.PointClouds,
    showWhenPublic: false,
  },
  {
    label: 'Layers',
    imagePath: layersImage,
    panel: Panel.Layers,
    showWhenPublic: true,
  },
  {
    label: 'Filters',
    imagePath: filtersImage,
    panel: Panel.Filters,
    showWhenPublic: true,
  },
  {
    label: 'Streetview',
    imagePath: streetviewImage,
    panel: Panel.Streetview,
    showWhenPublic: true,
  },
  {
    label: 'Taggit',
    imagePath: taggitImage,
    panel: Panel.Taggit,
    showWhenPublic: true,
  },
  {
    label: 'Manage',
    imagePath: manageImage,
    panel: Panel.Manage,
    showWhenPublic: true,
  },
];

interface NavBarPanelProps {
  isPublic?: boolean;
}

const MapProjectNavBar: React.FC<NavBarPanelProps> = ({ isPublic = false }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activePanel = queryParams.get(queryPanelKey);

  return (
    <div className={styles.root}>
      {navItems
        .filter((item) => (isPublic ? item.showWhenPublic : true))
        .map((item) => {
          const updatedQueryParams = new URLSearchParams(location.search);

          if (activePanel === item.panel) {
            // If already active, we want to remove queryPanel key if user clicks again
            updatedQueryParams.delete(queryPanelKey);
          } else {
            // Set the queryPanelKey to the current item's panel
            updatedQueryParams.set(queryPanelKey, item.panel);
          }

          // Construct the `to` prop with updated query params
          const to = `${location.pathname}?${updatedQueryParams.toString()}`;

          return (
            <QueryNavItem
              key={item.panel}
              to={to}
              active={activePanel === item.panel}
            >
              <img
                src={item.imagePath}
                alt={item.label}
                className={styles.image}
                width="32px"
              />
              {item.label}
            </QueryNavItem>
          );
        })}
    </div>
  );
};

export default MapProjectNavBar;
