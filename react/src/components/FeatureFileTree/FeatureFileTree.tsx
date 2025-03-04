import React, { useCallback, useState, useEffect, useMemo } from 'react';
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
import { FeatureFileNode } from '@hazmapper/types';
import {
  useCurrentFeatures,
  useDeleteFeature,
  useFeatureSelection,
} from '@hazmapper/hooks';
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
  isPublicView,
  projectId,
}) => {
  const { mutate: deleteFeature, isPending } = useDeleteFeature();
  const { data: featureCollection } = useCurrentFeatures();
  const { selectedFeatureId, setSelectedFeatureId } = useFeatureSelection();

  const { height: rawHeight, ref } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 50, // Small debounce to avoid initial extreme values seen on comonent remount
  });

  // More restrictive bounds check
  const height =
    rawHeight && rawHeight > 50 && rawHeight < 3000 ? rawHeight : 500;

  const [expanded, setExpanded] = useState<string[]>([]);

  // Memoize the expensive tree data computation
  const { treeData, expandedDirectories } = useMemo(() => {
    // Early return if no data
    if (
      !featureCollection ||
      !featureCollection.features ||
      featureCollection.features.length === 0
    ) {
      return { treeData: [], expandedDirectories: [] };
    }

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

    const convertToTreeNode = (node: FeatureFileNode) => ({
      title: node.name,
      key: node.nodeId,
      isLeaf: !node.isDirectory,
      children: node.children?.map(convertToTreeNode),
      featureNode: node,
    });

    return {
      // Convert features into Antd's DataNode (i.e. TreeDataNode) and our internal class FeatureFileNode
      treeData: fileNodeArray.map(convertToTreeNode),
      // Have all directories be in 'expanded' (i.e. everything is expanded)
      expandedDirectories: getDirectoryNodeIds(fileNodeArray),
    };
  }, [featureCollection]);

  // Set initial expanded state
  useEffect(() => {
    setExpanded(expandedDirectories);
  }, [expandedDirectories]);

  const handleExpand = useCallback((newExpandedKeys) => {
    setExpanded(newExpandedKeys);
  }, []);

  const handleDelete = useCallback(
    (nodeId: string) => {
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

  interface NodeTitleProps {
    node: TreeDataNode;
    isSelected: boolean;
    isExpanded: boolean;
    onDelete: (nodeId: string) => void;
    isPublicView: boolean;
    isPending: boolean;
    onSelect: (id: number) => void;
    onToggleExpand: (key: string) => void;
  }

  const NodeTitle = React.memo(
    function NodeTitle({
      node,
      isSelected,
      isExpanded,
      onDelete,
      isPublicView,
      isPending,
      onSelect,
      onToggleExpand,
    }: NodeTitleProps) {
      const featureNode = node.featureNode;

      const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation();
        if (!featureNode.isDirectory) {
          onSelect(Number(node.key));
        } else {
          onToggleExpand(node.key);
        }
      };

      const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e);
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
          {!isPublicView && isSelected && (
            <Button
              size="small"
              type="primary"
              iconNameBefore="trash"
              isLoading={isPending}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(featureNode.nodeId);
              }}
              dataTestid="delete-feature-button"
            />
          )}
        </div>
      );
    },
    (prevProps, nextProps) => {
      return (
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.isExpanded === nextProps.isExpanded &&
        prevProps.isPending === nextProps.isPending &&
        prevProps.isPublicView === nextProps.isPublicView
      );
    }
  );

  const onSelect = useCallback(
    (id: number) => {
      if (id !== selectedFeatureId) {
        setSelectedFeatureId(id);
      }
    },
    [selectedFeatureId, setSelectedFeatureId]
  );

  const onToggleExpand = useCallback(
    (key: string) => {
      const newExpanded = expanded.includes(key)
        ? expanded.filter((k) => k !== key)
        : [...expanded, key];
      setExpanded(newExpanded);
    },
    [expanded]
  );

  const titleRender = useCallback(
    (node: TreeDataNode) => {
      /* eslint-disable react/prop-types */
      const featureNode: FeatureFileNode = node.featureNode;
      const isSelected =
        !featureNode.isDirectory && selectedFeatureId === Number(node.key);
      const isExpanded = expanded.includes(node.key);
      /* eslint-enable react/prop-types */

      return (
        <NodeTitle
          node={node}
          isSelected={isSelected}
          isExpanded={isExpanded}
          onDelete={handleDelete}
          isPublicView={isPublicView}
          isPending={isPending}
          onSelect={onSelect}
          onToggleExpand={onToggleExpand}
        />
      );
    },
    [
      selectedFeatureId,
      expanded,
      NodeTitle,
      handleDelete,
      isPublicView,
      isPending,
      onSelect,
      onToggleExpand,
    ]
  );

  // Show loading state during tree processing
  if (
    featureCollection === undefined ||
    (!treeData.length && featureCollection.features.length !== 0)
  ) {
    return (
      <Flex justify="center" align="center" flex={1}>
        <Spin />
      </Flex>
    );
  }
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
