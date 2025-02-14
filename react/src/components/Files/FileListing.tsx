import React, { ReactNode, useCallback, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
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
import { Flex } from 'antd';
import { Icon } from '@tacc/core-components';
import { Spinner } from '@hazmapper/common_components';
import { SystemSelect } from '../Systems';
import styles from './FileListing.module.css';
import {
  useAuthenticatedUser,
  useGetSystems,
  useFiles,
  TransformedGetSystemsResponse,
} from '@hazmapper/hooks';
import { File, TTapisSystem } from '@hazmapper/types';
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
    isLoading: isSystemsLoading,
    data: systemsData = {} as TransformedGetSystemsResponse,
    isFetched: isSystemsFetched,
  } = useGetSystems();
  const { systems, myDataSystem, communityDataSystem, publishedDataSystem } =
    systemsData;

  const { data: user } = useAuthenticatedUser();

  const [chonkyFiles, setChonkyFiles] = React.useState<any>([]);
  const [folderChain, setFolderChain] = React.useState<any>([]);
  const [path, setPath] = React.useState<string>('');
  const [selectedSystem, setSelectedSystem] = React.useState<TTapisSystem>(
    myDataSystem as TTapisSystem
  );
  const [hasError, setHasError] = React.useState(false);

  const { data: files, refetch } = useFiles({
    system: selectedSystem?.id || '',
    path:
      path || (selectedSystem?.id === myDataSystem?.id ? user?.username : ''),
    offset: '0',
    limit: '100' /* TODO https://tacc-main.atlassian.net/browse/WG-418 */,
    enabled: !!selectedSystem?.id,
  });

  const methods = useForm();
  const { watch } = methods;

  const selectedSystemId = watch('system');

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
  }, [
    files,
    folderChain.length,
    user?.username,
    allowedFileExtensions,
    hasError,
  ]);

  const FileListingIcon = (props: any) => <Icon name={props.icon} />;

  useEffect(() => {
    setHasError(false);
    setChonkyFiles(new Array(8).fill(null));
    setFolderChain([null]);

    const sys = systems.find((sys) => sys.id === selectedSystemId);

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
  }, [selectedSystemId]);

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
        const newSelectedFiles =
          files?.filter(
            (f) => filePaths.includes(f.path) && f.type !== 'dir'
          ) || [];

        onFileSelect?.(newSelectedFiles); // P
      }
    },
    [files, onFileSelect, onFolderSelect]
  );

  const unexpectedProblemWithSystems =
    !systems.length && !isSystemsLoading && isSystemsFetched;

  if (unexpectedProblemWithSystems) {
    /* not an expected case */
    return (
      <div className={`${styles['file-browser']}`}>
        <Flex align="center" justify="center" style={{ height: '100%' }}>
          Error: No systems available.
        </Flex>
      </div>
    );
  }

  if (isSystemsLoading || !isSystemsFetched) {
    return (
      <Flex className={`${styles['file-browser']}`}>
        <Spinner />
      </Flex>
    );
  }

  return (
    <>
      <div className={`${styles['system-select-wrapper']}`}>
        <FormProvider {...methods}>
          <form>
            <SystemSelect
              className={`${styles['system-select']}`}
              showPublicSystems={showPublicSystems}
            />
          </form>
        </FormProvider>
      </div>
      <div className={`${styles['file-browser']}`}>
        {hasError ? (
          <Flex align="center" justify="center" style={{ height: '100%' }}>
            There was an error loading the system.
          </Flex>
        ) : (
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
        )}
      </div>
    </>
  );
};
