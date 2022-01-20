import { Injectable } from '@angular/core';
import {HttpClient, HttpEventType} from '@angular/common/http';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';
import {LatLng} from 'leaflet';
import {FilterService} from './filter.service';
import {AssetFilters, IFileImportRequest, IPointCloud, Overlay, TileServer} from '../models/models';
import { Feature, FeatureCollection} from '../models/models';
import { map, take } from 'rxjs/operators';
import * as querystring from 'querystring';
import {RemoteFile} from 'ng-tapis';
import {PathTree} from '../models/path-tree';
import {NotificationsService} from './notifications.service';
import {EnvService} from '../services/env.service';
import {defaultTileServers} from '../constants/tile-servers';

@Injectable({
  providedIn: 'root'
})
export class GeoDataService {
  // TODO: clean this up and put the observables up here. Also look into Replay/Behavior
  private _features: BehaviorSubject<FeatureCollection> = new BehaviorSubject<FeatureCollection>({type: 'FeatureCollection', features: []});
  private features$: Observable<FeatureCollection> = this._features.asObservable();
  private _activeFeature: BehaviorSubject<Feature> = new BehaviorSubject<Feature>(null);
  private activeFeature$: Observable<Feature> = this._activeFeature.asObservable();
  private _mapMouseLocation: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private mapMouseLocation$ = this._mapMouseLocation.asObservable();
  private _basemap: BehaviorSubject<string> = new BehaviorSubject<string>('roads');
  private basemap$ = this._basemap.asObservable();
  private _overlays: BehaviorSubject<any> = new BehaviorSubject<Array<Overlay>>(null);
  private overlays$: Observable<Array<Overlay>> = this._overlays.asObservable();
  private _activeOverlay: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private activeOverlay$: Observable<Overlay> = this._activeOverlay.asObservable();
  private _selectedOverlays: BehaviorSubject<Array<Overlay>> = new BehaviorSubject<Array<Overlay>>([]);
  public readonly selectedOverlays$: Observable<Array<Overlay>> = this._selectedOverlays.asObservable();
  private _tileServers: BehaviorSubject<any> = new BehaviorSubject<Array<TileServer>>([]);
  private tileServers$: Observable<Array<TileServer>> = this._tileServers.asObservable();
  private _pointClouds: BehaviorSubject<Array<IPointCloud>> = new BehaviorSubject<Array<IPointCloud>>(null);
  private _assetFilters: AssetFilters;
  public readonly pointClouds: Observable<Array<IPointCloud>> = this._pointClouds.asObservable();
  private _featureTree: ReplaySubject<PathTree<Feature>> = new ReplaySubject<PathTree<Feature>>(1);
  public readonly featureTree$: Observable<PathTree<Feature>> = this._featureTree.asObservable();
  private _loadingFeatureData: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingFeatureData: Observable<boolean> = this._loadingFeatureData.asObservable();
  private _loadingPointCloudData: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingPointCloudData: Observable<boolean> = this._loadingPointCloudData.asObservable();
  private _loadingOverlayData: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingOverlayData: Observable<boolean> = this._loadingOverlayData.asObservable();
  private _qmsSearchResults: BehaviorSubject<any> = new BehaviorSubject<Array<any>>(null);
  private qmsSearchResults$: Observable<Array<any>> = this._qmsSearchResults.asObservable();
  private _qmsServerResult: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private qmsServerResult$: Observable<any> = this._qmsServerResult.asObservable();
  private _dirtyTileOptions: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly dirtyTileOptions$: Observable<boolean> = this._dirtyTileOptions.asObservable();

  constructor(private http: HttpClient, private filterService: FilterService,
              private notificationsService: NotificationsService, private envService: EnvService) {
    this.filterService.assetFilter.subscribe( (next) => {
      this._assetFilters = next;
    });
  }

  private addFeatureToTree(tree: PathTree<any>, feature: Feature) {
    let featurePath: string = null;
    if (feature.assets.length) {
      // If the asset was uploaded, there will be no display path
      featurePath = feature.assets[0].display_path || feature.id.toString();
    } else {
      featurePath = feature.id.toString();
    }
    tree.insert(featurePath, feature, null);
  }

