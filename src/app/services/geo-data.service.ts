import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, ReplaySubject, Subject} from 'rxjs';
import {LatLng} from 'leaflet';
import {FilterService} from './filter.service';
import {AssetFilters, FeatureAsset, IFeatureAsset, IPointCloud, Overlay} from '../models/models';
import { Feature, FeatureCollection} from '../models/models';
import { environment } from '../../environments/environment';
import {filter, map, take, toArray} from 'rxjs/operators';
import * as querystring from 'querystring';
import {RemoteFile} from 'ng-tapis';
import {PathTree} from '../models/path-tree';

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
  private _pointClouds: BehaviorSubject<Array<IPointCloud>> = new BehaviorSubject<Array<IPointCloud>>(null);
  private _assetFilters: AssetFilters;
  public readonly pointClouds: Observable<Array<IPointCloud>> = this._pointClouds.asObservable();
  private _featureTree: ReplaySubject<PathTree<Feature>> = new ReplaySubject<PathTree<Feature>>(1);
  public readonly featureTree$: Observable<PathTree<Feature>> = this._featureTree.asObservable();

  constructor(private http: HttpClient, private filterService: FilterService) {

    this.filterService.assetFilter.subscribe( (next) => {
      this._assetFilters = next;
    });
  }

  getFeatures(projectId: number): void {
    const qstring: string = querystring.stringify(this._assetFilters.toJson());
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
          let featurePath: string = null;
          if (item.assets.length) {
            // If the asset was uploaded, there will be no display path
            featurePath = item.assets[0].display_path || item.id.toString();
          } else {
            featurePath = item.id.toString();
          }
          console.log(featurePath);
          tree.insert(featurePath, item, null);
        });
        this._featureTree.next(tree);

        this._features.next(fc);
      });
  }

  deleteFeature(feature: Feature) {
    this.http.delete(environment.apiUrl + `/projects/${feature.project_id}/features/${feature.id}/`)
      .subscribe( (resp) => {
        this.getFeatures(feature.project_id);
      });
  }

  getPointClouds(projectId: number) {
    this.http.get<Array<IPointCloud>>(environment.apiUrl + `/projects/${projectId}/point-cloud/`)
      .subscribe( (resp ) => {
        this._pointClouds.next(resp);
      });
  }

  addFeature(feat: Feature): void {
    this.features$.pipe(take(1)).subscribe( (current: FeatureCollection) => {
      current.features.push(feat);
      this._features.next(current);
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
        // TODO: notification
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
        console.log(resp);
      });
  }

  importFileFromTapis(projectId: number, files: Array<RemoteFile>): void {

    const tmp = files.map( f => ({system: f.system, path: f.path}));
    const payload = {
      files: tmp
    };
    this.http.post(environment.apiUrl + `/projects/${projectId}/features/files/import/`, payload)
      .subscribe( (resp) => {
      }, error => {
        // TODO: Add notification / toast
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
    this.http.post<Array<Feature>>(environment.apiUrl + `/projects/${projectId}/features/files/`, form)
      .subscribe( (feats) => {
        feats.forEach( (feat) => {
          this.addFeature(new Feature(feat));
        });
      }, error => {
        // TODO: Add notification
      });
  }

  uploadAssetFile(projectId: number, featureId: number, file: File): void {
    const form: FormData = new FormData();
    form.append('file', file, file.name);
    this.http.post<Feature>(environment.apiUrl + `/api/projects/${projectId}/features/${featureId}/assets/`, form)
        .subscribe( (feature) => {
          // TODO workaround to update activeFeature
          const f = this._activeFeature.getValue();
          if (f && f.id === featureId) {
            this._activeFeature.next(new Feature(feature));
            this.getFeatures(projectId);
          }
        }, error => {
          // TODO: Add notification
        });
  }

  getOverlays(projectId: number): void {
    this.http.get(environment.apiUrl + `/projects/${projectId}/overlays/`).subscribe( (ovs: Array<Overlay>) => {
      this._overlays.next(ovs);
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

  public get overlays(): Observable<Array<Overlay>> {
    return this.overlays$;
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



}
