import {Injectable} from '@angular/core';
import { ApiService} from 'ng-tapis';
import {RemoteFile} from 'ng-tapis';

@Injectable({
  providedIn: 'root'
})
export class TapisFilesService {
  public readonly IMPORTABLE_FEATURE_ASSET_TYPES: Array<string> = ['jpeg', 'jpg', 'png', 'mp4', 'mov', 'mpeg4', 'webm'];
  public readonly IMPORTABLE_FEATURE_TYPES: Array<string> = ['shp', 'jpg', 'json', 'geojson', 'gpx'];
  public readonly IMPORTABLE_POINT_CLOUD_TYPES: Array<string> = ['las', 'laz'];
  public readonly IMPORTABLE_OVERLAY_TYPES: Array<string> = ['jpg'];

  constructor(private tapis: ApiService) { }

  public getFileExtension(file: RemoteFile): string {
    return file.name.split('.').pop().toLowerCase();
  }

  listFiles(system: string, path: string, offset: number, limit: number ) {
    return this.tapis.filesList({systemId: system, filePath: path, offset, limit});
  }

  public getParentPath(path: string): string {
    const cleaned = path.replace('//', '/');
    const arr = cleaned.split('/');
    arr.pop();
    const parentPath = arr.join('/');
    return parentPath;
  }



}
