import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@tacc/core-components';
import styles from './QueryNavItem.module.css';

// Alternate nav item with active state set by a prop
export const QueryNavItem: React.FC<
  React.PropsWithChildren<{
    to: string;
    icon?: string;
    end?: boolean;
    active: boolean;
    className?: string;
  }>
> = ({ to, icon, end, className, active, children }) => {
  return (
    <NavLink to={to} end={end} className={`${styles['nav-link']} ${className}`}>
      <div
        className={`${styles['nav-content']} ${
          active ? styles['nav-active'] : ''
        }`}
      >
        {icon && <Icon name={icon} size="xs" className={styles['nav-icon']} />}
        {/* we'll want to set name based on the app */}
        <span className={styles['nav-text']}>{children}</span>
      </div>
    </NavLink>
  );
};