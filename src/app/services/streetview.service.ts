import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Feature, FeatureCollection, AuthToken } from '../models/models';
import {
  Streetview,
  StreetviewSequence,
  StreetviewInstance,
} from '../models/streetview';
import { BehaviorSubject, Observable } from 'rxjs';
import { parseLinkHeader } from '../utils/headers';
import { RemoteFile } from 'ng-tapis';
import {NotificationsService} from './notifications.service';
import {EnvService} from '../services/env.service';
import {StreetviewAuthenticationService} from './streetview-authentication.service';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StreetviewService {
  private _activeAsset: BehaviorSubject<any> = new BehaviorSubject(null);
  public activeAsset$: Observable<any> = this._activeAsset.asObservable();
  private _streetviewDisplaySequences: BehaviorSubject<FeatureCollection> = new BehaviorSubject({type: 'FeatureCollection', features: []});
  public streetviewDisplaySequences: Observable<FeatureCollection> = this._streetviewDisplaySequences.asObservable();
  private _mapillaryLines: BehaviorSubject<Feature> = new BehaviorSubject<Feature>(null);
  public mapillaryLines: Observable<Feature> = this._mapillaryLines.asObservable();
  private _mapillarySequences: BehaviorSubject<Array<Feature>> = new BehaviorSubject([]);
  public mapillarySequences: Observable<Array<Feature>> = this._mapillarySequences.asObservable();
  private _googleSequences: BehaviorSubject<any> = new BehaviorSubject([]);
  public googleSequences: Observable<any> = this._googleSequences.asObservable();
  private _mapillaryImages: BehaviorSubject<FeatureCollection> = new BehaviorSubject<FeatureCollection>({type: 'FeatureCollection',
                                                                                                         features: []});
  public mapillaryImages: Observable<FeatureCollection> = this._mapillaryImages.asObservable();
  private _nextPage: BehaviorSubject<string> = new BehaviorSubject('');
  public nextPage: Observable<string> = this._nextPage.asObservable();

  private _displayStreetview: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public displayStreetview$: Observable<boolean> = this._displayStreetview.asObservable();

  private _activeMapillaryOrganizations: BehaviorSubject<Array<any>> = new BehaviorSubject([]);
  public activeMapillaryOrganizations$: Observable<Array<any>> = this._activeMapillaryOrganizations.asObservable();

  private _assetDetailEvent: BehaviorSubject<any> = new BehaviorSubject(null);
  public assetDetailEvent$: Observable<any> = this._assetDetailEvent.asObservable();

  private _sequenceFocusEvent: BehaviorSubject<any> = new BehaviorSubject(null);
  public sequenceFocusEvent$: Observable<any> = this._sequenceFocusEvent.asObservable();

  constructor(private http: HttpClient,
              private notificationsService: NotificationsService,
              private streetviewAuthentication: StreetviewAuthenticationService,
              private envService: EnvService) {
  }


  public addOrganization(streetviewId: number, name: string, key: string): void {
    const payload = {
      streetview_id: streetviewId,
      name,
      key
    };

    this.http.post(this.envService.apiUrl + `/streetview/${streetviewId}/organization/`, payload)
      .subscribe((e) => {
        console.log(e);
        this.streetviewAuthentication.getStreetviews().subscribe();
        ;
        return;
      }, error => {
        console.error(error);
        this.notificationsService.showErrorToast('Failed to get streetviews from Geoapi!');
        });
  }

  public getMapillaryImageData(imageId: string, fields: string[]) {
    const params = new HttpParams()
      .set('fields', fields.join(', '));
    return this.http.get<any>
      (this.envService.streetviewEnv.mapillary.apiUrl + imageId, { params });
  }

  public getMapillaryImages(sequenceId: string) {
    const params = new HttpParams()
      .set('sequence_id', sequenceId);
    return this.http.get<any>
      (this.envService.streetviewEnv.mapillary.apiUrl + 'image_ids', { params });
  }

  public updateOrganization(organizationId: number, name: string, key: string): void {
    const payload = {
      name,
      key
    };

    this.http.put(this.envService.apiUrl + `/streetview/organization/${organizationId}`, payload)
      .subscribe(() => {
        return;
      }, error => {
        console.error(error);
        this.notificationsService.showErrorToast('Failed to get streetviews from Geoapi!');
        });
  }

  public removeOrganization(organizationId: number): void {
    this.http.delete(this.envService.apiUrl + `/streetview/organization/${organizationId}/`)
      .subscribe(() => {
        this.streetviewAuthentication.getStreetviews().subscribe();
        return;
      }, error => {
        console.error(error);
        });
  }

  public addSequenceToPath(streetviewId: number, sequenceId: string, dir: RemoteFile): void {
    const payload = {
      streetviewId,
      sequenceId,
      dir
    };

    this.http.post(this.envService.apiUrl + `/streetview/sequences/`, payload)
      .subscribe(() => {
        this.streetviewAuthentication.getStreetviews().subscribe();
      }, error => {
        console.error(error);
        this.notificationsService.showErrorToast('Failed to get streetviews!');
      });
  }

  public removeStreetview(streetviewId: number): void {
    this.http.delete(
      this.envService.apiUrl + `/streetview/${streetviewId}/`).subscribe(() => {
        this.streetviewAuthentication.getStreetviews().subscribe();
      }, error => {
        console.error(error);
        this.notificationsService.showErrorToast('Failed to remove streetview!');
      });
  }

  public removeStreetviewInstance(instanceId: number): void {
    this.http.delete(
      this.envService.apiUrl + `/streetview/instances/${instanceId}/`).subscribe(() => {
        this.streetviewAuthentication.getStreetviews().subscribe();
      }, error => {
        console.error(error);
        this.notificationsService.showErrorToast('Failed to remove streetview instance!');
      });
  }

  public removeStreetviewSequence(sequenceId: number): void {
    this.http.delete(
      this.envService.apiUrl +
        `/streetview/sequences/${sequenceId}/`)
      .subscribe(() => {
        this.streetviewAuthentication.getStreetviews().subscribe();
      }, error => {
        console.error(error);
        this.notificationsService.showErrorToast('Failed to remove sequence!');
      });
  }

  public uploadPathToStreetviewService(dir: RemoteFile, organizationKey: string, service: string): void {
    const payload = {
      system_id: dir.system,
      path: dir.path,
      organization_key: organizationKey,
      service
    };

    this.http.post(this.envService.apiUrl + `/streetview/upload/`, payload)
      .subscribe(() => {
        this.notificationsService.showSuccessToast('Upload started!');
      }, error => {
        this.notificationsService.showErrorToast('Error during upload request!');
        console.log(error);
      });
  }

  public get activeAsset() {
    return this.activeAsset$;
  }

  public set activeAsset(a: any) {
    this._activeAsset.next(a);
  }

  public get displayStreetview() {
    return this.displayStreetview$;
  }

  public set displayStreetview(a: any) {
    this._displayStreetview.next(a);
  }

  public get activeMapillaryOrganizations() {
    return this.activeMapillaryOrganizations$;
  }

  public set activeMapillaryOrganizations(a: any) {
    this._activeMapillaryOrganizations.next(a);
  }

  public get assetDetailEvent() {
    return this.assetDetailEvent$;
  }

  public set assetDetailEvent(a: any) {
    this._assetDetailEvent.next(a);
  }

  public get sequenceFocusEvent() {
    return this.sequenceFocusEvent$;
  }

  public set sequenceFocusEvent(a: any) {
    this._sequenceFocusEvent.next(a);
  }

}