  getFeatures(projectId: number, usePublicRoute: boolean = false): void {
    const qstring: string = querystring.stringify(this._assetFilters.toJson());
    const projectRoute = usePublicRoute ? 'public-projects' : 'projects';
    this.setLoadFeatureData(true);
    this.http.get<FeatureCollection>(this.envService.apiUrl + `/${projectRoute}/${projectId}/features/` + '?' + qstring)
      .subscribe( (fc: FeatureCollection) => {
        fc.features = fc.features.map( (feat: Feature) => new Feature(feat));

        // Check if active feature is no longer present (i.e. filtered out, deleted)
        // TODO: this should be a stream/observable like in deleteOverlay;
        const f = this._activeFeature.getValue();
        if (f && !fc.features.some((feat) => feat.id === f.id)) {
          this.activeFeature = null;
        }
        const tree = new PathTree<Feature>('');
        fc.features.forEach( (item) => {
          this.addFeatureToTree(tree, item);
        });
        this._featureTree.next(tree);

        this._features.next(fc);
        this.setLoadFeatureData(false);
      });
  }

  deleteFeature(feature: Feature) {
    this.http.delete(this.envService.apiUrl + `/projects/${feature.project_id}/features/${feature.id}/`)
      .subscribe( (resp) => {
        this.getFeatures(feature.project_id);
        this.getPointClouds(feature.project_id);
      });
  }

  getPointClouds(projectId: number, usePublicRoute: boolean = false) {
    this.setLoadPointCloudData(true);
    const projectRoute = usePublicRoute ? 'public-projects' : 'projects';
    this.http.get<Array<IPointCloud>>(this.envService.apiUrl + `/${projectRoute}/${projectId}/point-cloud/`)
      .subscribe( (resp ) => {
        this.setLoadPointCloudData(false);
        this._pointClouds.next(resp);
      });
  }

  addFeature(feat: Feature): void {
    this.features$.pipe(take(1)).subscribe( (current: FeatureCollection) => {
      current.features.push(feat);
      this._features.next(current);
    });
    this.featureTree$.pipe(take(1)).subscribe( (next) => {
      this.addFeatureToTree(next, feat);
      this._featureTree.next(next);
    });
  }

  addPointCloud(projectId: number, title: string, conversionParams: string): void {
    const payload = {
      description: title,
      conversion_parameters: conversionParams
    };
    this.http.post(this.envService.apiUrl + `/projects/${projectId}/point-cloud/`, payload)
      .subscribe( (resp) => {
        this.getPointClouds(projectId);
      }, error => {
        this.notificationsService.showErrorToast('Could not create point cloud!');
      });
  }

  deletePointCloud(pc: IPointCloud): void {
    console.log(pc);
    this.http.delete(this.envService.apiUrl + `/projects/${pc.project_id}/point-cloud/${pc.id}/`)
      .subscribe( (resp) => {
        this.getPointClouds(pc.project_id);
      });
  }

  addFileToPointCloud(pc: IPointCloud, file: File) {
    const form = new FormData();
    form.append('file', file);
    console.log(pc);
    this.http.post(this.envService.apiUrl + `/projects/${pc.project_id}/point-cloud/${pc.id}/`, form)
      .subscribe( (resp) => {
        this.getPointClouds(pc.project_id);
        this.notificationsService.showSuccessToast('Point cloud file uploaded!');
      }, (error => {
        this.notificationsService.showErrorToast('Could not import point cloud file!');
      }));
  }

  importPointCloudFileFromTapis(projectId: number, pointCloudId: number, files: Array<RemoteFile>): void {
    const tmp = files.map( f => ({system: f.system, path: f.path}));
    const payload = {
      files: tmp
    };
    this.http.post(this.envService.apiUrl + `/projects/${projectId}/point-cloud/${pointCloudId}/import/`, payload)
      .subscribe( (resp) => {
      }, error => {
        // TODO: Add notification / toast
      });
  }

  importFileFromTapis(projectId: number, files: Array<RemoteFile>): void {
    const tmp = files.map( f => ({system: f.system, path: f.path}));
    const payload = {
      files: tmp
    };
    this.http.post(this.envService.apiUrl + `/projects/${projectId}/features/files/import/`, payload)
      .subscribe( (resp) => {
        this.notificationsService.showSuccessToast('Import started!');
      }, error => {
        this.notificationsService.showErrorToast('Import failed! Try again?');
      });
  }

