import React, { useMemo, useState } from 'react';
import { useTable, useExpanded, Column } from 'react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolderClosed,
  faFolderOpen,
} from '@fortawesome/free-solid-svg-icons';

import Icon from '../../core-components/Icon';
import { featureCollectionToFileNodeArray } from '../../utils/featureTreeUtils';
import { FeatureCollection, FeatureFileNode } from '../../types';
import styles from './FeatureFileTree.module.css';

interface FeatureFileTreeProps {
  featureCollection: FeatureCollection;
  isPublic: boolean;
}

/*
 * A tree of feature files that correspond to the map's features
 */
const FeatureFileTree: React.FC<FeatureFileTreeProps> = ({
  /**
   * Features of map
   */
  featureCollection,
  /**
   * Whether or not the map project is public.
   */
  isPublic,
}) => {
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

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
            {!isPublic && !row.original.isDirectory && <span>todo delete</span>}
          </span>
        ),
      },
    ],
    [isPublic]
  );

  const expandedState = useMemo(() => {
    const expanded: { [key: string]: boolean } = {};
    const expandRow = (row: FeatureFileNode) => {
      expanded[row.nodeId] = true;
      row.children?.forEach(expandRow);
    };
    memoizedData.forEach(expandRow);
    return expanded;
  }, [memoizedData]);

  const { getTableProps, getTableBodyProps, rows, prepareRow } =
    useTable<FeatureFileNode>(
      {
        columns,
        data: memoizedData,
        getSubRows: (row: FeatureFileNode) => row.children,
        getRowId: (row: FeatureFileNode) => row.nodeId,
        initialState: {
          expanded: expandedState,
        },
        autoResetExpanded: true,
      },
      useExpanded
    );

  const handleRowClick = (rowId: string) => {
    setSelectedRowId((prevSelectedRowId) =>
      prevSelectedRowId === rowId ? null : rowId
    );
  };

  return (
    <div className={styles.tableContainer}>
      <table {...getTableProps()} className={styles.featureFileTree}>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            const isSelected = row.original.isDirectory
              ? false
              : selectedRowId === row.id;
            return (
              <tr
                {...row.getRowProps()}
                key={row.id}
                onClick={() => handleRowClick(row.id)}
                tabIndex={0}
              >
                {row.cells.map((cell) => (
                  <td
                    {...cell.getCellProps()}
                    className={`${styles.hoverable} ${
                      isSelected ? styles.selected : ''
                    } `}
                    key={cell.column.id}
                  >
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(FeatureFileTree);
