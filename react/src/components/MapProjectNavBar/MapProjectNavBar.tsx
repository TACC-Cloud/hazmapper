import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './MapProjectNavBar.module.css';
import { QueryNavItem } from '@tacc/core-components';
import { queryPanelKey, Panel } from '@hazmapper/utils/panels';

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
  hideWhenPrivate?: boolean;
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
    imagePath:
      pointCloudImage /* https://tacc-main.atlassian.net/browse/WG-391 */,
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
    showWhenPublic: false,
  },
  {
    label: 'Manage',
    imagePath: manageImage,
    panel: Panel.Manage,
    showWhenPublic: false,
  },
  {
    label: 'Info',
    imagePath: manageImage,
    panel: Panel.Info,
    showWhenPublic: true,
    hideWhenPrivate: true,
  },
];

interface NavBarPanelProps {
  isPublicView: boolean;
}

const MapProjectNavBar: React.FC<NavBarPanelProps> = ({ isPublicView }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const activePanel = queryParams.get(queryPanelKey);

  React.useEffect(() => {
    if (activePanel) {
      const currentPanel = navItems.find((item) => item.panel === activePanel);
      if (
        (currentPanel && !currentPanel.showWhenPublic && isPublicView) ||
        (currentPanel && currentPanel.hideWhenPrivate && !isPublicView)
      ) {
        const updatedParams = new URLSearchParams(location.search);
        updatedParams.delete(queryPanelKey);
        navigate(`${location.pathname}?${updatedParams.toString()}`, {
          replace: true,
        });
      }
    }
  }, [isPublicView, activePanel, location, navigate]);

  return (
    <div className={styles.root}>
      {navItems
        .filter((item) => (isPublicView ? item.showWhenPublic : true))
        .map((item) => {
          const updatedQueryParams = new URLSearchParams(location.search);

          // Prevent navigation if public view and panel not public
          if (isPublicView && !item.showWhenPublic) {
            return null;
          }
          if (!isPublicView && item.hideWhenPrivate == true) {
            return null;
          }

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
              className={styles.navItem}
            >
              <img
                src={item.imagePath}
                alt=""
                className={styles.image}
                aria-hidden="true"
              />
              <span className={styles.label}>{item.label}</span>
            </QueryNavItem>
          );
        })}
    </div>
  );
};

export default MapProjectNavBar;
