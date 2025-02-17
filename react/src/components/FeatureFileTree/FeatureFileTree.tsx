import React, { useCallback, useState, useEffect } from 'react';
import { Tree, Flex, Spin } from 'antd';
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
import { useDeleteFeature, useFeatureSelection } from '@hazmapper/hooks';
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
  isPublicView: boolean;

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
  isPublicView,
  projectId,
}) => {
  const { mutate: deleteFeature, isPending } = useDeleteFeature();
  const { selectedFeatureId, setSelectedFeatureId } = useFeatureSelection();

  const { height, ref } = useResizeDetector();

  const [expanded, setExpanded] = useState<string[]>([]);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);

  useEffect(() => {
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

    // Have all directories be in 'expanded' (i.e. everything is expanded)
    const expandedDirectories = getDirectoryNodeIds(fileNodeArray);

    const convertToTreeNode = (node: FeatureFileNode) => ({
      title: node.name,
      key: node.nodeId,
      isLeaf: !node.isDirectory,
      children: node.children?.map(convertToTreeNode),
      featureNode: node,
    });

    // Convert features into Antd's DataNode (i.e. TreeDataNode) and our internal class FeatureFileNode
    setTreeData(fileNodeArray.map(convertToTreeNode));
    setExpanded(expandedDirectories);
  }, [featureCollection]);

  const handleExpand = (newExpandedKeys) => {
    setExpanded(newExpandedKeys);
  };

  const handleDelete = useCallback(
    (nodeId: string) => (e: React.MouseEvent) => {
      e.stopPropagation();
      const featureId = parseInt(nodeId, 10);

      if (isNaN(featureId)) {
        console.error('Invalid feature ID:', nodeId);
        return;
      }

      // Only proceed with deletion if projectId is valid
      deleteFeature({
        projectId,
        featureId,
      });
    },
    [projectId, deleteFeature]
  );

  const titleRender = (node: TreeDataNode) => {
    const featureNode = node.featureNode as FeatureFileNode;
    const isSelected =
      !featureNode.isDirectory && selectedFeatureId === Number(node.key);
    const isExpanded = expanded.includes(node.key);

    const toggleNode = (e: React.MouseEvent | React.KeyboardEvent) => {
      if (featureNode.isDirectory) {
        e.stopPropagation();

        // Toggle expanded state
        const newExpanded = expanded.includes(node.key)
          ? expanded.filter((k) => k !== node.key)
          : [...expanded, node.key];
        setExpanded(newExpanded);
      } else {
        e.stopPropagation();

        setSelectedFeatureId(Number(node.key));
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        toggleNode(e);
      }
    };

    return (
      <div
        className={styles.treeNode}
        onClick={toggleNode}
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
        {!isPublicView && isSelected && (
          <Button
            size="small"
            type="primary"
            iconNameBefore="trash"
            isLoading={isPending}
            onClick={(e) => handleDelete(featureNode.nodeId)(e)}
            dataTestid="delete-feature-button"
          />
        )}
      </div>
    );
  };

  if (!treeData.length)
    return (
      <Flex justify="center" align="center" flex={1}>
        <Spin />
      </Flex>
    );

  return (
    <div className={styles.root} ref={ref}>
      <Tree
        className={styles.featureFileTree}
        treeData={treeData}
        expandedKeys={expanded}
        selectable={false}
        height={height}
        titleRender={titleRender}
        showIcon={false}
        switcherIcon={null}
        onExpand={handleExpand}
        blockNode /* make whole row clickable */
        virtual
      />
    </div>
  );
};

export default FeatureFileTree;
