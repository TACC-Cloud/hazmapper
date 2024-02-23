import { Injectable } from '@angular/core';
import { EnvService } from '../services/env.service';
import { ApiService, RemoteFile } from 'ng-tapis';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TapisFilesService {
  public readonly IMPORTABLE_FEATURE_ASSET_TYPES: Array<string> = ['jpeg', 'jpg', 'png', 'mp4', 'mov', 'mpeg4', 'webm'];
  public readonly IMPORTABLE_FEATURE_TYPES: Array<string> = ['shp', 'jpg', 'jpeg', 'json', 'geojson', 'gpx', 'rq'];
  public readonly IMPORTABLE_POINT_CLOUD_TYPES: Array<string> = ['las', 'laz'];
  public readonly IMPORTABLE_OVERLAY_TYPES: Array<string> = ['jpg', 'jpeg'];
  public readonly IMPORTABLE_TILE_TYPES: Array<string> = ['ini'];

  constructor(private tapis: ApiService, private envService: EnvService, private http: HttpClient
    ) {}

  public getFileExtension(file: RemoteFile): string {
    return file.name.split('.').pop().toLowerCase();
  }

  listFiles(system: string, path: string, offset: number, limit: number) {
    return this.http.get<any>(this.envService.tapisUrl + `v3/files/ops/${system}/${path}?offset=${offset}&limit=${limit}`);
  }

  public getParentPath(path: string): string {
    const cleaned = path.replace('//', '/');
    const arr = cleaned.split('/');
    arr.pop();
    const parentPath = arr.join('/');
    return parentPath;
  }
}
