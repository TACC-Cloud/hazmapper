import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Feature, FeatureCollection } from '../models/models';
import { BehaviorSubject, Observable } from 'rxjs';
import { parseLinkHeader } from '../utils/headers';
import { RemoteFile } from 'ng-tapis';
import { NotificationsService } from './notifications.service';
import { Router} from '@angular/router';
import { StreetviewAuthenticationService } from './streetview-authentication.service';
import { AuthenticatedUser, AuthService } from './authentication.service';
import { ProjectsService } from './projects.service';
import { EnvService } from '../services/env.service';

@Injectable({
  providedIn: 'root'
})
export class StreetviewService {
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

  private _mapillaryUserOrganizations: BehaviorSubject<any> = new BehaviorSubject([]);
  public mapillaryUserOrganizations: Observable<any> = this._mapillaryUserOrganizations.asObservable();

  private _mapillaryUserSequences: BehaviorSubject<any> = new BehaviorSubject([]);
  public mapillaryUserSequences: Observable<any> = this._mapillaryUserSequences.asObservable();

  private _googleUserSequences: BehaviorSubject<any> = new BehaviorSubject([]);
  public googleUserSequences: Observable<any> = this._googleUserSequences.asObservable();

  private _currentImage: BehaviorSubject<any> = new BehaviorSubject({});
  public currentImage: Observable<any> = this._currentImage.asObservable();

  private _mapillaryImages: BehaviorSubject<FeatureCollection> = new BehaviorSubject<FeatureCollection>({type: 'FeatureCollection',
                                                                                                         features: []});
  public mapillaryImages: Observable<FeatureCollection> = this._mapillaryImages.asObservable();

  private _nextPage: BehaviorSubject<any> = new BehaviorSubject('');
  public nextPage: Observable<any> = this._nextPage.asObservable();

  private _username: string;
  private _projectId: number;

  constructor(private http: HttpClient,
              private authService: AuthService,
              private projectsService: ProjectsService,
              private notificationsService: NotificationsService,
              private streetviewAuthenticationService: StreetviewAuthenticationService,
              private envService: EnvService,
              private router: Router) {
    this.authService.currentUser.subscribe(u => this._username = u ? u.username : null);
    this.projectsService.activeProject.subscribe(p => this._projectId = p ? p.id : null);
  }


  // Upload Backend

  public addSequenceToPath(service: string, sequences: Array<string>, dir: RemoteFile) {
    const payload = {
      sequences,
      dir
    };

    this.http.put<any>(
      this.envService.apiUrl + `/projects/${this._projectId}/users/${this._username}/streetview/${service}/sequences`,
      payload)
      .subscribe((resp: Array<any>) => {
        this.getStreetviewSequences(service);
      });
  }

  public removeStreetviewSequence(service: string, sequenceId: number) {
    this.http.delete<any>(
      this.envService.apiUrl +
        `/projects/${this._projectId}/users/${this._username}/streetview/${service}/sequences/${sequenceId}`)
      .subscribe(resp => {
        this.getStreetviewSequences(service);
      });
  }

  public getStreetviewSequences(service: string) {
    const userKey = localStorage.getItem('mapillaryUser');

    this._streetviewDisplaySequences.next({type: 'FeatureCollection', features: []});
    this.http.get<any>(this.envService.apiUrl +
      `/projects/${this._projectId}/users/${this._username}/streetview/${service}/sequences`)
      .subscribe((resp: Array<any>) => {
        for (const streetviews of resp) {
          for (const seq of streetviews.sequences) {
            if (!seq.sequence_key) {
              this.getMapillarySequenceKeys(seq).subscribe(sequence => {
                if (sequence.body.features.length) {
                  const sequenceKey = sequence.body.features[0].properties.key;
                  this.setMapillarySequenceKeys(seq.id, sequenceKey);
                  this._streetviewDisplaySequences.next({
                    type: 'FeatureCollection',
                    features: [...this._streetviewDisplaySequences.getValue().features, sequence.body.features[0]]
                  });
                }
              });
            } else {
              this.getMapillarySequence(seq.sequence_key).subscribe(sequence => {
                this._streetviewDisplaySequences.next({
                  type: 'FeatureCollection',
                  features: [...this._streetviewDisplaySequences.getValue().features, sequence]
                });
              });
            }
          }
        }
        this._streetviewSequences.next(resp);
      });
  }

  // NOTE From mapillary
  public getMapillarySequenceKeys(sequence: any) {
    const userKey = localStorage.getItem('mapillaryUser');
    return this.searchMapillarySequence({
      userkeys: userKey,
      bbox: sequence.bbox,
      start_date: sequence.start_date,
      end_date: sequence.end_date
    });
  }

  // NOTE To geoapi
  public setMapillarySequenceKeys(sequenceId: number, sequenceKey: string) {
    const payload = {
      sequence_key: sequenceKey
    };
    const service = 'mapillary';
    this.http.put<any>(this.envService.apiUrl +
      `/projects/${this._projectId}/users/${this._username}/streetview/${service}/sequences/${sequenceId}`,
                       payload)
      .subscribe(resp => console.log(resp));
  }

