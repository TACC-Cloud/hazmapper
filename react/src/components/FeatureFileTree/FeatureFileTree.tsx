import React, { useMemo, useCallback } from 'react';
import { useTable, useExpanded, Column, CellProps } from 'react-table';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolderClosed,
  faFolderOpen,
} from '@fortawesome/free-solid-svg-icons';

import { Icon, Button } from '@tacc/core-components';
import { featureCollectionToFileNodeArray } from '@hazmapper/utils/featureTreeUtils';
import { FeatureCollection, FeatureFileNode } from '@hazmapper/types';
import { useDeleteFeature } from '@hazmapper/hooks';
import styles from './FeatureFileTree.module.css';

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
  /* TODO
   * use isLoading and isError or add ticket
   * add todos for other todos here
   * refactor so we can't have a -1 project id?  or what would that look like?
   */
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const selectedFeature = searchParams.get('selectedFeature');

  const memoizedData = useMemo(
    () => featureCollectionToFileNodeArray(featureCollection),
    [featureCollection]
  );

  const columns = useMemo<Column<FeatureFileNode>[]>(
    () => [
      {
        accessor: 'name',
        Cell: ({ row }: CellProps<FeatureFileNode>) => (
          <div
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
            <span className={styles.fileName}>{row.original.name}</span>
            {!isPublic && row.id === selectedFeature && (
              <Button
                size="small"
                type="primary"
                iconNameBefore="trash"
                className={styles.deleteButton}
                onClick={handleDelete(row.original.nodeId)}
              />
            )}
          </div>
        ),
      },
    ],
    [isPublic, selectedFeature]
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

  const handleRowClick = (rowId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (selectedFeature === rowId || rowId.startsWith('DIR_')) {
      newSearchParams.delete('selectedFeature');
    } else {
      newSearchParams.set('selectedFeature', rowId);
    }
    navigate({ search: newSearchParams.toString() }, { replace: true });
  };

  return (
    <div className={styles.tableContainer}>
      <table {...getTableProps()} className={styles.featureFileTree}>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            const isSelected = row.original.isDirectory
              ? false
              : selectedFeature === row.id;
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
