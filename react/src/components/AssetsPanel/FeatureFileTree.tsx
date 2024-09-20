/*
 * A tree of feature files that correspond to the map's features
 */

/*
 TODO
 - style
 -  user fa-folder-open and fa-folder or whatever icon we have or chevron
 - add icon for font awesome icon to handle asset icons
 - add hover highlight
 - add select highlight and update query param
 - make sure all expaneded
 - right now its 200px wide but previously 250
 - add test for featureCollectionToFileNodeArray and refactor into util?


 */

import React, { useMemo } from 'react';
import { useTable, useExpanded, Column } from 'react-table';

import Icon from '../../core-components/Icon';

import { FeatureCollection, Feature } from '../../types';
import styles from './FeatureFileTree.module.css';

interface FeatureFileNode {
  id: string;
  name: string;
  isDirectory: boolean;
  children?: FeatureFileNode[];
}

function createFeatureFileNode(
  id: string,
  name: string,
  isDirectory: boolean,
  children?: FeatureFileNode[]
): FeatureFileNode {
  return { id, name, isDirectory, ...(children && { children }) };
}

function getFullPathFromFeature(feature: Feature): string {
  const firstAsset = feature.assets[0];
  if (firstAsset?.display_path) {
    return firstAsset.display_path;
  }
  if (firstAsset) {
    return firstAsset.id.toString();
  }
  return feature.id.toString();
}

/**
 * Convert a feature collection to a tree of file nodes.
 *
 * This returns an array of only top-level nodes (which contain
 * a node for all the features + their parent directories)
 */
function featureCollectionToFileNodeArray(
  featureCollection: FeatureCollection
): FeatureFileNode[] {
  const rootNodes: FeatureFileNode[] = [];
  const nodeMap: { [key: string]: FeatureFileNode } = {};

  // Sort features to ensure consistent order
  const sortedFeatures = featureCollection.features.sort((a, b) =>
    getFullPathFromFeature(a).localeCompare(getFullPathFromFeature(b))
  );

  sortedFeatures.forEach((feature) => {
    const nodePath = getFullPathFromFeature(feature);
    const parts = nodePath.split('/');

    let currentPath = '';
    let currentNode: FeatureFileNode | null = null;

    parts.forEach((part, index) => {
      currentPath += (currentPath ? '/' : '') + part;
      const isLast = index === parts.length - 1;

      if (!nodeMap[currentPath]) {
        const newNode = createFeatureFileNode(
          isLast ? feature.id.toString() : currentPath,
          part,
          !isLast
        );
        nodeMap[currentPath] = newNode;

        if (currentNode) {
          if (!currentNode.children) currentNode.children = [];
          currentNode.children.push(newNode);
        } else {
          rootNodes.push(newNode);
        }
      }

      currentNode = nodeMap[currentPath];
    });
  });

  return rootNodes;
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
}

/**
 * A tree of feature files that correspond to the map's features
 */
const FeatureFileTree: React.FC<FeatureFileTreeProps> = ({
  featureCollection,
  isPublic,
}) => {
  // Memoize the data processing
  const memoizedData = useMemo(
    () => featureCollectionToFileNodeArray(featureCollection),
    [featureCollection]
  );

  const columns = useMemo<Column<FeatureFileNode>[]>(
    () => [
      {
        accessor: 'name',
        Cell: ({ row }: any) => (
          <span
            {...row.getToggleRowExpandedProps()}
            className={styles.treeNode}
            style={{
              /* Create indentation based on the row's depth in the tree.*/
              paddingLeft: `${row.depth * 1}rem`,
            }}
          >
            {row.original.isDirectory ? (
              row.isExpanded ? (
                <Icon name="folder-open" size="small" />
              ) : (
                <Icon name="folder" size="small" />
              )
            ) : (
              <Icon name="file" size="small" />
            )}
            {row.values.name}
            {
              !isPublic && !row.original.isDirectory && (
                <span>todo delete</span>
              ) /* Add delete button or other controls here */
            }
          </span>
        ),
      },
    ],
    [isPublic]
  );

  const { getTableProps, getTableBodyProps, rows, prepareRow } =
    useTable<FeatureFileNode>(
      {
        columns,
        data: memoizedData,
        getSubRows: (row: FeatureFileNode) => row.children,
        initialState: {
          expanded: true, // This will expand all rows by default
        },
        autoResetExpanded: false,
      },
      useExpanded
    );

  return (
    <div className={styles.featureFileTree} {...getTableProps()}>
      <div {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <div {...row.getRowProps()} key={i}>
              {row.cells.map((cell, j) => (
                <div {...cell.getCellProps()} key={`${i}-${j}`}>
                  {cell.render('Cell')}{' '}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(FeatureFileTree);
