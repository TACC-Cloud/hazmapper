import { FileData } from 'chonky';
import { File } from '../types';

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
