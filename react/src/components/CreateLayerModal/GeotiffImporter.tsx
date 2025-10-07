import React from 'react';
import { Flex, Typography, Button, Divider, message } from 'antd';
import { CloudUploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { FileListing } from '../Files';
import { File, TapisFilePath } from '@hazmapper/types';
import { convertFilesToTapisPaths } from '@hazmapper/utils/fileUtils';
import { usePostImportTileServerFiles } from '@hazmapper/hooks';
import { IMPORTABLE_GEO_TIFF_TYPES } from '@hazmapper/utils/fileUtils';

const { Text } = Typography;

type Props = {
  projectId: number;
  onDone: () => void; // called after successful request to import files
};

const GeotiffImporter: React.FC<Props> = ({ projectId, onDone }) => {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const tapisPaths: TapisFilePath[] = React.useMemo(
    () => convertFilesToTapisPaths(selectedFiles),
    [selectedFiles]
  );

  const { mutate: importFiles, isPending } = usePostImportTileServerFiles({
    projectId,
  });

  const handleImport = () => {
    if (!tapisPaths.length) return;
    importFiles(
      { files: tapisPaths },
      {
        onSuccess: () => {
          message.success('Raster import started');
          setSelectedFiles([]);
          onDone();
        },
        onError: (err: unknown) => {
          const msg =
            err instanceof Error ? err.message : 'Failed to import rasters';
          message.error(msg);
        },
      }
    );
  };

  return (
    <Flex vertical gap={12}>
      <Text type="secondary">Select one or more GeoTIFFs.</Text>

      <Flex
        vertical
        style={{
          height: 420,
          border: '1px solid #eee',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <FileListing
          disableSelection={false}
          showPublicSystems={true}
          allowedFileExtensions={IMPORTABLE_GEO_TIFF_TYPES}
          onFileSelect={setSelectedFiles}
        />
      </Flex>

      <Divider style={{ margin: '12px 0' }} />

      <Flex justify="space-between" align="center">
        <Text type="secondary">
          {selectedFiles.length
            ? `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} selected`
            : 'No files selected'}
        </Text>
        <Flex gap={8}>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => setSelectedFiles([])}
            disabled={!selectedFiles.length}
          >
            Clear
          </Button>
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            onClick={handleImport}
            loading={isPending}
            disabled={!selectedFiles.length}
          >
            Import GeoTIFF{selectedFiles.length > 1 ? 's' : ''}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default GeotiffImporter;