  downloadGeoJSON(projectId: number, query: AssetFilters = new AssetFilters()) {
    const qstring: string = querystring.stringify(query.toJson());
    const downloadLink = document.createElement('a');

    this.http.get<FeatureCollection>(this.envService.apiUrl + `/projects/${projectId}/features/` + '?' + qstring)
      .subscribe( (resp) => {
        const blob = new Blob([JSON.stringify(resp)], {type: 'application/json'});
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.setAttribute('download', 'hazmapper.json');
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      });
  }

  uploadFile(projectId: number, file: File): void {
    const form: FormData = new FormData();
    form.append('file', file, file.name);
    this.http.post<Array<Feature>>(this.envService.apiUrl + `/projects/${projectId}/features/files/`, form,  {
      reportProgress: true,
      observe: 'events'
    }).pipe(map((event) => {
      switch (event.type) {
        case HttpEventType.UploadProgress:
          const progress = Math.round(100 * event.loaded / event.total);
          // TODO: Remove that, but keep it in until kube networking issues resolved.
          console.log(progress);
          return { status: 'progress', message: progress };

        case HttpEventType.Response:
          this.notificationsService.showSuccessToast('Success!');
          const feats = event.body;
          feats.forEach( (feat) => {
            this.addFeature(new Feature(feat));
          });
          break;
        default:
          return `Unhandled event: ${event.type}`;
      }
    })).subscribe();
  }

  addDefaultTileServers(projectId: number): void {
    defaultTileServers.forEach(ts => {
      this.addTileServer(projectId, ts, true);
    });
  }

  importFeatureAsset(projectId: number, featureId: number, payload: IFileImportRequest): void {
    this.http.post<Feature>(this.envService.apiUrl + `/projects/${projectId}/features/${featureId}/assets/`, payload)
      .subscribe( (feature) => {
        // TODO workaround to update activeFeature, this should be done with a subscription like in addFeature()
        const f = this._activeFeature.getValue();
        if (f && f.id === featureId) {
          this._activeFeature.next(new Feature(feature));
          this.getFeatures(projectId);
        }
      }, error => {
        this.notificationsService.showErrorToast(`Error importing ${payload.path}`);
      });
  }

  getOverlays(projectId: number, usePublicRoute: boolean = false): void {
    this.setLoadOverlayData(true);
    const projectRoute = usePublicRoute ? 'public-projects' : 'projects';
    this.http.get(this.envService.apiUrl + `/${projectRoute}/${projectId}/overlays/`).subscribe( (ovs: Array<Overlay>) => {
      this._overlays.next(ovs);
      this.setLoadOverlayData(false);
    });
  }

  addOverlay(projectId: number, file: File, label: string, minLat: number, maxLat: number, minLon: number, maxLon: number) {
    const payload = new FormData();
    payload.append('file', file);
    payload.append('label', label);
    payload.append('minLat', minLat.toFixed(6));
    payload.append('maxLat', maxLat.toFixed(6));
    payload.append('minLon', minLon.toFixed(6));
    payload.append('maxLon', maxLon.toFixed(6));

    this.http.post(this.envService.apiUrl + `/projects/${projectId}/overlays/`, payload)
      .subscribe((resp) => {
        this.getOverlays(projectId);
      });
  }

  importOverlayFileFromTapis(projectId: number, file: RemoteFile, label: string,
                             minLat: number, maxLat: number, minLon: number, maxLon: number): void {
    const payload = {
      label: label,
      system_id: file.system,
      path: file.path,
      minLat: minLat,
      maxLat: maxLat,
      minLon: minLon,
      maxLon: maxLon
    }
    this.http.post(this.envService.apiUrl + `/projects/${projectId}/overlays/import/`, payload)
      .subscribe( (resp) => {
        this.getOverlays(projectId);
      }, error => {
        this.notificationsService.showErrorToast('Overlay import failed! Try again?');
      });
  }

