import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Feature, FeatureCollection } from '../models/models';
import { Streetview,
         StreetviewSequence,
         MapillaryImageSearchCallback,
         MapillaryUser,
         GoogleUser } from '../models/streetview';
import { AsyncSubject, BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { parseLinkHeader } from '../utils/headers';
import { RemoteFile } from 'ng-tapis';
import { NotificationsService } from './notifications.service';
import { EnvService } from '../services/env.service';
import { take } from 'rxjs/operators';
import { IProgressNotification } from '../models/notification';

@Injectable({
  providedIn: 'root'
})
export class StreetviewService {
  private _streetviews: BehaviorSubject<Array<Streetview>> = new BehaviorSubject([]);
  public streetviews: Observable<Array<Streetview>> = this._streetviews.asObservable();
  private _streetviewDisplaySequences: BehaviorSubject<FeatureCollection> = new BehaviorSubject({type: 'FeatureCollection', features: []});
  public streetviewDisplaySequences: Observable<FeatureCollection> = this._streetviewDisplaySequences.asObservable();
  private _mapillaryLines: BehaviorSubject<Feature> = new BehaviorSubject<Feature>(null);
  public mapillaryLines: Observable<Feature> = this._mapillaryLines.asObservable();
  private _mapillaryUser: BehaviorSubject<MapillaryUser> = new BehaviorSubject(null);
  public mapillaryUser: Observable<MapillaryUser> = this._mapillaryUser.asObservable();
  private _googleUser: BehaviorSubject<GoogleUser> = new BehaviorSubject(null);
  public googleUser: Observable<GoogleUser> = this._googleUser.asObservable();
  private _mapillarySequences: BehaviorSubject<Array<Feature>> = new BehaviorSubject([]);
  public mapillarySequences: Observable<Array<Feature>> = this._mapillarySequences.asObservable();
  private _googleSequences: BehaviorSubject<any> = new BehaviorSubject([]);
  public googleSequences: Observable<any> = this._googleSequences.asObservable();
  private _mapillaryImages: BehaviorSubject<FeatureCollection> = new BehaviorSubject<FeatureCollection>({type: 'FeatureCollection',
                                                                                                         features: []});
  public mapillaryImages: Observable<FeatureCollection> = this._mapillaryImages.asObservable();
  private _nextPage: BehaviorSubject<string> = new BehaviorSubject('');
  public nextPage: Observable<string> = this._nextPage.asObservable();
  private _streetviewerOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public streetviewerOpen: Observable<boolean> = this._streetviewerOpen.asObservable();

  constructor(private http: HttpClient,
              private notificationsService: NotificationsService,
              private envService: EnvService) {
  }

  // Upload Backend

  public addSequenceToPath(service: string, sequences: Array<string>, dir: RemoteFile): void {
    const payload = {
      sequences,
      dir,
      service
    };

    this.http.post(this.envService.apiUrl + `/streetview/sequences/`, payload)
      .subscribe(() => {
        this.getStreetviews();
      }, error => {
        console.error(error);
        this.notificationsService.showErrorToast('Failed to get streetviews from Geoapi!');
      });
  }

  public removeStreetview(streetviewId: number): void {
    this.http.delete(
      this.envService.apiUrl + `/streetview/${streetviewId}/`).subscribe(() => {
        this.getStreetviews();
      }, error => {
        console.error(error);
        this.notificationsService.showErrorToast('Failed to remove streetviews from Geoapi!');
      });
  }

  public removeStreetviewSequence(sequenceId: number): void {
    this.http.delete(
      this.envService.apiUrl +
        `/streetview/sequences/${sequenceId}/`)
      .subscribe(() => {
        this.getStreetviews();
      }, error => {
        console.error(error);
        this.notificationsService.showErrorToast('Failed to delete sequence from streetview collection!');
      });
  }

  public convertToDisplaySequences(seq: StreetviewSequence): Observable<Feature> {
    const displaySequence: ReplaySubject<Feature> = new ReplaySubject(1);
    // NOTE: If there is not sequence key yet, try getting it with approximation (lat/lon,start/end)
    //       Also set the key if there is a key for that sequence feature.
    if (!seq.sequence_key) {
      this.getMapillarySequenceKeys(seq).subscribe((resp: HttpResponse<FeatureCollection>) => {
        if (resp.body.features.length) {
          const sequenceKey = resp.body.features[0].properties.key;
          this.setMapillarySequenceKeys(seq.id, sequenceKey);
          displaySequence.next(resp.body.features[0]);
        }
      }, error => {
        console.error(error);
        this.notificationsService.showErrorToast('Failed to get sequence results from Mapillary!');
      });
    } else {
      this.getMapillarySequence(seq.sequence_key).subscribe((sequence: Feature) => {
        displaySequence.next(sequence);
      }, error => {
        console.error(error);
        this.notificationsService.showErrorToast('Failed to get sequence from Mapillary!');
      });
    }
    return displaySequence;
  }

  public getStreetviews(): void {
    this.setDisplaySequences([]);
    this.http.get<Array<Streetview>>(this.envService.apiUrl + `/streetview/`)
      .subscribe((streetviews: Array<Streetview>) => {
        // NOTE: Populate displaySequences for drawing
        for (const sv of streetviews) {
          for (const seq of sv.sequences) {
            this.convertToDisplaySequences(seq).subscribe((sequence: Feature) => {
              this.setDisplaySequences([...this.getDisplaySequences(), sequence]);
            });
          }
        }
        this._streetviews.next(streetviews);
      }, error => {
        console.error(error);
        this.notificationsService.showErrorToast('Failed to get streetview for user from Geoapi!');
      });
  }

  // NOTE From mapillary
  public getMapillarySequenceKeys(sequence: StreetviewSequence): Observable<HttpResponse<FeatureCollection>> {
    const userKey = localStorage.getItem('mapillaryUser');
    return this.searchMapillarySequence({
      userkeys: userKey,
      bbox: sequence.bbox,
      start_date: sequence.start_date,
      end_date: sequence.end_date
    });
  }

  // NOTE To geoapi
  public setMapillarySequenceKeys(sequenceId: number, sequenceKey: string): void {
    const payload = {
      sequence_key: sequenceKey
    };
    this.http.put<StreetviewSequence>(this.envService.apiUrl + `/streetview/sequences/${sequenceId}/`,
                                      payload)
      .subscribe((streetviewSequence: StreetviewSequence) => {
        return;
      }, error => {
        console.error(error);
        this.notificationsService.showErrorToast('Failed to set sequence keys for streetview sequence in Geoapi!');
      });
  }

  public uploadPathToStreetviewService(dir: RemoteFile, toMapillary: boolean, toGoogle: boolean, retry: boolean = false): void {
    const tmp = {
      system: dir.system,
      path: dir.path
    };

    const payload = {
      folder: tmp,
      mapillary: toMapillary,
      google: toGoogle,
      retry
    };

    this.http.post(this.envService.apiUrl + `/streetview/upload/`, payload)
      .subscribe(() => {
        this.notificationsService.showSuccessToast('Upload started!');
      }, error => {
        this.notificationsService.showErrorToast('Error during upload request!');
        console.log(error);
      });
  }

  // TODO
  // Google API

  public getGoogleUser(): void {
    const params = new HttpParams()
      .set('client_id', this.envService.googleClientId);

    this.http.get<GoogleUser>('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', { params })
      .subscribe((googleUser: GoogleUser) => {
        this._googleUser.next(googleUser);
      }, error => {
        console.error(error);
        this.notificationsService.showErrorToast('Failed to get user information from Google!');
      });
  }

  getGoogleSequences(): void {
    const userKey = this._googleUser.value.key;
    this._googleSequences.next([]);
  }

  // Mapillary API

  public searchMapillarySequence(params: any, pageUrl: string = ''): Observable<HttpResponse<FeatureCollection>> {
    if (pageUrl === '') {
      params = new HttpParams({fromObject: params})
        .set('client_id', this.envService.mapillaryClientId);
      return this.http.get<FeatureCollection>(this.envService.mapillaryApiUrl + `/sequences/`,
                           {params, observe: 'response'});
    } else {
      return this.http.get<FeatureCollection>(pageUrl, {observe: 'response'});
    }
  }

  public getMapillarySequence(sequenceKey: string): Observable<Feature> {
    const params = new HttpParams()
      .set('client_id', this.envService.mapillaryClientId);

    return this.http.get<Feature>(this.envService.mapillaryApiUrl + `/sequences/${sequenceKey}`,
                         {params});
  }

  // Get all sequences for a User
  public getMapillarySequences(pageUrl: string = ''): void {
    const userKey = localStorage.getItem('mapillaryUser');
    this.searchMapillarySequence({userkeys: userKey, per_page: 10}, pageUrl)
      .subscribe((resp: HttpResponse<FeatureCollection>) => {
        const pages = parseLinkHeader(resp.headers.get('Link'));
        this._nextPage.next(pages.next);
        const prevSequence = this._mapillarySequences.getValue();
        this._mapillarySequences.next([...prevSequence, ...resp.body.features]);
      }, error => {
        console.error(error);
        this.notificationsService.showErrorToast('Failed to get sequence results from Mapillary!');
      });
  }

  public clearMapillarySequences(): void {
    this._mapillarySequences.next([]);
  }

  public clearMapillaryDisplaySequences(): void {
    this.setDisplaySequences([]);
  }

  public setDisplaySequences(features: Array<Feature>): void {
    this._streetviewDisplaySequences.next({type: 'FeatureCollection', features});
  }

  public getDisplaySequences(): Array<Feature> {
    return this._streetviewDisplaySequences.value.features;
  }

  public getMapillaryImage(imageKey: string): Observable<Feature> {
    const params = new HttpParams()
      .set('client_id', this.envService.mapillaryClientId);

    return this.http.get<Feature>(this.envService.mapillaryApiUrl + `/images/${imageKey}`, {params});
  }

  public getMapillaryImages(sequence: StreetviewSequence): void {
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

    this.http.get<FeatureCollection>(this.envService.mapillaryApiUrl + `/images/`, {params})
      .subscribe((imgs: FeatureCollection) => {
        imgs.features = imgs.features.map( (feat: Feature) => new Feature(feat));
        this._mapillaryImages.next(imgs);
      }, error => {
        console.error(error);
        this.notificationsService.showErrorToast('Failed to get streetview images from Mapillary!');
      });
  }

  public searchMapillaryImages(params: any, callback: MapillaryImageSearchCallback): void {
    const userKey = localStorage.getItem('mapillaryUser');
    params = new HttpParams({fromObject: params})
      .set('client_id', this.envService.mapillaryClientId)
      .set('per_page', '1000')
      .set('userkeys', userKey);

    this.http.get<FeatureCollection>(this.envService.mapillaryApiUrl + `/images/`, {params})
      .subscribe((imgs: FeatureCollection) => {
        callback(imgs);
      }, error => {
        console.error(error);
        this.notificationsService.showErrorToast('Failed to get streetview image results from Mapillary!');
      });
  }

  public getMapillaryUser(): void {
    const params = new HttpParams()
      .set('client_id', this.envService.mapillaryClientId);

    this.http.get<MapillaryUser>(this.envService.mapillaryApiUrl + `/me/`, { params })
      .subscribe((mapillaryUser: MapillaryUser) => {
        this._mapillaryUser.next(mapillaryUser);
      }, error => {
        console.error(error);
        this.notificationsService.showErrorToast('Failed to get user information from Mapillary!');
      });
  }


  // TODO: Implement actual abortion of task
  public deleteStreetviewSession(pn: IProgressNotification): void {
    const baseUrl = this.envService.apiUrl + `/streetview/sequences/notifications/${pn.uuid}/`;

    this.notificationsService.progressNotifications
      .pipe(take(1)).subscribe((progressList: Array<IProgressNotification>) => {
        progressList = progressList.filter(n => n.uuid !== pn.uuid);
        this.notificationsService.progressNotifications = progressList;
      });

    this.http.delete(baseUrl).subscribe(() => {
      this.notificationsService.showSuccessToast('Deleted progress: ' + pn.uuid);
    }, error => {
      console.error(error);
      this.notificationsService.showErrorToast('Failed to abort streetview upload task!');
    });
  }

  public set streetviewerOpener(open: boolean) {
    this._streetviewerOpen.next(open);
  }

}
