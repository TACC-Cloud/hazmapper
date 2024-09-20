/*
 * A tree of feature files that correspond to the map's features
 */

/*
 TODO
 - style
 -  user fa-folder-open and fa-folder or whatever icon we have

 */

import React, { useMemo, useEffect } from 'react';
import { useTable, useExpanded, Column, Row } from 'react-table';

import Icon from '../../core-components/Icon';

import { FeatureCollection, Feature } from '../../types';
import styles from './FeatureFileTree.module.css';

interface FeatureFileNode {
  id: string;
  name: string;
  isDirectory: boolean;
  subRows?: FeatureFileNode[];
}

function createFeatureFileNode(
  id: string,
  name: string,
  isDirectory: boolean,
  subRows?: FeatureFileNode[]
): FeatureFileNode {
  return { id, name, isDirectory, ...(subRows && { subRows }) };
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
  const nodeMap: { [key: string]: FeatureFileNode } = {};

  const sortedFeatures = featureCollection.features.sort((a, b) => {
    const pathA = getFullPathFromFeature(a);
    const pathB = getFullPathFromFeature(b);
    return pathA.localeCompare(pathB);
  });

  sortedFeatures.forEach((feature) => {
    const nodePath = getFullPathFromFeature(feature);
    const parts = nodePath.split('/');

    let currentPath = '';
    parts.forEach((part, index) => {
      currentPath += (currentPath ? '/' : '') + part;
      const isLast = index === parts.length - 1;

      if (!nodeMap[currentPath]) {
        nodeMap[currentPath] = createFeatureFileNode(
          isLast ? feature.id.toString() : currentPath,
          part,
          !isLast,
          !isLast ? [] : undefined
        );
      }

      // Add to parent node (if not already there)
      const parentPath = currentPath.split('/').slice(0, -1).join('/');
      if (parentPath) {
        const parentNode = nodeMap[parentPath];
        if (parentNode && parentNode.subRows) {
          if (
            !parentNode.subRows.some(
              (node) => node.id === nodeMap[currentPath].id
            )
          ) {
            parentNode.subRows.push(nodeMap[currentPath]);
          }
        }
      }
    });
  });

  // Return only top-level nodes (nodes without a parent)
  return Object.values(nodeMap).filter((node) => {
    const parentPath = node.id.split('/').slice(0, -1).join('/');
    return !nodeMap[parentPath];
  });
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

  console.log(isPublic);

  const columns = useMemo<Column<FeatureFileNode>[]>(
    () => [
      {
        accessor: 'name',
        Cell: ({ row }: any) => (
          <span
            {...row.getToggleRowExpandedProps({
              style: {
                paddingLeft: `${row.depth * 1}rem`,
              },
            })}
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
            {isPublic /* TODO add delete button if not public*/}
          </span>
        ),
      },
    ],
    [isPublic]
  );

  const {
    getTableProps,
    getTableBodyProps,
    rows,
    prepareRow,
    toggleAllRowsExpanded,
  } = useTable<FeatureFileNode>(
    {
      columns,
      data: memoizedData,
      autoResetExpanded: false,
    },
    useExpanded
  );

  // Set all rows to be initially expanded
  useEffect(() => {
    toggleAllRowsExpanded(true);
  }, [toggleAllRowsExpanded]);

  return (
    <table className={styles.featureFileTree} {...getTableProps()}>
      <tbody {...getTableBodyProps()}>
        {rows.map((row: Row<FeatureFileNode>, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()} key={i}>
              {row.cells.map((cell, j) => (
                <td {...cell.getCellProps()} key={`${i}-${j}`}>
                  {cell.render('Cell')}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default React.memo(FeatureFileTree);
