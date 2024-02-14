import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './MapProjectNavBar.module.css';
import { QueryNavItem } from '../../core-wrappers';
import { queryPanelKey, Panel } from '../../utils/panels';

import assetsImage from '../../assets/assets.png';
import pointCloudImage from '../../assets/point-clouds.png';
import layersImage from '../../assets/layers.png';
import filtersImage from '../../assets/filters.png';
import streetviewImage from '../../assets/streetview.png';
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
        .map((item) => (
          <QueryNavItem
            key={item.panel}
            to={
              activePanel === item.panel
                ? ''
                : `?${queryPanelKey}=${item.panel}`
            }
            active={activePanel === item.panel}
          >
            <img
              src={item.imagePath}
              alt={item.label}
              className={styles.image}
              width="32px"
            />
            {/*TODO_REACT do we want to bold the text if active like in CEP-portals?*/}
            {item.label}
          </QueryNavItem>
        ))}
    </div>
  );
};

export default MapProjectNavBar;
