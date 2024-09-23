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
 - consider separte task for getting sytem (and systme display name) added to feature-asset


 */

import React, { useMemo } from 'react';
import { useTable, useExpanded, Column } from 'react-table';

import Icon from '../../core-components/Icon';

import { featureCollectionToFileNodeArray } from '../../utils/featureTreeUtils';

import { FeatureCollection, FeatureFileNode } from '../../types';
import styles from './FeatureFileTree.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderClosed, faFolderOpen } from '@fortawesome/free-solid-svg-icons'


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
              <FontAwesomeIcon
                icon={row.isExpanded ? faFolderOpen : faFolderClosed}
                size="sm"
              />
            ) : (
              <Icon name="file" size="sm" />
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
