import { SectionMessage } from '@tacc/core-components';
import styles from './EmptyTablePlaceholder.module.css';
import React from 'react';

interface EmptyPlaceholderProps {
  children?: React.ReactNode;
  type: 'error' | 'warning' | 'info' | 'success';
}

export const EmptyTablePlaceholder: React.FC<EmptyPlaceholderProps> = ({
  children,
  type,
}) => {
  return (
    <div className={styles['empty']}>
      {children ? (
        <SectionMessage type={type}>{children}</SectionMessage>
      ) : (
        <SectionMessage type={type}>No data available.</SectionMessage>
      )}
    </div>
  );
};

export default EmptyTablePlaceholder;
