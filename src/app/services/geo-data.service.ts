import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {LatLng} from 'leaflet';
import {Overlay} from '../models/models';
import { Feature, FeatureCollection} from '../models/models';
import { environment } from '../../environments/environment';
import {Form} from '@angular/forms';
import {take} from 'rxjs/operators';
import * as querystring from 'querystring';

@Injectable({
  providedIn: 'root'
})
export class GeoDataService {

  private _features: BehaviorSubject<FeatureCollection>;
  private features$: Observable<FeatureCollection>;
  private _activeFeature: BehaviorSubject<any>;
  private _mapMouseLocation: BehaviorSubject<any>;
  private _basemap: BehaviorSubject<any>;
  private _overlays: BehaviorSubject<any>;
  private _activeOverlay: BehaviorSubject<any>;

  constructor(private http: HttpClient) {
    this._features = new BehaviorSubject<FeatureCollection>({type: 'FeatureCollection', features: []});
    this.features$ = this._features.asObservable();
    this._activeFeature = new BehaviorSubject<any>(null);
    this._mapMouseLocation = new BehaviorSubject<any>(null);

    // For the style of the basemap, defaults to OpenStreetmap
    this._basemap = new BehaviorSubject<any>('roads');

    // Holds all of the overlays on a project
    this._overlays = new BehaviorSubject<any>(null);
    this._activeOverlay = new BehaviorSubject<any>(null);
  }

  getFeatures(projectId: number, query: object = {}): void {
    const qstring: string = querystring.stringify(query || {});
    this.http.get<FeatureCollection>(environment.apiUrl + `/projects/${projectId}/features/` + '?' + qstring)
      .subscribe( (fc: FeatureCollection) => {
        fc.features = fc.features.map( (feat: Feature) => new Feature(feat));
        this._features.next(fc);
      });
  }

  addFeature(feat: Feature): void {
    this.features$.pipe(take(1)).subscribe( (current: FeatureCollection) => {
      current.features.push(feat);
      this._features.next(current);
    });
  }


  uploadFile(projectId: number, file: File): void {
    const form: FormData = new FormData();
    form.append('file', file, file.name);
    this.http.post<Array<Feature>>(environment.apiUrl + `/api/projects/${projectId}/features/files/`, form)
      .subscribe( (feats) => {
        feats.forEach( (feat) => {
          this.addFeature(new Feature(feat));
        });
      }, (error => {
        console.log(error);
      }));
  }

  getOverlays(projectId: number): void {
    this.http.get(environment.apiUrl + `/api/projects/${projectId}/overlays/`).subscribe( (ovs: Array<Overlay>) => {
      this._overlays.next(ovs);
    });
  }

  public get overlays(): Observable<Array<Overlay>> {
    return this._overlays.asObservable();
  }

  public get features(): Observable<FeatureCollection> {
    return this._features.asObservable();
  }

  public get activeFeature() {
    return this._activeFeature.asObservable();
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
    return this._activeOverlay.asObservable();
  }

  public set activeOverlay(ov) {
    this._activeOverlay.next(ov);
  }


  public get mapMouseLocation(): Observable<LatLng> {
    return this._mapMouseLocation.asObservable();
  }

  public set mapMouseLocation(loc) {
    this._mapMouseLocation.next(loc);
  }

  public set basemap(bmap) {
    this._basemap.next(bmap);
  }

  public get basemap(): any {
    return this._basemap.asObservable();
  }



}
