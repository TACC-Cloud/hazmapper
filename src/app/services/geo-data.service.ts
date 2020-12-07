import { Injectable } from '@angular/core';
import {HttpClient, HttpEventType} from '@angular/common/http';
import {BehaviorSubject, Observable, ReplaySubject, Subject} from 'rxjs';
import {LatLng} from 'leaflet';
import {FilterService} from './filter.service';
import {AssetFilters, FeatureAsset, IFeatureAsset, IFileImportRequest, IPointCloud, Overlay, TileServer} from '../models/models';
import { Feature, FeatureCollection} from '../models/models';
import { environment } from '../../environments/environment';
import {filter, map, take, toArray} from 'rxjs/operators';
import * as querystring from 'querystring';
import {RemoteFile} from 'ng-tapis';
import {PathTree} from '../models/path-tree';
import {NotificationsService} from './notifications.service';

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
  private _tileServers: BehaviorSubject<any> = new BehaviorSubject<Array<TileServer>>(null);
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

  constructor(private http: HttpClient, private filterService: FilterService, private notificationsService: NotificationsService) {

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

  getFeatures(projectId: number): void {
    const qstring: string = querystring.stringify(this._assetFilters.toJson());
    this.setLoadFeatureData(true);
    this.http.get<FeatureCollection>(environment.apiUrl + `/projects/${projectId}/features/` + '?' + qstring)
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
    this.http.delete(environment.apiUrl + `/projects/${feature.project_id}/features/${feature.id}/`)
      .subscribe( (resp) => {
        this.getFeatures(feature.project_id);
        this.getPointClouds(feature.project_id);
      });
  }

  getPointClouds(projectId: number) {
    this.setLoadPointCloudData(true);
    this.http.get<Array<IPointCloud>>(environment.apiUrl + `/projects/${projectId}/point-cloud/`)
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
    this.http.post(environment.apiUrl + `/projects/${projectId}/point-cloud/`, payload)
      .subscribe( (resp) => {
        this.getPointClouds(projectId);
      }, error => {
        this.notificationsService.showErrorToast('Could not create point cloud!');
      });
  }

  deletePointCloud(pc: IPointCloud): void {
    console.log(pc);
    this.http.delete(environment.apiUrl + `/projects/${pc.project_id}/point-cloud/${pc.id}/`)
      .subscribe( (resp) => {
        this.getPointClouds(pc.project_id);
      });
  }

  addFileToPointCloud(pc: IPointCloud, file: File) {
    const form = new FormData();
    form.append('file', file);
    console.log(pc);
    this.http.post(environment.apiUrl + `/projects/${pc.project_id}/point-cloud/${pc.id}/`, form)
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
    this.http.post(environment.apiUrl + `/projects/${projectId}/point-cloud/${pointCloudId}/import/`, payload)
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
    this.http.post(environment.apiUrl + `/projects/${projectId}/features/files/import/`, payload)
      .subscribe( (resp) => {
        this.notificationsService.showSuccessToast('Import started!');
      }, error => {
        this.notificationsService.showErrorToast('Import failed! Try again?');
      });
  }

  downloadGeoJSON(projectId: number, query: AssetFilters = new AssetFilters()) {
    const qstring: string = querystring.stringify(query.toJson());
    const downloadLink = document.createElement('a');

    this.http.get<FeatureCollection>(environment.apiUrl + `/projects/${projectId}/features/` + '?' + qstring)
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
    this.http.post<Array<Feature>>(environment.apiUrl + `/projects/${projectId}/features/files/`, form,  {
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

  importFeatureAsset(projectId: number, featureId: number, payload: IFileImportRequest): void {
    this.http.post<Feature>(environment.apiUrl + `/projects/${projectId}/features/${featureId}/assets/`, payload)
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

  getOverlays(projectId: number): void {
    this.setLoadOverlayData(true);
    this.http.get(environment.apiUrl + `/projects/${projectId}/overlays/`).subscribe( (ovs: Array<Overlay>) => {
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

    this.http.post(environment.apiUrl + `/projects/${projectId}/overlays/`, payload)
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
    this.http.post(environment.apiUrl + `/projects/${projectId}/overlays/import/`, payload)
      .subscribe( (resp) => {
        this.getOverlays(projectId);
      }, error => {
        this.notificationsService.showErrorToast('Overlay import failed! Try again?');
      });
  }

  deleteOverlay(projectId: number, overlay: Overlay) {
    this.http
      .delete(environment.apiUrl + `/projects/${projectId}/overlays/${overlay.id}/`)
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
      .delete(environment.apiUrl + `/projects/${projectId}/tile-servers/${tileServerId}/`)
      .subscribe((resp) => {
        this.tileServers$.pipe(
          take(1),
          map( (items: Array<TileServer> ) => items.filter( (item: TileServer) => item.id !== tileServerId)),
        ).subscribe( (results) =>  {
          this._tileServers.next(results);
        });
      }, (error => {
        console.log(error);
      }));
  }

  public updateTileServers(projectId: number, newTileServers: Array<TileServer>) {
    let payload = []

    for (let pay of newTileServers) {
      let myPay = {
        id: pay.id.toString(),
        name: pay.name,
        opacity: pay.opacity,
        isActive: pay.isActive.toString(),
        zIndex: pay.zIndex.toString()
      }
      payload.push(myPay);
    }

    this.http.put(environment.apiUrl + `/projects/${projectId}/tile-servers/`, payload)
      .subscribe( (resp) => {
        this.getTileServers(projectId);
      });
  }

  updateTileServer(projectId: number, tileServer: TileServer): void {
    const payload = {
      name: tileServer.name,
      opacity: tileServer.opacity,
      isActive: tileServer.isActive.toString(),
      zIndex: tileServer.zIndex.toString()
    };

    this.http.put(environment.apiUrl + `/projects/${projectId}/tile-servers/${tileServer.id}/`, payload)
      .subscribe( (resp) => {
        this.getTileServers(projectId);
      });
  }

  // TODO: Should be handled in the backend
  public toggleTileServer(id: number) {
    this.tileServers$.pipe(
      take(1)).subscribe( (results) => {
        results.map(tileServer => {
          if (tileServer.id == id) {
            tileServer.isActive = !tileServer.isActive;
          }
        })
        this._tileServers.next(results);
    });
  }

  // Add a tile server (from each server)
  public addTileServer(tileServer: TileServer) {
    this.tileServers$.pipe(take(1)).subscribe(tileServerList => {
      let newTileServerList: Array<TileServer>;
      if (tileServerList) {
        tileServer.zIndex = tileServerList.length;
        newTileServerList = [...tileServerList, tileServer];
      } else {
        tileServer.zIndex = 0;
        newTileServerList = [tileServer];
      }
      this._tileServers.next(newTileServerList);
    })
  }

  getTileServers(projectId: number): void {
    this.http.get(environment.apiUrl + `/projects/${projectId}/tile-servers/`).subscribe( (tsv: Array<TileServer>) => {
      this.tileServers$.pipe(take(1)).subscribe(tileServerList => {
        tsv.sort((a, b) => {
          return a.zIndex - b.zIndex;
        });

        if (tileServerList) {
          for (let i = 0; i < tileServerList.length; i++) {
            tsv[i].showDescription = tileServerList[i].showDescription;
            tsv[i].showInput = false;
            tsv[i].isDraggable = true;
          }
        }
        this._tileServers.next(tsv);
      });

    });
  }

  addTileServerUpload(projectId: number, tileServer: TileServer) {
    this.tileServers$.pipe(take(1)).subscribe(tileServerList => {
      if (tileServerList) {
        tileServer.zIndex = tileServerList.length;
      } else {
        tileServer.zIndex = 0;
      }
    })

    const payload = new FormData();
    // for (tis in tileServer) {
      // payload.append(prop, JSON.stringify(tileServer[prop]));
    // }
    payload.append('name', tileServer.name);
    payload.append('type', tileServer.type);
    payload.append('url', tileServer.url);
    payload.append('attribution', tileServer.attribution);
    payload.append('opacity', tileServer.opacity.toFixed(6));
    payload.append('zIndex', tileServer.zIndex.toString());
    payload.append('maxZoom', tileServer.maxZoom.toFixed(6));
    payload.append('minZoom', tileServer.minZoom.toFixed(6));
    payload.append('isActive', tileServer.isActive.toString());

    this.http.post(environment.apiUrl + `/projects/${projectId}/tile-servers/`, payload)
      .subscribe((resp) => {
        this.getTileServers(projectId);
      });
  }

  getQMS(query: string, queryOptions: any): void {
    const url = "https://qms.nextgis.com/api/v1/geoservices/";
    const request = url +
      "?search=" + query +
      "&type=" + queryOptions['type'] +
      "&ordering=" + queryOptions['order'] +
      queryOptions['ordering'] +
      "&cumulative_status=works";

    this.http.get(request).subscribe((q) => {
      this._qmsSearchResults.next(q);
    });
  }

  getQMSTileServer(projectId: number, id: number) {
    const request = "https://qms.nextgis.com/api/v1/geoservices/" + id;
    this.http.get(request).subscribe((q) => {
      const newServer: TileServer = {
        name: q['name'],
        id: 1,
        type: q['type'],
        url: q['url'],
        attribution: q['desc'],
        default: false,
        zIndex: 1,
        opacity: 0.5,
        maxZoom: q['z_max'],
        minZoom: q['z_min'] ? q['z_min'] : 0,
        isActive: false
      }
      this.addTileServerUpload(projectId, newServer);
      this._qmsServerResult.next(q);
    });
  }

  initializeMaps(projectId: number) {
    const baseOSMObject: TileServer = {
      name: 'Base OSM',
      id: 1,
      type: 'tms',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      default: true,
      zIndex: 0,
      showDescription: false,
      opacity: 1,
      minZoom: 0,
      maxZoom: 19,
      isActive: true
    }

    const satelliteObject: TileServer = {
      name: 'Satellite',
      id: 1,
      type: 'tms',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      default: true,
      showDescription: false,
      opacity: 1,
      zIndex: 1,
      maxZoom: 19,
      minZoom: 0,
      isActive: false
    }
    this.addTileServerUpload(projectId, baseOSMObject);
    this.addTileServerUpload(projectId, satelliteObject);
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

  getDataForProject(projectId): void {
    this.getFeatures(projectId);
    this.getPointClouds(projectId);
    this.getOverlays(projectId);
    this.getTileServers(projectId);
  }

  clearData(): void {
    //this._activeFeature.next(null);
    this._features.next({type: 'FeatureCollection', features: []});
    this._pointClouds.next(null);
    this._overlays.next(null);
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
