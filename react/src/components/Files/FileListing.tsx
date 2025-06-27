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
} from '@aperturerobotics/chonky';
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
  useDesignSafePublishedProjectDetail,
} from '@hazmapper/hooks';
import { File } from '@hazmapper/types';
import { serializeToChonkyFile } from '@hazmapper/utils/fileUtils';
import { debounce } from 'lodash';
import { useQueryClient } from '@tanstack/react-query';

const DEFAULT_NO_FILE_EXTENSIONS: string[] = [];
const DEFAULT_FILE_LIMIT = 500;

const _FileBrowser = FileBrowser as React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    FileBrowserProps & {
      children?: ReactNode;
    } & React.RefAttributes<FileBrowserHandle>
  >
>;

const _FileNavbar = FileNavbar as React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    {
      children?: ReactNode;
    } & React.RefAttributes<FileBrowserHandle>
  >
>;

const _FileList = FileList as React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    {
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
  const { systems = [], myDataSystem, communityDataSystem } = systemsData;

  const { data: user } = useAuthenticatedUser();

  const [chonkyFiles, setChonkyFiles] = React.useState<any>(
    new Array(8).fill(null)
  );
  const [folderChain, setFolderChain] = React.useState<any>([]);
  const [loadingMoreFiles, setLoadingMoreFiles] = React.useState(false);
  const [hasMoreFiles, setHasMoreFiles] = React.useState(false);
  const [listingState, setListingState] = React.useState({
    path: '',
    offset: 0,
  });
  const [isFilesProcessed, setIsFilesProcessed] = React.useState(false);

  const methods = useForm({
    defaultValues: {
      system: myDataSystem?.id || '',
    },
  });
  const { watch } = methods;

  const rawSelectedSystem = watch('system');

  /**
   * Normalize the selected system ID and extract the published project ID if present.
   */
  let selectedSystemId = rawSelectedSystem;
  let publishedPrjId: string | undefined;

  if (
    !!rawSelectedSystem &&
    rawSelectedSystem.startsWith('designsafe.storage.published/PRJ-')
  ) {
    selectedSystemId = 'designsafe.storage.published';
    publishedPrjId = rawSelectedSystem.split('/').pop(); // "PRJ-123"
  }
  const projectDetailResult = useDesignSafePublishedProjectDetail({
    designSafeProjectPRJ: publishedPrjId,
    options: { enabled: !!publishedPrjId },
  });

  const publishedProjectDetail = projectDetailResult?.data;
  const hasResolvedPublishedProject = projectDetailResult?.isSuccess;

  const queryClient = useQueryClient();

  const {
    data: files,
    refetch,
    isError: isFileListingError,
  } = useFiles({
    system: selectedSystemId || '',
    path:
      listingState.path ||
      (selectedSystemId === myDataSystem?.id ? user?.username : ''),
    offset: listingState.offset.toString(),
    limit: DEFAULT_FILE_LIMIT.toString(),
    enabled: false,
  });

  const setRootFolderChain = (rootPath, sys = selectedSystemId) => {
    let rootFolderName: string;

    if (sys === myDataSystem?.id) {
      rootFolderName = 'My Data';
    } else if (sys === communityDataSystem?.id) {
      rootFolderName = 'Community Data';
    } else if (sys === publishedDataSystem?.id) {
      rootFolderName = 'Published Data';
    } else {
      rootFolderName = 'Project';
    }

    setFolderChain([{ id: rootPath, name: rootFolderName, isDir: true }]);
  };

  useEffect(() => {
    if (selectedSystemId && listingState.path) {
      if (!loadingMoreFiles) {
        setChonkyFiles(new Array(8).fill(null));
      }
      setIsFilesProcessed(false);
      queryClient.resetQueries({
        queryKey: ['getFiles'],
      });
      refetch();
    }
  }, [listingState]);

  useEffect(() => {
    if (isFilesProcessed) {
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
  }, [isFilesProcessed]);

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

        if (files.length === 0) {
          return [];
        }

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

      setIsFilesProcessed(true);
    }
    if (!folderChain.length && user?.username) {
      setRootFolderChain(user.username);
    }
  }, [files]);

  /* Handle system change: set initial root folder path when a system is selected.
   *
   * For published-based systems (starting with "designsafe.storage.published/PRJ-"),
   * fetch the path from the backend.
   */
  useEffect(() => {
    if (!selectedSystemId) return;

    // If this is a published project, wait until it's fetched
    if (publishedPrjId && !hasResolvedPublishedProject) return;

    // For most things (i.e. projects or community data), the root folder is /
    let rootFolder = '/';
    const systemId = selectedSystemId;

    // For published projects (i.e. publications) or My Data its slightly different
    if (publishedPrjId) {
      rootFolder = publishedProjectDetail?.tree.basePath ?? '';
    } else if (systemId === myDataSystem?.id) {
      rootFolder = user?.username;
    }

    setListingState({
      path: rootFolder,
      offset: 0,
    });
    onSystemSelect?.(systemId);
    onFolderSelect?.(rootFolder);
    setRootFolderChain(rootFolder, systemId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedSystemId,
    publishedPrjId,
    myDataSystem?.id,
    user?.username,
    publishedProjectDetail,
    hasResolvedPublishedProject,
  ]);

  const FileListingIcon = (props: any) => <Icon name={props.icon} />;

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
          <_FileNavbar />
          {isFileListingError ? (
            <Flex align="center" justify="center" style={{ height: '100%' }}>
              There was an error loading this directory.
            </Flex>
          ) : (
            <_FileList />
          )}
          {loadingMoreFiles && (
            <p style={{ textAlign: 'center' }}>Loading...</p>
          )}
        </_FileBrowser>
      </div>
    </>
  );
};
