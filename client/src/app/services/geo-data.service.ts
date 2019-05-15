import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {LatLng} from "leaflet";
import {Overlay} from "../models/models";
import { Feature, FeatureCollection} from "../models/models";

@Injectable({
  providedIn: 'root'
})
export class GeoDataService {

  private _features : BehaviorSubject<FeatureCollection>;
  private _activeFeature : BehaviorSubject<any>;
  private _mapMouseLocation : BehaviorSubject<any>;
  private _basemap: BehaviorSubject<any>;
  private _overlays: BehaviorSubject<any>;
  private _activeOverlay : BehaviorSubject<any>;

  constructor(private http: HttpClient) {
    this._features = new BehaviorSubject<FeatureCollection>({type: "FeatureCollection", features: []});
    this._activeFeature = new BehaviorSubject<any>(null);
    this._mapMouseLocation = new BehaviorSubject<any>(null);

    // For the style of the basemap, defaults to OpenStreetmap
    this._basemap = new BehaviorSubject<any>('roads');

    // Holds all of the overlays on a project
    this._overlays = new BehaviorSubject<any>(null);
    this._activeOverlay = new BehaviorSubject<any>(null);
  }

  // TODO: Add types on the observable
  getAllFeatures (projectId : number): void {
    this.http.get(`/api/projects/${projectId}/features/`)
      .subscribe( (fc: FeatureCollection)=>{
        fc.features = fc.features.map( (feat: Feature)=> {return new Feature(feat)});
        this._features.next(fc)
      });
  }

  getOverlays (projectId: number): void {
    this.http.get(`/api/projects/${projectId}/overlays/`).subscribe( (ovs: Array<Overlay>)=>{
      this._overlays.next(ovs)
    })
  }

  public get overlays(): Observable<Array<Overlay>> {
    return this._overlays.asObservable();
  }

  public get features(): Observable<FeatureCollection> {
    return this._features.asObservable();
  }

  public get activeFeature(){
    return this._activeFeature.asObservable();
  }

  // TODO: This is heinous
  public set activeFeature(f:any) {
    if (f) {
      if (f == this._activeFeature.getValue()) {
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

  public set activeOverlay(ov){
    this._activeOverlay.next(ov);
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
