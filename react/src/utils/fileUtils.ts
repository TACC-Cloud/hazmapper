import { FileData } from 'chonky';
import { TapisFilePath, File } from '@hazmapper/types';

export const serializeToChonkyFile = (
  file: File,
  allowedFileExtensions: string[]
): FileData => ({
  id: file.path,
  name: file.name,
  size: file.size,
  modDate: file.lastModified,
  isDir: file.type === 'dir',
  ext:
    file.type !== 'dir' && file.name.lastIndexOf('.') > 0
      ? file.name.substring(file.name.lastIndexOf('.') + 1)
      : undefined,
  icon: file.type === 'dir' ? 'folder' : 'file',
  selectable:
    file.type === 'dir' ||
    allowedFileExtensions.includes(file.name.split('.').pop() || ''),
});

export const convertFilesToTapisPaths = (files: File[]): TapisFilePath[] => {
  return files.map((file) => {
    // Remove the "tapis://" prefix
    const urlWithoutPrefix = file.url.replace('tapis://', '');

    // Split the remaining string at the first forward slash
    // The first part will be the system, everything after is the path
    const firstSlashIndex = urlWithoutPrefix.indexOf('/');
    const system = urlWithoutPrefix.substring(0, firstSlashIndex);
    const path = urlWithoutPrefix.substring(firstSlashIndex);

    return {
      system,
      path,
    };
  });
};
