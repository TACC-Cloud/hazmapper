/*
 * A tree of feature files that correspond to the map's features
 */

/*
 TODO
 - style
 -  user fa-folder-open and fa-folder or whatever icon we have

 */

import React, { useMemo, useEffect } from 'react';
import { useTable, useExpanded, Column, HeaderGroup, Row } from 'react-table';

import { FeatureCollection } from '../../types';
import styles from './FeatureFileTree.module.css';

interface FeatureFileNode {
  id: string;
  name: string;
  isDirectory: boolean;
  subRows?: FeatureFileNode[];
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

const processData = (
  featureCollection: FeatureCollection
): FeatureFileNode[] => {
  // TODO convert featureCollection to format for react-table
  console.log(featureCollection);
  const test_data = [
    {
      id: '1',
      name: 'Root',
      isDirectory: true,
      subRows: [
        {
          id: '2',
          name: 'Feature 1',
          isDirectory: true,
          subRows: [
            { id: '3', name: 'Feature_1.geojson', isDirectory: false },
            { id: '4', name: 'Feature_1_metadata.json', isDirectory: false },
          ],
        },
        {
          id: '5',
          name: 'Feature 2',
          isDirectory: true,
          subRows: [
            { id: '6', name: 'Feature_2.geojson', isDirectory: false },
            { id: '7', name: 'Feature_2_metadata.json', isDirectory: false },
          ],
        },
      ],
    },
  ];
  return test_data;
};

/**
 * A tree of feature files that correspond to the map's features
 */
const FeatureFileTree: React.FC<FeatureFileTreeProps> = ({
  featureCollection,
  isPublic,
}) => {
  // Memoize the data processing
  const memoizedData = useMemo(
    () => processData(featureCollection),
    [featureCollection]
  );

  console.log(isPublic);

  const columns = useMemo<Column<FeatureFileNode>[]>(
    () => [
      {
        Header: 'Feature File Structure',
        accessor: 'name',
        Cell: ({ row }: any) => (
          <span
            {...row.getToggleRowExpandedProps({
              style: {
                paddingLeft: `${row.depth * 2}rem`,
              },
            })}
          >
            {row.isExpanded ? '📂' : row.original.isDirectory ? '📁' : '📄'}{' '}
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
    headerGroups,
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
      <thead>
        {headerGroups.map(
          (headerGroup: HeaderGroup<FeatureFileNode>, groupIndex: number) => (
            <tr
              {...headerGroup.getHeaderGroupProps()}
              key={`header-group-${groupIndex}`}
            >
              {headerGroup.headers.map((column, columnIndex) => (
                <th
                  {...column.getHeaderProps()}
                  key={`header-${groupIndex}-${columnIndex}`}
                >
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          )
        )}
      </thead>
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
