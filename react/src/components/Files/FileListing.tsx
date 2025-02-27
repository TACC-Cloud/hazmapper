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
import { debounce } from 'lodash';

const DEFAULT_NO_FILE_EXTENSIONS: string[] = [];
const DEFAULT_FILE_LIMIT = 50;

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
  onSystemSelect?: (system: string) => void;
  allowedFileExtensions?: string[];
}

export const FileListing: React.FC<FileListingProps> = ({
  disableSelection,
  showPublicSystems = true,
  onFileSelect,
  onFolderSelect,
  onSystemSelect,
  allowedFileExtensions = DEFAULT_NO_FILE_EXTENSIONS,
}) => {
  const {
    isLoading: isSystemsLoading,
    data: systemsData = {} as TransformedGetSystemsResponse,
    isFetched: isSystemsFetched,
  } = useGetSystems();
  const {
    systems = [],
    myDataSystem,
    communityDataSystem,
    publishedDataSystem,
  } = systemsData;

  const { data: user } = useAuthenticatedUser();

  const [chonkyFiles, setChonkyFiles] = React.useState<any>(
    new Array(8).fill(null)
  );
  const [folderChain, setFolderChain] = React.useState<any>([]);
  const [selectedSystem, setSelectedSystem] = React.useState<TTapisSystem>(
    myDataSystem as TTapisSystem
  );
  const [hasError, setHasError] = React.useState(false);
  const [loadingMoreFiles, setLoadingMoreFiles] = React.useState(false);
  const [hasMoreFiles, setHasMoreFiles] = React.useState(false);
  const [listingState, setListingState] = React.useState({
    path: '',
    offset: 0,
  });

  const { data: files, refetch } = useFiles({
    system: selectedSystem?.id || '',
    path:
      listingState.path ||
      (selectedSystem?.id === myDataSystem?.id ? user?.username : ''),
    offset: listingState.offset.toString(),
    limit: DEFAULT_FILE_LIMIT.toString(),
    enabled: !!selectedSystem?.id,
  });

  const methods = useForm();
  const { watch } = methods;

  const selectedSystemId = watch('system');

  const setRootFolderChain = (sys = selectedSystem) => {
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

    setFolderChain([{ id: rootFolderName, name: rootFolderName, isDir: true }]);
  };

  useEffect(() => {
    if (selectedSystem?.id) {
      refetch();
    }
  }, [selectedSystem, listingState, refetch]);

  useEffect(() => {
    if (files) {
      setLoadingMoreFiles(false);
      const fileListWrapper = document.querySelector('.chonky-fileListWrapper');

      if (!fileListWrapper) return;

      const dynamicListContainer = fileListWrapper.querySelector(
        '[class^="listContainer-"]'
      );

      if (!dynamicListContainer) return;

      const handleScroll = debounce(() => {
        if (!hasMoreFiles) return;
        const { scrollTop, scrollHeight, clientHeight } = dynamicListContainer;
        if (scrollTop + clientHeight >= scrollHeight - 20) {
          setLoadingMoreFiles(true);
          setListingState((prev) => ({
            ...prev,
            offset: prev.offset + DEFAULT_FILE_LIMIT,
          }));
        }
      }, 250);

      dynamicListContainer.addEventListener('scroll', handleScroll);
      return () =>
        dynamicListContainer.removeEventListener('scroll', handleScroll);
    }
  }, [files, hasMoreFiles]);

  useEffect(() => {
    if (files) {
      if (files.length < DEFAULT_FILE_LIMIT || files.length === 0) {
        setHasMoreFiles(false);
      } else {
        setHasMoreFiles(true);
      }

      setChonkyFiles((prevFiles) => {
        const filteredPrevFiles = prevFiles.filter(Boolean); // Filter out nulls
        const newChonkyFiles = files.map((file) =>
          serializeToChonkyFile(file, allowedFileExtensions)
        );

        if (
          JSON.stringify(prevFiles) ===
          JSON.stringify([...prevFiles, ...newChonkyFiles])
        ) {
          setHasMoreFiles(false);
          return prevFiles;
        }

        return listingState.offset === 0
          ? newChonkyFiles
          : [...filteredPrevFiles, ...newChonkyFiles];
      });
    }
    if (!folderChain.length && user?.username) {
      setRootFolderChain();
    }
  }, [files, folderChain.length, user?.username, allowedFileExtensions]);

  const FileListingIcon = (props: any) => <Icon name={props.icon} />;

  useEffect(() => {
    if (!selectedSystemId || selectedSystem.id === selectedSystemId) {
      return;
    }

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

    setListingState({
      path: rootFolder,
      offset: 0,
    });

    onSystemSelect?.(sys.id);
    onFolderSelect?.(rootFolder);
    setRootFolderChain(sys);
  }, [selectedSystemId]);

  const handleFileAction = useCallback(
    (data: ChonkyFileActionData) => {
      if (data.id === ChonkyActions.OpenFiles.id) {
        const file: FileData = data.payload.targetFile as FileData;

        if (file.isDir) {
          setListingState({
            path: file.id,
            offset: 0,
          });
          setFolderChain((prev) => {
            const index = prev.findIndex((folder) => folder.id === file.id);
            return index === -1 ? [...prev, file] : prev.slice(0, index + 1);
          });

          onFolderSelect?.(file.id);
        } else {
          if (!file.selectable) return;
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

        onFileSelect?.(newSelectedFiles);
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
            defaultSortActionId={null}
          >
            <FileNavbar />
            <FileList data-testid="file-list" />
            {loadingMoreFiles && (
              <p style={{ textAlign: 'center' }}>Loading...</p>
            )}
          </_FileBrowser>
        )}
      </div>
    </>
  );
};
