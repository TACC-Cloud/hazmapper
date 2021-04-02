import { Injectable } from '@angular/core';
import {HttpClient, HttpEventType, HttpHeaders, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { Feature, FeatureCollection, AuthToken, Project } from '../models/models';
import {BehaviorSubject, Observable, ReplaySubject, Subject} from 'rxjs';
import { environment } from '../../environments/environment';
import { parseLinkHeader } from '../utils/headers';
import {RemoteFile} from 'ng-tapis';
import {NotificationsService} from './notifications.service';
import {Router} from '@angular/router';
import { StreetviewAuthenticationService } from './streetview-authentication.service';
import { AuthenticatedUser, AuthService } from './authentication.service';
import { ProjectsService } from './projects.service';

@Injectable({
  providedIn: 'root'
})
export class StreetviewService {
  private GOOGLE_CLIENT_ID = '573001329633-1p0k8rko13s6n2p2cugp3timji3ip9f0.apps.googleusercontent.com';
  private MAPILLARY_CLIENT_ID = 'VDRaeGFzMEtzRnJrMFZwdVYzckd6cjo0ZWY3ZDEzZGIyMWJkZjNi';
  private MAPILLARY_API_URL = 'https://a.mapillary.com/v3';

  private _streetviewSequences: BehaviorSubject<Array<any>> = new BehaviorSubject([]);
  public streetviewSequences: Observable<Array<any>> = this._streetviewSequences.asObservable();

  private _streetviewDisplaySequences: BehaviorSubject<FeatureCollection> = new BehaviorSubject({type: 'FeatureCollection', features: []});
  public streetviewDisplaySequences: Observable<FeatureCollection> = this._streetviewDisplaySequences.asObservable();

  private _mapillaryLines: BehaviorSubject<Feature> = new BehaviorSubject<Feature>(null);
  public mapillaryLines: Observable<Feature> = this._mapillaryLines.asObservable();

  private _mapillaryUser: BehaviorSubject<any> = new BehaviorSubject(null);
  public mapillaryUser: Observable<any> = this._mapillaryUser.asObservable();
  private _googleUser: BehaviorSubject<any> = new BehaviorSubject(null);
  public googleUser: Observable<any> = this._googleUser.asObservable();

  private _mapillaryUserSequences: BehaviorSubject<any> = new BehaviorSubject([]);
  public mapillaryUserSequences: Observable<any> = this._mapillaryUserSequences.asObservable();

  private _googleUserSequences: BehaviorSubject<any> = new BehaviorSubject([]);
  public googleUserSequences: Observable<any> = this._googleUserSequences.asObservable();

  private _currentImage: BehaviorSubject<any> = new BehaviorSubject({});
  public currentImage: Observable<any> = this._currentImage.asObservable();

  private _mapillaryImages: BehaviorSubject<FeatureCollection> = new BehaviorSubject<FeatureCollection>({type: 'FeatureCollection', features: []});
  public mapillaryImages: Observable<FeatureCollection> = this._mapillaryImages.asObservable();

  private _nextPage: BehaviorSubject<any> = new BehaviorSubject("");
  public nextPage: Observable<any> = this._nextPage.asObservable();

  private _currentUser: AuthenticatedUser;
  private _projectId: number;

  constructor(private http: HttpClient,
              private authService: AuthService,
              private projectsService: ProjectsService,
              private notificationsService: NotificationsService,
              private streetviewAuthenticationService: StreetviewAuthenticationService,
              private router: Router) {
    this.authService.currentUser.subscribe(u => this._currentUser = u)
    this.projectsService.activeProject.subscribe(p => this._projectId = p.id)
  }


  // Upload Backend

  public addSequenceToPath(service: string, sequences: Array<string>, dir: RemoteFile) {
    this.streetviewAuthenticationService.checkExpiration(service);

    const payload = {
      sequences: sequences,
      dir: dir
    };

    this.http.put<any>(environment.apiUrl + `/projects/${this._projectId}/users/${this._currentUser.username}/streetview/${service}/sequences`, payload)
      .subscribe((resp: Array<any>) => {
        this.getStreetviewSequences(service);
      });
  }

  public removeStreetviewSequence(service: string, sequenceId: number) {
    this.http.delete<any>(environment.apiUrl + `/projects/${this._projectId}/users/${this._currentUser.username}/streetview/${service}/sequences/${sequenceId}`)
      .subscribe(resp => {
        this.getStreetviewSequences(service);
      });
  }

  public getStreetviewSequences(service: string) {
    this.streetviewAuthenticationService.checkExpiration(service);
    const userKey = localStorage.getItem("mapillaryUser");

    this._streetviewDisplaySequences.next({type: 'FeatureCollection', features: []});
    this.http.get<any>(environment.apiUrl + `/projects/${this._projectId}/users/${this._currentUser.username}/streetview/${service}/sequences`)
      .subscribe((resp: Array<any>) => {
        let sequenceKeys = [];
        for (let streetviews of resp) {
          for (let seq of streetviews.sequences) {
            if (!seq.sequence_key) {
              this.getMapillarySequenceKeys(seq).subscribe(resp => {
                if (resp.features) {
                  const sequenceKey = resp.features[0].sequence_key;
                  this.setMapillarySequenceKeys(seq.id, sequenceKey);
                  this._streetviewDisplaySequences.next({
                    type: 'FeatureCollection',
                    features: [...this._streetviewDisplaySequences.getValue().features, resp.features[0]]
                  });
                }
              });
            } else {
              this.getMapillarySequence(seq.sequence_key).subscribe(resp => {
                this._streetviewDisplaySequences.next({
                  type: 'FeatureCollection',
                  features: [...this._streetviewDisplaySequences.getValue().features, resp]
                });
                console.log(this._streetviewDisplaySequences.getValue());
              });
            }
          }
        }
        this._streetviewSequences.next(resp);
      });
  }

  // NOTE From mapillary
  public getMapillarySequenceKeys(sequence: any) {
    const userKey = localStorage.getItem("mapillaryUser");
    return this.searchMapillarySequence({
      'userkeys': userKey,
      'bbox': sequence.bbox,
      'start_date': sequence.start_date,
      'end_date': sequence.end_date
    });
  }

  // NOTE To geoapi
  public setMapillarySequenceKeys(sequenceId: number, sequence_key: string) {
    const payload = {
      'sequenceKey': sequence_key
    };
    const service = 'mapillary';
    return this.http.put<any>(environment.apiUrl + `/projects/${this._projectId}/users/${this._currentUser.username}/streetview/${service}/sequences/${sequenceId}`, payload);
  }

  public getStreetviewImages(service: string, sequenceKey: string) {
    this.streetviewAuthenticationService.checkExpiration(service);
    this.http.get<any>(environment.apiUrl + `/projects/${this._projectId}/users/${this._currentUser.username}/streetview/${service}/sequences/${sequenceKey}`)
      .subscribe((resp: any) => {
        this._currentImage.next(resp);
      });
  }

  public uploadPathToStreetviewService(dir: RemoteFile, toMapillary: boolean, toGoogle: boolean, retry: boolean = false): void {
    if (toMapillary) {
      this.streetviewAuthenticationService.checkExpiration('mapillary');
    }

    if (toGoogle) {
      this.streetviewAuthenticationService.checkExpiration('google');
    }

    const tmp = {
      system: dir.system,
      path: dir.path
    };
    console.log(retry);

    const payload = {
      folder: tmp,
      mapillary: toMapillary,
      google: toGoogle,
      retry: retry
    };

    this.http.post(environment.apiUrl + `/projects/${this._projectId}/users/${this._currentUser.username}/streetview/upload/`, payload)
      .subscribe( (resp) => {
      }, error => {
        // TODO: Redirect to Login after refreshing panel and notify that not authenticated
        if (error instanceof HttpErrorResponse && error.status === 403) {
          this.notificationsService.showErrorToast('Not authenticated to the service.');
        }
        // TODO: Add notification / toast
      });
  }

  // Google API

  public getGoogleUser(): void {
    this.streetviewAuthenticationService.checkExpiration('google');
    const params = new HttpParams()
      .set('client_id', this.GOOGLE_CLIENT_ID)

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + JSON.parse(this.streetviewAuthenticationService.getLocalToken('google')).token
    });

    this.http.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', { headers: headers, params: params })
      .subscribe(resp => {
        this._googleUser.next(resp);
      });
  }

  getGoogleUserSequences(): void {
    let userKey = this._googleUser.value.key;
    // TODO: some get images call
    this._googleUserSequences.next([]);
  }


  // Mapillary API

  public searchMapillarySequence(params: any, pageUrl: string = ""): any {
    this.streetviewAuthenticationService.checkExpiration('mapillary');

    if (pageUrl == "") {
      params = new HttpParams({fromObject: params})
        .set('client_id', this.MAPILLARY_CLIENT_ID);
      return this.http.get(this.MAPILLARY_API_URL + `/sequences/`,
                           {params: params, observe: 'response'})
    } else {
      return this.http.get(pageUrl, {observe: 'response'});
    }
  }

  public getMapillarySequence(sequenceKey: string): any {
    this.streetviewAuthenticationService.checkExpiration('mapillary');
    const params = new HttpParams()
      .set('client_id', this.MAPILLARY_CLIENT_ID);

    return this.http.get(this.MAPILLARY_API_URL + `/sequences/${sequenceKey}`,
                         {params: params})
  }

  public getMapillaryUserSequences(pageUrl: string = ""): void {
    const userKey = localStorage.getItem("mapillaryUser");
    this.searchMapillarySequence({'userkeys': userKey, 'per_page': 10}, pageUrl)
      .subscribe(resp => {
        const pages = parseLinkHeader(resp.headers.get('Link'));
        this._nextPage.next(pages['next']);
        let prevSequence = this._mapillaryUserSequences.getValue();
        this._mapillaryUserSequences.next([...prevSequence, ...resp.body.features]);
      }, error => {
        console.log(error);
      });
  }

  public getMapillarySequences(seq: any): void {
    this.getMapillarySequence(seq.sequence_key).subscribe(e => {
      let feat = new Feature(e);
      this._mapillaryLines.next(feat);
    });
  }

  public clearMapillarySequences() {
    this._mapillaryUserSequences.next([]);
  }


  public getMapillaryImage(imageKey: string): any {
    this.streetviewAuthenticationService.checkExpiration('mapillary');
    const params = new HttpParams()
      .set('client_id', this.MAPILLARY_CLIENT_ID);

    return this.http.get(this.MAPILLARY_API_URL + `/images/${imageKey}`, {params});
  }

  public getMapillaryImages(sequence: any): any {
    this.streetviewAuthenticationService.checkExpiration('mapillary');
    // const userKey = this.streetviewAuthenticationService.getMapillaryUserKey();
    const userKey = localStorage.getItem("mapillaryUser");
    let params = {};
    if (!sequence.sequence_key) {
      params = {
        'bbox': sequence.bbox,
        'start_date': sequence.start_date,
        'end_date': sequence.end_date,
        'userkeys': userKey
      };
    } else {
      params = {'sequence_keys': sequence.sequence_key};
    }

    console.log(params);

    params = new HttpParams({fromObject: params})
      .set('client_id', this.MAPILLARY_CLIENT_ID)
      .set('per_page', "1000");

    this.http.get(this.MAPILLARY_API_URL + `/images/`, {params: params}).subscribe((imgs: any) => {
      console.log(imgs);
      imgs.features = imgs.features.map( (feat: Feature) => new Feature(feat));
      this._mapillaryImages.next(imgs);
    });
  }



  public searchMapillaryImages(params: any, callback): any {
    // const userKey = this.streetviewAuthenticationService.getMapillaryUserKey();
    // console.log(userKey);
    const userKey = localStorage.getItem("mapillaryUser");
    params = new HttpParams({fromObject: params})
      .set('client_id', this.MAPILLARY_CLIENT_ID)
      .set('per_page', "1000")
      .set('userkeys', userKey);

    this.http.get(this.MAPILLARY_API_URL + `/images/`, {params: params}).subscribe(resp => {
      callback(resp);
    }, error => {
      this.streetviewAuthenticationService.checkExpiration('mapillary');
    });
  }

  public getMapillaryUser(): any {
    this.streetviewAuthenticationService.checkExpiration('mapillary');
    const params = new HttpParams()
      .set('client_id', this.MAPILLARY_CLIENT_ID)

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + JSON.parse(this.streetviewAuthenticationService.getLocalToken('mapillary')).token
    });

    return this.http.get(this.MAPILLARY_API_URL + `/me/`, { headers: headers, params: params });
  }

  public getMapillaryOrganizations(): any {
    this.streetviewAuthenticationService.checkExpiration('mapillary');
    const params = new HttpParams()
      .set('client_id', this.MAPILLARY_CLIENT_ID)

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + JSON.parse(this.streetviewAuthenticationService.getLocalToken('mapillary')).token
    });

    return this.http.get(this.MAPILLARY_API_URL + `/users/${this._mapillaryUser.value.key}/organizations`,
                         { headers: headers, params: params });
  }


}
