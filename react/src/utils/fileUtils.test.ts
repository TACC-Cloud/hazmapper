import { File } from '../types';
import { serializeToChonkyFile } from './fileUtils';

describe('serializeToChonkyFile', () => {
  it('should correctly serialize a directory file', () => {
    const file: File = {
      path: 'folder1',
      name: 'folder1',
      size: 10,
      lastModified: '2025-01-01',
      type: 'dir',
      mimeType: 'text/plain',
      nativePermissions: 'rwxrwxrwx',
      url: 'http://example.com/folder',
    };
    const allowedFileExtensions = ['txt', 'jpg'];

    const result = serializeToChonkyFile(file, allowedFileExtensions);

    expect(result).toEqual({
      id: 'folder1',
      name: 'folder1',
      size: 10,
      modDate: '2025-01-01',
      isDir: true,
      ext: undefined,
      icon: 'folder',
      selectable: true,
    });
  });

  it('should correctly serialize a file with an allowed extension', () => {
    const file = {
      path: 'file1.txt',
      name: 'file1.txt',
      size: 10,
      lastModified: '2025-01-01',
      type: 'file',
      mimeType: 'text/plain',
      nativePermissions: 'rwxrwxrwx',
      url: 'http://example.com/file1.txt',
    };
    const allowedFileExtensions = ['txt', 'jpg'];

    const result = serializeToChonkyFile(file, allowedFileExtensions);

    expect(result).toEqual({
      id: 'file1.txt',
      name: 'file1.txt',
      size: 10,
      modDate: '2025-01-01',
      isDir: false,
      ext: 'txt',
      icon: 'file',
      selectable: true,
    });
  });

  it('should correctly serialize a file with a disallowed extension', () => {
    const file = {
      path: 'file2.pdf',
      name: 'file2.pdf',
      size: 10,
      lastModified: '2025-01-02',
      type: 'file',
      mimeType: 'text/plain',
      nativePermissions: 'rwxrwxrwx',
      url: 'http://example.com/file2.pdf',
    };
    const allowedFileExtensions = ['txt', 'jpg'];

    const result = serializeToChonkyFile(file, allowedFileExtensions);

    expect(result).toEqual({
      id: 'file2.pdf',
      name: 'file2.pdf',
      size: 10,
      modDate: '2025-01-02',
      isDir: false,
      ext: 'pdf',
      icon: 'file',
      selectable: false,
    });
  });

  it('should correctly handle a file without an extension', () => {
    const file = {
      path: 'file3',
      name: 'file3',
      size: 10,
      lastModified: '2025-01-03',
      type: 'file',
      mimeType: 'text/plain',
      nativePermissions: 'rwxrwxrwx',
      url: 'http://example.com/file3',
    };
    const allowedFileExtensions = ['txt', 'jpg'];

    const result = serializeToChonkyFile(file, allowedFileExtensions);

    expect(result).toEqual({
      id: 'file3',
      name: 'file3',
      size: 10,
      modDate: '2025-01-03',
      isDir: false,
      ext: undefined,
      icon: 'file',
      selectable: false,
    });
  });
});