  deleteOverlay(projectId: number, overlay: Overlay) {
    this.http
      .delete(this.envService.apiUrl + `/projects/${projectId}/overlays/${overlay.id}/`)
      .subscribe((resp) => {
        // Update the list of overlays, remove the one deleted
        this.overlays$.pipe(
          take(1),
          map( (items: Array<Overlay> ) => items.filter( (item: Overlay) => item.id !== overlay.id)),
        ).subscribe( (results) =>  {
          this._overlays.next(results);
        });
      }, (error => {
        console.log(error);
      }));
  }

  public selectOverlay(ov: Overlay) {
    this.overlays$.pipe(
      take(1),
      map( (items: Array<Overlay> ) => items.filter( (item: Overlay) => item.isActive))
    ).subscribe( (results) =>  {
      console.log(results);
      this._selectedOverlays.next(results);
    });
  }

  deleteTileServer(projectId: number, tileServerId: number) {
    this.http
      .delete(this.envService.apiUrl + `/projects/${projectId}/tile-servers/${tileServerId}/`)
      .subscribe((resp) => {
        this.tileServers$.pipe(
          take(1),
          map((items: Array<TileServer>) =>
            items.filter((item: TileServer) =>
              item.id !== tileServerId)),
        ).subscribe((results) => {

          if (!Array.isArray(results) || !results.length) {
            // if empty, then we should set dirty flag to false
            // (see https://jira.tacc.utexas.edu/browse/DES-1910 for additional improvement)
            this._dirtyTileOptions.next(false);
          }

          this._tileServers.next(results);
          this.notificationsService.showSuccessToast('Tile layer deleted!');
        });
      }, (error => {
        console.log(error);
        this.notificationsService.showErrorToast('Tile layer could not be deleted!');
      }));
  }

  public updateTileServers(projectId: number, tileServers: Array<TileServer>) {
    this._tileServers.next(tileServers);
    this._dirtyTileOptions.next(true);
  }

  public updateTileServer(projectId: number, tileServer: TileServer): void {
    this.tileServers$.pipe(
      take(1),
      map((tss: Array<TileServer>) =>
        tss.map((ts: TileServer) =>
          ts.id === tileServer.id ? tileServer : ts)),
    ).subscribe((results) =>  {
      this._tileServers.next(results);
      this._dirtyTileOptions.next(true);
    });
  }

  public saveTileServers(projectId: number, tileServers: Array<TileServer>): void {
    this.http.put(this.envService.apiUrl + `/projects/${projectId}/tile-servers/`, tileServers)
      .subscribe( (resp) => {
        this.getTileServers(projectId);
        if (this._dirtyTileOptions.value) {
          this.notificationsService.showSuccessToast('Tile layer options saved!');
        }
      }, (error => {
        if (this._dirtyTileOptions.value) {
          this.notificationsService.showErrorToast('Tile layer options could not be saved!');
        }
      }));
  }

  public toggleTileServer(projectId: number, ts: TileServer) {
    ts.uiOptions.isActive = !ts.uiOptions.isActive;
    this.updateTileServer(projectId, ts);
  }

  getTileServers(projectId: number, usePublicRoute: boolean = false): void {
    const projectRoute = usePublicRoute ? 'public-projects' : 'projects';
    this.http.get(this.envService.apiUrl + `/${projectRoute}/${projectId}/tile-servers/`).subscribe((tsv: Array<TileServer>) => {
      tsv.sort((a, b) => {
        return b.uiOptions.zIndex - a.uiOptions.zIndex;
      });

      this._tileServers.next(tsv);
      this._dirtyTileOptions.next(false);
    });
  }

  /**
   * Add tile server
   *
   * @param quiet if set to true then toasts notifying of creation are skipped
   */
  addTileServer(projectId: number, tileServer: TileServer, quiet: boolean = false) {
    // NOTE: Here to give new layers zIndices without affecting previous order
    this.tileServers$.pipe(take(1)).subscribe(tileServerList => {
      if (tileServerList) {
        // TODO: Figure out a better way to handle ZIndex
        let zIndexMax = -1;
        tileServerList.forEach(ts => {
          ts.uiOptions.zIndex = zIndexMax;
          zIndexMax--;
        });
        this.saveTileServers(projectId, tileServerList);
      }
      tileServer.uiOptions.zIndex = 0;
    });

    this.http.post(this.envService.apiUrl + `/projects/${projectId}/tile-servers/`, tileServer)
      .subscribe((resp) => {
        this.getTileServers(projectId);
        if (!quiet) {
          this.notificationsService.showSuccessToast('Tile server ' + tileServer.name + ' added!');
        }
      }, (error => {
        this.notificationsService.showErrorToast('Could not add tile server!');
      }));
  }

