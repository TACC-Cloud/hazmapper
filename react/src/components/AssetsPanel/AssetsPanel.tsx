import styles from './AssetsPanel.module.css';

interface Props {
  /**
   * Whether or not the map project is public.
   * @default false
   */
  isPublic?: boolean;
}

/**
 * A component that displays a map project (a map and related data)
 */
const AssetsPanel: React.FC<Props> = ({ isPublic = false }) => {
  return <div className={styles.root}>Assets Panel TODO</div>;
};

export default AssetsPanel;
