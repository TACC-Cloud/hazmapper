import { files as FilesList } from '../../__fixtures__/fileFixture';
import { ChonkyFileActionData, FileData } from 'chonky';
import { File } from '../../types/file';
import { FileBrowser, FileNavbar, FileList, ChonkyActions } from 'chonky';
import React, { useCallback, useEffect, useState } from 'react';
import { Icon } from '../../core-components';
import { SystemSelect } from '../Systems';
import styles from './FileListing.module.css';

const serializeToChonkyFile = (file: File): FileData => {
  return {
    id: file.path,
    name: file.name,
    size: file.length,
    modDate: file.lastModified,
    isDir: file.type === 'dir',
    ext: file.type !== 'dir' ? file.name.split('.').pop() : undefined,
    icon: file.type === 'dir' ? 'folder' : 'file',
  };
};

export const FileListing: React.FC<{
  disableSelection: boolean;
  onDirectoryChange?: (directoy: string) => void;
  onFileSelect?: (files: File[]) => void;
}> = ({ disableSelection, onDirectoryChange, onFileSelect }) => {
  const [chonkyFiles, setChonkyFiles] = React.useState<any>([]);
  const [folderChain, setFolderChain] = React.useState<any>([]);
  const [selectedSystem, setSelectedSystem] = useState(
    'designsafe.storage.default'
  );
  const [tapisFiles, setTapisFiles] = React.useState<File[]>([]);

  useEffect(() => {
    const files = [...FilesList];
    setTapisFiles(files);
  }, [selectedSystem]);

  useEffect(() => {
    setChonkyFiles(
      tapisFiles.map((file) => {
        return serializeToChonkyFile(file);
      })
    );

    setFolderChain([{ id: 'user', name: 'User', isDir: true }]);
  }, [tapisFiles]);

  const FileListingIcon = (props: any) => {
    return <Icon name={props.icon} />;
  };

  const useFileActionHandler = () => {
    return useCallback(
      (data: ChonkyFileActionData) => {
        if (data.id === ChonkyActions.OpenFiles.id) {
          const file: FileData = data.payload.targetFile as FileData;

          if (file.isDir) {
            // Update the breadcrumbs
            setFolderChain((prev) => {
              const index = prev.findIndex((folder) => folder.id === file.id);

              if (index === -1) {
                return [...prev, file];
              } else {
                return prev.slice(0, index + 1);
              }
            });

            // Update the file listing
            setChonkyFiles(
              tapisFiles
                .filter((f) => f.path.startsWith(file.id + '/')) // will be removed when we have proper file listing
                .map((file) => {
                  return serializeToChonkyFile(file);
                })
            );

            // Dispatch the directory change event
            if (onDirectoryChange) {
              onDirectoryChange(file.id);
            }
          }
        } else if (data.id === ChonkyActions.ChangeSelection.id) {
          if (onFileSelect) {
            const selectedFiles = Array.from(data.payload.selection)
              .map((selection) =>
                tapisFiles.find((f: File) => f.path === selection)
              )
              .filter((f) => f !== undefined) as File[];

            onFileSelect(selectedFiles);
          }
        }
      },
      [chonkyFiles, tapisFiles]
    );
  };

  const handleSelectChange = (system: string) => {
    // Shows the loading skeleton and reset breadcrumbs
    setChonkyFiles(new Array(8).fill(null));
    setFolderChain([null]);
    setSelectedSystem(system);
  };

  const handleFileAction = useFileActionHandler();

  return (
    <>
      <div className={`${styles['system-select-wrapper']}`}>
        <SystemSelect
          className={`${styles['system-select']}`}
          onSystemSelect={handleSelectChange}
        ></SystemSelect>
      </div>
      <div className={`${styles['file-browser']}`}>
        <FileBrowser
          files={chonkyFiles}
          folderChain={folderChain}
          defaultFileViewActionId={ChonkyActions.EnableListView.id}
          disableSelection={disableSelection}
          disableDragAndDropProvider={true}
          clearSelectionOnOutsideClick={true}
          iconComponent={FileListingIcon}
          onFileAction={handleFileAction}
        >
          <FileNavbar />
          <FileList />
        </FileBrowser>
      </div>
    </>
  );
};
