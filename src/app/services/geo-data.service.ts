import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {Feature, FeatureCollection} from "geojson";
import {LatLng} from "leaflet";

@Injectable({
  providedIn: 'root'
})
export class GeoDataService {

  private _features : BehaviorSubject<FeatureCollection>;
  private _activeFeature : BehaviorSubject<any>;
  private _mapMouseLocation : BehaviorSubject<any>;
  private _basemap: BehaviorSubject<any>;

  constructor(private http: HttpClient) {
    this._features = new BehaviorSubject<FeatureCollection>({type: "FeatureCollection", features: []})
    this._activeFeature = new BehaviorSubject<any>(null);
    this._mapMouseLocation = new BehaviorSubject<any>(null);
    this._basemap = new BehaviorSubject<any>(null);
  }

  // TODO: Add types on the observable
  getAllFeatures (projectId : number): void {
    this.http.get(`/api/projects/${projectId}/features/`).subscribe( (fc: FeatureCollection)=>{
      this._features.next(fc)
    })
  }

  public get features(): Observable<FeatureCollection> {
    return this._features.asObservable();
  }

  public get activeFeature(): Observable<Feature> {
    return this._activeFeature.asObservable();
  }

  public set activeFeature(f) {
    this._activeFeature.next(f);
  }

  public get mapMouseLocation() : Observable<LatLng> {
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
