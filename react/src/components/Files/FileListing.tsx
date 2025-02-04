import React, { ReactNode, useCallback, useEffect } from 'react';
import {
  ChonkyFileActionData,
  FileBrowser,
  FileData,
  FileNavbar,
  FileList,
  ChonkyActions,
  FileBrowserProps,
  FileBrowserHandle,
} from 'chonky';
import { Icon } from '@tacc/core-components';
import { SystemSelect } from '../Systems';
import styles from './FileListing.module.css';
import { useAuthenticatedUser, useSystems, useFiles } from '@hazmapper/hooks';
import { File, System } from '@hazmapper/types';
import { serializeToChonkyFile } from '@hazmapper/utils/fileUtils';

const DEFAULT_NO_FILE_EXTENSIONS: string[] = [];

const _FileBrowser = FileBrowser as React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    FileBrowserProps & {
      children?: ReactNode;
    } & React.RefAttributes<FileBrowserHandle>
  >
>;

interface FileListingProps {
  disableSelection: boolean;
  showPublicSystems?: boolean;
  onFileSelect?: (files: File[]) => void;
  onFolderSelect?: (folder: string) => void;
  allowedFileExtensions?: string[];
}

export const FileListing: React.FC<FileListingProps> = ({
  disableSelection,
  showPublicSystems = true,
  onFileSelect,
  onFolderSelect,
  allowedFileExtensions = DEFAULT_NO_FILE_EXTENSIONS,
}) => {
  const {
    data: systems = [],
    myDataSystem,
    communityDataSystem,
    publishedDataSystem,
  } = useSystems();

  const { data: user } = useAuthenticatedUser();

  const [chonkyFiles, setChonkyFiles] = React.useState<any>([]);
  const [folderChain, setFolderChain] = React.useState<any>([]);
  const [path, setPath] = React.useState<string>('');
  const [selectedSystem, setSelectedSystem] = React.useState<System | null>(
    null
  );
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [hasError, setHasError] = React.useState(false);

  const { data: files, refetch } = useFiles({
    system: selectedSystem?.id || '',
    path:
      path || (selectedSystem?.id === myDataSystem?.id ? user?.username : ''),
    offset: '0',
    limit: '100' /* TODO https://tacc-main.atlassian.net/browse/WG-418 */,
    enabled: !!selectedSystem?.id,
  });

  // Automatically select the default system or the first available one
  useEffect(() => {
    if (!selectedSystem && myDataSystem) {
      setSelectedSystem(myDataSystem || systems[0]);
    }
  }, [systems, myDataSystem, selectedSystem]);

  useEffect(() => {
    if (selectedSystem?.id) {
      refetch();
    }
  }, [selectedSystem, path, refetch]);

  useEffect(() => {
    setChonkyFiles(
      files?.map((file) =>
        serializeToChonkyFile(file, allowedFileExtensions)
      ) || []
    );

    if (!folderChain.length && user?.username) {
      setFolderChain([{ id: user.username, name: user.username, isDir: true }]);
    }
  }, [files, folderChain.length, user?.username, allowedFileExtensions]);

  const FileListingIcon = (props: any) => <Icon name={props.icon} />;

  const handleSelectChange = (system: string) => {
    setChonkyFiles(new Array(8).fill(null));
    setFolderChain([null]);

    const sys = systems.find((sys) => sys.id === system);

    if (!sys) {
      setHasError(true);
      return;
    }

    setSelectedSystem(sys);
    const rootFolder = sys.id === myDataSystem?.id ? user?.username : '/';
    setPath(rootFolder);

    onFolderSelect?.(rootFolder);
    let rootFolderName: string;

    if (sys.id === myDataSystem?.id) {
      rootFolderName = 'My Data';
    } else if (sys.id === communityDataSystem?.id) {
      rootFolderName = 'Community Data';
    } else if (sys.id === publishedDataSystem?.id) {
      rootFolderName = 'Published Data';
    } else {
      rootFolderName = 'Project';
    }

    setFolderChain([{ id: rootFolder, name: rootFolderName, isDir: true }]);
  };

  const handleFileAction = useCallback(
    (data: ChonkyFileActionData) => {
      if (data.id === ChonkyActions.OpenFiles.id) {
        const file: FileData = data.payload.targetFile as FileData;

        if (file.isDir) {
          setPath(file.id);
          setFolderChain((prev) => {
            const index = prev.findIndex((folder) => folder.id === file.id);
            return index === -1 ? [...prev, file] : prev.slice(0, index + 1);
          });

          onFolderSelect?.(file.id);
        } else {
          const selectedFile = files?.find((f) => f.path === file.id);
          if (selectedFile) {
            onFileSelect?.([selectedFile]);
          }
        }
      } else if (data.id === ChonkyActions.MouseClickFile.id) {
        const file: FileData = data.payload.file as FileData;

        if (file.isDir) {
          onFolderSelect?.(file.id);
        }
      } else if (data.id === ChonkyActions.ChangeSelection.id) {
        const filePaths = Array.from(data.payload.selection);

        setSelectedFiles(
          files?.filter(
            (f) => filePaths.includes(f.path) && f.type !== 'dir'
          ) || []
        );
        onFileSelect?.(selectedFiles || []);
      }
    },
    [files, onFileSelect, onFolderSelect, selectedFiles]
  );

  if (!systems.length) {
    return <p>No systems available.</p>;
  }

  if (hasError) {
    return <p>There was an error loading the system.</p>;
  }

  return (
    <>
      <div className={`${styles['system-select-wrapper']}`}>
        <SystemSelect
          className={`${styles['system-select']}`}
          showPublicSystems={showPublicSystems}
          onSystemSelect={handleSelectChange}
        />
      </div>
      <div className={`${styles['file-browser']}`}>
        <_FileBrowser
          files={chonkyFiles}
          folderChain={folderChain}
          defaultFileViewActionId={ChonkyActions.EnableListView.id}
          disableSelection={disableSelection}
          disableDragAndDropProvider
          clearSelectionOnOutsideClick
          iconComponent={FileListingIcon}
          onFileAction={handleFileAction}
        >
          <FileNavbar />
          <FileList />
        </_FileBrowser>
      </div>
    </>
  );
};