  public getStreetviewImages(service: string, sequenceKey: string) {
    this.http.get<any>(this.envService.apiUrl +
      `/projects/${this._projectId}/users/${this._username}/streetview/${service}/sequences/${sequenceKey}`)
      .subscribe((resp: any) => {
        this._currentImage.next(resp);
      });
  }

  public uploadPathToStreetviewService(dir: RemoteFile, toMapillary: boolean, toGoogle: boolean, organization: string, retry: boolean = false): void {
    const tmp = {
      system: dir.system,
      path: dir.path
    };

    const payload = {
      folder: tmp,
      mapillary: toMapillary,
      google: toGoogle,
      organization,
      retry
    };

    this.http.post(this.envService.apiUrl + `/projects/${this._projectId}/users/${this._username}/streetview/upload/`, payload)
      .subscribe( (resp) => {
      }, error => {
        console.log(error);
      });
  }

  // Google API

  public getGoogleUser(): void {
    const params = new HttpParams()
      .set('client_id', this.envService.googleClientId);

    this.http.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', { params })
      .subscribe(resp => {
        this._googleUser.next(resp);
      });
  }

  // TODO
  getGoogleUserSequences(): void {
    const userKey = this._googleUser.value.key;
    this._googleUserSequences.next([]);
  }

  // Mapillary API

  public searchMapillarySequence(params: any, pageUrl: string = ''): any {
    if (pageUrl === '') {
      params = new HttpParams({fromObject: params})
        .set('client_id', this.envService.mapillaryClientId);
      return this.http.get(this.envService.mapillaryApiUrl + `/sequences/`,
                           {params, observe: 'response'});
    } else {
      return this.http.get(pageUrl, {observe: 'response'});
    }
  }

  public getMapillarySequence(sequenceKey: string): any {
    const params = new HttpParams()
      .set('client_id', this.envService.mapillaryClientId);

    return this.http.get(this.envService.mapillaryApiUrl + `/sequences/${sequenceKey}`,
                         {params});
  }

  public getMapillaryUserSequences(pageUrl: string = ''): void {
    const userKey = localStorage.getItem('mapillaryUser');
    this.searchMapillarySequence({userkeys: userKey, per_page: 10}, pageUrl)
      .subscribe(resp => {
        const pages = parseLinkHeader(resp.headers.get('Link'));
        this._nextPage.next(pages['next']);
        const prevSequence = this._mapillaryUserSequences.getValue();
        this._mapillaryUserSequences.next([...prevSequence, ...resp.body.features]);
      }, error => {
        console.log(error);
      });
  }

  public getMapillarySequences(seq: any): void {
    this.getMapillarySequence(seq.sequence_key).subscribe(e => {
      const feat = new Feature(e);
      this._mapillaryLines.next(feat);
    });
  }

  public clearMapillarySequences() {
    this._mapillaryUserSequences.next([]);
  }


  public getMapillaryImage(imageKey: string): any {
    const params = new HttpParams()
      .set('client_id', this.envService.mapillaryClientId);

    return this.http.get(this.envService.mapillaryApiUrl + `/images/${imageKey}`, {params});
  }

  public getMapillaryImages(sequence: any): any {
    const userKey = localStorage.getItem('mapillaryUser');
    let params = {};
    if (!sequence.sequence_key) {
      params = {
        bbox: sequence.bbox,
        start_date: sequence.start_date,
        end_date: sequence.end_date,
        userkeys: userKey
      };
    } else {
      params = {sequence_keys: sequence.sequence_key};
    }

    params = new HttpParams({fromObject: params})
      .set('client_id', this.envService.mapillaryClientId)
      .set('per_page', '1000');

    this.http.get(this.envService.mapillaryApiUrl + `/images/`, {params}).subscribe((imgs: any) => {
      console.log(imgs);
      imgs.features = imgs.features.map( (feat: Feature) => new Feature(feat));
      this._mapillaryImages.next(imgs);
    });
  }


  public searchMapillaryImages(params: any, callback): any {
    const userKey = localStorage.getItem('mapillaryUser');
    params = new HttpParams({fromObject: params})
      .set('client_id', this.envService.mapillaryClientId)
      .set('per_page', '1000')
      .set('userkeys', userKey);

    this.http.get(this.envService.mapillaryApiUrl + `/images/`, {params}).subscribe(resp => {
      callback(resp);
    }, error => {
      console.log(error);
    });
  }

  public getMapillaryUser(): any {
    const params = new HttpParams()
      .set('client_id', this.envService.mapillaryClientId);

    return this.http.get(this.envService.mapillaryApiUrl + `/me/`, { params })
      .subscribe(resp => {
        this._mapillaryUser.next(resp);
      });
  }

  public getMapillaryUserOrganizations(): any {
    const userKey = localStorage.getItem('mapillaryUser');
    const params = new HttpParams()
      .set('client_id', this.envService.mapillaryClientId);

    this.http.get(this.envService.mapillaryApiUrl + `/users/${userKey}/organizations`, { params })
      .subscribe(resp => {
        this._mapillaryUserOrganizations.next(resp)
      });
  }
}
