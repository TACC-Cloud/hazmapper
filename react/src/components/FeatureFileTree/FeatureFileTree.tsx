import React, { useMemo, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolderClosed,
  faFolderOpen,
} from '@fortawesome/free-solid-svg-icons';
import { useResizeDetector } from 'react-resize-detector';
import { Button } from '@tacc/core-components';
import { featureCollectionToFileNodeArray } from '@hazmapper/utils/featureTreeUtils';
import { FeatureCollection, FeatureFileNode } from '@hazmapper/types';
import { useDeleteFeature } from '@hazmapper/hooks';
import { FeatureIcon } from '@hazmapper/components/FeatureIcon';
import styles from './FeatureFileTree.module.css';

/* interface for combining antd tree node and our tree data */
interface TreeDataNode extends DataNode {
  title?: string;
  key: string;
  children?: TreeDataNode[];
  featureNode: FeatureFileNode;
}
interface FeatureFileTreeProps {
  /**
   * Features of map
   */
  featureCollection: FeatureCollection;

  /**
   * Whether or not the map project is public.
   */
  isPublic: boolean;

  /**
   * active project id
   */
  projectId: number;
}

/*
 * A tree of feature files that correspond to the map's features
 */
const FeatureFileTree: React.FC<FeatureFileTreeProps> = ({
  featureCollection,
  isPublic,
  projectId,
}) => {
  const { mutate: deleteFeature, isLoading } = useDeleteFeature();
  const location = useLocation();
  const navigate = useNavigate();

  const { height, ref } = useResizeDetector();

  const [expanded, setExpanded] = useState<string[]>([]);

  const searchParams = new URLSearchParams(location.search);
  const selectedFeature = searchParams.get('selectedFeature');

  const treeData = useMemo(() => {
    const fileNodeArray = featureCollectionToFileNodeArray(featureCollection);

    const getDirectoryNodeIds = (nodes: FeatureFileNode[]): string[] => {
      const directoryIds: string[] = [];
      const stack = [...nodes];

      while (stack.length > 0) {
        const node = stack.pop();
        if (node && node.isDirectory) {
          directoryIds.push(node.nodeId);
          if (node.children) {
            stack.push(...node.children);
          }
        }
      }

      return directoryIds;
    };

    const expandedDirectories = getDirectoryNodeIds(fileNodeArray);
    // Have all direcotories be in 'expanded' (i.e. everything is expanded)
    setExpanded(expandedDirectories);

    const convertToTreeNode = (node: FeatureFileNode) => ({
      title: node.name,
      key: node.nodeId,
      isLeaf: !node.isDirectory,
      children: node.children?.map(convertToTreeNode),
      featureNode: node,
    });

    // Convert features into Antd's DataNode (i.e. TreeDataNode) and our internal class FeatureFileNode
    return fileNodeArray.map(convertToTreeNode);
  }, [featureCollection]);

  const handleDelete = useCallback(
    (nodeId: string) => (e: React.MouseEvent) => {
      e.stopPropagation();
      const featureId = parseInt(nodeId, 10);

      if (isNaN(featureId)) {
        console.error('Invalid feature ID:', nodeId);
        return;
      }

      // Only proceed with deletion if projectId is valid
      if (projectId > 0) {
        deleteFeature({
          projectId,
          featureId,
        });
      }
    },
    [projectId, deleteFeature]
  );

  const titleRender = useCallback(
    (node: TreeDataNode) => {
      const featureNode = node.featureNode as FeatureFileNode;
      const isSelected =
        selectedFeature === node.key && !featureNode.isDirectory;
      const isExpanded = expanded.includes(node.key);

      const toggleNode = () => {
        if (featureNode.isDirectory) {
          // Toggle expanded state
          const newExpanded = expanded.includes(node.key)
            ? expanded.filter((k) => k !== node.key)
            : [...expanded, node.key];
          setExpanded(newExpanded);
        } else {
          const newSearchParams = new URLSearchParams(searchParams);
          if (selectedFeature === node.key || node.key.startsWith('DIR_')) {
            newSearchParams.delete('selectedFeature');
          } else {
            newSearchParams.set('selectedFeature', node.key);
          }
          navigate({ search: newSearchParams.toString() }, { replace: true });
        }
      };

      // Add click handler for directory nodes
      const handleClick = (e: React.MouseEvent) => {
        toggleNode();
        e.preventDefault();
      };

      const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          toggleNode();
          e.preventDefault();
        }
      };

      return (
        <div
          className={styles.treeNode}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          data-testid={`tree-node-${featureNode.nodeId}`}
        >
          {featureNode.isDirectory ? (
            <FontAwesomeIcon
              icon={isExpanded ? faFolderOpen : faFolderClosed}
              size="sm"
            />
          ) : (
            <FeatureIcon featureType={featureNode.featureType} />
          )}
          <span className={styles.fileName}>{featureNode.name}</span>
          {!isPublic && isSelected && (
            <Button
              size="small"
              type="primary"
              iconNameBefore="trash"
              isLoading={isLoading}
              onClick={(e) => handleDelete(featureNode.nodeId)(e)}
              dataTestid="delete-feature-button"
            />
          )}
        </div>
      );
    },
    [expanded, setExpanded, selectedFeature, isPublic, isLoading, handleDelete]
  );

  return (
    <div ref={ref} className={styles.root}>
      <Tree
        className={styles.featureFileTree}
        treeData={treeData}
        expandedKeys={expanded}
        selectedKeys={selectedFeature ? [selectedFeature] : []}
        height={height}
        titleRender={titleRender}
        showIcon={false}
        switcherIcon={null}
        virtual
        blockNode /* make whole row clickable */
      />
    </div>
  );
};

export default React.memo(FeatureFileTree);