  searchQMS(query: string, queryOptions: any): void {
    const url = "https://qms.nextgis.com/api/v1/geoservices/";
    const request = url +
      "?search=" + query +
      "&type=" + queryOptions['type'] +
      "&ordering=" + queryOptions['order'] +
      queryOptions['ordering'] +
      "&cumulative_status=works";

    this.http.get(request).subscribe((q) => {
      console.log('loaded');
      this._qmsSearchResults.next(q);
    });
  }

  getQMSTileServer(projectId: number, id: number) {
    const request = "https://qms.nextgis.com/api/v1/geoservices/" + id;
    this.http.get(request).subscribe((q) => {
      const newServer: TileServer = {
        name: q['name'],
        type: q['type'],
        url: q['url'],
        attribution: q['desc'],
        tileOptions: {
          maxZoom: q['z_max'] ? q['z_max'] : null,
          minZoom: q['z_min'] ? q['z_min'] : null,
          layers: q['layers'] ? q['layers'] : null,
          params: q['params'] ? q['params'] : null,
          format: q['format'] ? q['format'] : null
        },
        uiOptions: {
          opacity: 0.5,
          isActive: true
        }
      }
      this.addTileServer(projectId, newServer);
      this._qmsServerResult.next(q);
    });
  }

  public get qmsSearchResults(): Observable<Array<any>> {
    return this.qmsSearchResults$;
  }

  public get qmsServerResult(): Observable<any> {
    return this.qmsServerResult$;
  }

  public get overlays(): Observable<Array<Overlay>> {
    return this.overlays$;
  }

  public get dirtyTileOptions(): Observable<boolean> {
    return this.dirtyTileOptions$;
  }

  public get tileServers(): Observable<Array<TileServer>> {
    return this.tileServers$;
  }

  public get features(): Observable<FeatureCollection> {
    return this.features$;
  }

  public get activeFeature() {
    return this.activeFeature$;
  }

  // TODO: This is heinous
  public set activeFeature(f: any) {
    if (f) {
      if (f === this._activeFeature.getValue()) {
        this._activeFeature.next(null);
      } else {
        this._activeFeature.next(f);
      }
    } else {
      this._activeFeature.next(null);
    }
  }

  public get activeOverlay(): Observable<Overlay> {
    return this.activeOverlay$;
  }

  public set activeOverlay(ov) {
    this._activeOverlay.next(ov);
  }


  public get mapMouseLocation(): Observable<LatLng> {
    return this.mapMouseLocation$;
  }

  public set mapMouseLocation(loc) {
    this._mapMouseLocation.next(loc);
  }

  public set basemap(bmap) {
    this._basemap.next(bmap);
  }

  public get basemap(): any {
    return this.basemap$;
  }

  getDataForProject(projectId, publicAccess): void {
    const usePublicRoute = publicAccess !== undefined ? publicAccess : false;
    this.getFeatures(projectId, usePublicRoute);
    this.getPointClouds(projectId, usePublicRoute);
    this.getOverlays(projectId, usePublicRoute);
    this.getTileServers(projectId, usePublicRoute);
  }

  clearData(): void {
    //this._activeFeature.next(null);
    this._features.next({type: 'FeatureCollection', features: []});
    this._pointClouds.next(null);
    this._overlays.next([]);
    this._tileServers.next([]);
  }

  setLoadFeatureData(isLoading: boolean): void {
    this._loadingFeatureData.next(isLoading);
  }

  setLoadPointCloudData(isLoading: boolean): void {
    this._loadingPointCloudData.next(isLoading);
  }

  setLoadOverlayData(isLoading: boolean): void {
    this._loadingOverlayData.next(isLoading);
  }
}
