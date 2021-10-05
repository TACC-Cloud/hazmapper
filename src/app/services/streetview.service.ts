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
import {vt2geojson} from '@mapbox/vt2geojson';
import SphericalMercator from '@mapbox/sphericalmercator';

@Injectable({
  providedIn: 'root'
})
export class StreetviewService {
  // private _streetviews: BehaviorSubject<Array<Streetview>> = new BehaviorSubject([]);
  // public streetviews: Observable<Array<Streetview>> = this._streetviews.asObservable();
  // private _activeStreetview: BehaviorSubject<Streetview> = new BehaviorSubject(null);
  // public activeStreetview: Observable<Streetview> = this._activeStreetview.asObservable();
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

  constructor(private http: HttpClient,
              private notificationsService: NotificationsService,
              private streetviewAuthentication: StreetviewAuthenticationService,
              private envService: EnvService) {
  }


  public addOrganization(streetviewId: number, name: string, key: string): void {
    const payload = {
      name,
      key
    };

    this.http.post(this.envService.apiUrl + `/streetview/${streetviewId}/organization`, payload)
      .subscribe(() => {
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

  public updateOrganization(streetviewId: number, organizationId: number, name: string, key: string): void {
    const payload = {
      name,
      key
    };

    this.http.put(this.envService.apiUrl + `/streetview/${streetviewId}/organization/${organizationId}`, payload)
      .subscribe(() => {
        return;
      }, error => {
        console.error(error);
        this.notificationsService.showErrorToast('Failed to get streetviews from Geoapi!');
        });
  }

  public deleteOrganization(streetviewId: number, organizationId: number): void {
    this.http.delete(this.envService.apiUrl + `/streetview/${streetviewId}/organization/${organizationId}`)
      .subscribe(() => {
        return;
      }, error => {
        console.error(error);
        });
  }

  // public addSequenceToPath(service: string, sequences: Array<string>, dir: RemoteFile): void {
  public addSequenceToPath(streetviewId: number, sequenceId: string, dir: RemoteFile): void {
    const payload = {
      streetviewId,
      sequenceId,
      dir
    };

    this.http.post(this.envService.apiUrl + `/streetview/sequences/`, payload)
      .subscribe(() => {
        this.streetviewAuthentication.getStreetviews();
      }, error => {
        console.error(error);
        this.notificationsService.showErrorToast('Failed to get streetviews from Geoapi!');
      });
  }

  // public removeStreetview(streetviewId: number): void {
  //   this.http.delete(
  //     this.envService.apiUrl + `/streetview/${streetviewId}/`).subscribe(() => {
  //       this.getStreetviews();
  //     }, error => {
  //       console.error(error);
  //       this.notificationsService.showErrorToast('Failed to remove streetviews from Geoapi!');
  //     });
  // }

//   public removeStreetviewSequence(sequenceId: number): void {
//     this.http.delete(
//       this.envService.apiUrl +
//         `/streetview/sequences/${sequenceId}/`)
//       .subscribe(() => {
//         this.getStreetviews();
//       }, error => {
//         console.error(error);
//         this.notificationsService.showErrorToast('Failed to delete sequence from streetview collection!');
//       });
//   }

  // public convertToDisplaySequences(seq: StreetviewSequence): Observable<Feature> {
  //   const displaySequence: ReplaySubject<Feature> = new ReplaySubject(1);
  //   // NOTE: If there is not sequence key yet, try getting it with approximation (lat/lon,start/end)
  //   //       Also set the key if there is a key for that sequence feature.
  //   if (!seq.sequence_key) {
  //     this.getMapillarySequenceKeys(seq).subscribe((resp: HttpResponse<FeatureCollection>) => {
  //       if (resp.body.features.length) {
  //         const sequenceKey = resp.body.features[0].properties.key;
  //         this.setMapillarySequenceKeys(seq.id, sequenceKey);
  //         displaySequence.next(resp.body.features[0]);
  //       }
  //     }, error => {
  //       console.error(error);
  //       this.notificationsService.showErrorToast('Failed to get sequence results from Mapillary!');
  //     });
  //   } else {
  //     this.getMapillarySequence(seq.sequence_key).subscribe((sequence: Feature) => {
  //       displaySequence.next(sequence);
  //     }, error => {
  //       console.error(error);
  //       this.notificationsService.showErrorToast('Failed to get sequence from Mapillary!');
  //     });
  //   }
  //   return displaySequence;
  // }


  // public getStreetviews(): Observable<Streetview[]> {
  //   return this.http.get<Array<Streetview>>(this.envService.apiUrl + `/streetview/`)
  //   .pipe(
  //     tap((streetviews: Array<Streetview>) => {
  //       streetviews.forEach(e => {
  //         if (
  //           !this.streetviewAuthentication.isLoggedIn(e.service) &&
  //           e.token
  //         ) {
  //           this.streetviewAuthentication.setLocalToken(e.service, e.token);
  //         }
  //       });

  //       this._streetviews.next(streetviews);
  //       this._activeStreetview.next(streetviews[0]);
  //     }));
  // }


  // public getStreetviews(): void {
  //   this.setDisplaySequences([]);
  //   this.http.get<Array<Streetview>>(this.envService.apiUrl + `/streetview/`)
  //     .subscribe((streetviews: Array<Streetview>) => {
  //       // NOTE: Populate displaySequences for drawing
  //       for (const sv of streetviews) {
  //         for (const seq of sv.sequences) {
  //           this.convertToDisplaySequences(seq).subscribe((sequence: Feature) => {
  //             this.setDisplaySequences([...this.getDisplaySequences(), sequence]);
  //           });
  //         }
  //       }
  //       this._streetviews.next(streetviews);
  //     }, error => {
  //       console.error(error);
  //       this.notificationsService.showErrorToast('Failed to get streetview for user from Geoapi!');
  //     });
  // }

  // NOTE From mapillary
  // public getMapillarySequenceKeys(sequence: StreetviewSequence): Observable<HttpResponse<FeatureCollection>> {
  //   const userKey = localStorage.getItem('mapillaryUser');
  //   return this.searchMapillarySequence({
  //     userkeys: userKey,
  //     bbox: sequence.bbox,
  //     start_date: sequence.start_date,
  //     end_date: sequence.end_date
  //   });
  // }

  // NOT To geoapi
  // public setMapillarySequenceKeys(sequenceId: number, sequenceKey: string): void {
  //   const payload = {
  //     sequence_key: sequenceKey
  //   };
  //   this.http.put<StreetviewSequence>(this.envService.apiUrl + `/streetview/sequences/${sequenceId}/`,
  //                                     payload)
  //     .subscribe((streetviewSequence: StreetviewSequence) => {
  //       return;
  //     }, error => {
  //       console.error(error);
  //       this.notificationsService.showErrorToast('Failed to set sequence keys for streetview sequence in Geoapi!');
  //     });
  // }

  public uploadPathToStreetviewService(dir: RemoteFile, service: string): void {
    const payload = {
      system_id: dir.system,
      path: dir.path,
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

  // TODO
  // Google API

  // public getGoogleUser(): void {
  //   const params = new HttpParams()
  //     .set('client_id', this.envService.googleClientId);

  //   this.http.get<GoogleUser>('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', { params })
  //     .subscribe((googleUser: GoogleUser) => {
  //       this._googleUser.next(googleUser);
  //     }, error => {
  //       console.error(error);
  //       this.notificationsService.showErrorToast('Failed to get user information from Google!');
  //     });
  // }

  // getGoogleSequences(): void {
  //   const userKey = this._googleUser.value.key;
  //   this._googleSequences.next([]);
  // }

  // Mapillary API


  // public getMapillaryTiles() {
  //   const token: AuthToken = this.streetviewAuthentication.getLocalToken('mapillary');
    // this.streetviewAuthentication.streetviews.subscribe(svs => {
      // console.log(svs);
      // svs.forEach(sv => {
      //   // console.log(sv);
      //   sv.instances.forEach(svi => {
      //     // console.log(svi);
      //     svi.sequences.forEach(svq => {
      //       // console.log(svq);
      //       console.log(svq.bbox);
      //       console.log(svq.start_date);
      //       console.log(svq.end_date);
      //       const bboxArray = svq.bbox.split(',');
      //       console.log(bboxArray);
      //       const merc = new SphericalMercator({
      //         size: 256,
      //         antimeridian: true
      //       });
      //       // const bbox3 = [-80.13423442840576, 25.77376933762778, -80.1264238357544, 25.788608487732198];
      //       // const coords = merc.xyz(svq.bbox, 14);
      //       const targetUrl = 
      //         'https://tiles.mapillary.com/maps/vtp/mly_map_feature_point/2/14/0/6976?access_token=' +
      //         token.token;
 // // 12.967,55.597,13.008,55.607           
      //       // const targetUrl = 
      //       //   `https://graph.mapillary.com/images?access_token=${token.token}&fields=id&bbox=-122.284,47.557,-122.283,47.559`

      //       // this.http.get<any>(targetUrl)
      //       this.http.get
      //         (targetUrl, { responseType: 'text' })
      //         .subscribe(resp => {
      //           console.log(resp);
      //           // console.log("Whack")
      //         });

            // vt2geojson({
            //   uri: 'targetUrl',
            //   layer: 'point'
            // }, function (err, result) {
            //   if (err) throw err;
            //   console.log(result); // => GeoJSON FeatureCollection
            // });

            // this.http.get<any>('https://tiles.mapillary.com/' +
            //   `maps/vtp/mly_map_feature_point/2/14/300/10000?access_token=${token.token}`)
            //   // `maps/vtp/mly1_public/2/14/14000/6977?access_token=${token.token}`)
            //   // `maps/vtp/mly_map_feature_point/2/14/14000/6977?access_token=${authtok}`)
            //   // `maps/vtp/mly1_public/2/14/14000/6977`)
            //   // `maps/vtp/mly_map_feature_point/2/14/14000/6977`)
            // // `images?access_token=${token.token}&fields=id&bbox=${svq.bbox}`)
            //   .subscribe(resp => {
            //     console.log(resp.content);
            //   });
            // https://tiles.mapillary.com/maps/vtp/mly1_public/2/{z}/{x}/{y}?access_token=${access_token};

            // for (let i = coords.minX; i < coords.maxX; ++i) {
            //   for (let j = coords.minY; j < coords.maxY; ++j) {
            //     // console.log(`${i} and ${j} and ${zoom} and ${this.envService.streetviewEnv.mapillary.tileUrl}maps/vtp/mly_map_feature_point/2/${zoom}/${i}/${j}?access_token=${token.token}`);
            //     this.http.get<any>(this.envService.streetviewEnv.mapillary.tileUrl +
            //       `maps/vtp/mly_map_feature_point/2/${zoom}/${i}/${j}?access_token=${token.token}`)
            //       // `images?access_token=${token.token}&fields=id&bbox=${svq.bbox}`)
            //       .subscribe(resp => {
            //         console.log(resp);
            //       });
// //               }
            // }
            // const coords = merc.xyz(bbox2, 14);
            // console.log(coords.minX);
            // const coords = {
            //   x: 672440,
            //   y: 1465680,
            //   z: 22
            // };

            // this.http.get<any>(this.envService.streetviewEnv.mapillary.tileUrl +
            // this.http.get<any>(this.envService.streetviewEnv.mapillary.apiUrl +
            //   // `maps/vtp/mly_map_feature_point/2/${14}/${16383}/${6976}?access_token=${token.token}`)
            //   `images?access_token=${token.token}&fields=id&bbox=${svq.bbox}`)
            //   .subscribe(resp => {
            //     console.log(resp);
            //   });
          // })
        // this.http.get<any>(this.envService.streetviewEnv.mapillary.tileUrl +
        //   `maps/vtp/mly_map_feature_point/2/${}/${}/${}?access_token=${token.token}`);

        // })
      // });
    // });

    // tile_url = 'https://tiles.mapillary.com/maps/vtp/mly_map_feature_point/2/{}/{}/{}?access_token={}'.format(tile.z,tile.x,tile.y,access_token)
  // }
  // public searchMapillarySequence(params: any, pageUrl: string = ''): Observable<HttpResponse<FeatureCollection>> {
  //   if (pageUrl === '') {
  //     params = new HttpParams({fromObject: params})
  //       .set('client_id', this.envService.mapillaryClientId);
  //     return this.http.get<FeatureCollection>(this.envService.mapillaryApiUrl + `/sequences/`,
  //                          {params, observe: 'response'});
  //   } else {
  //     return this.http.get<FeatureCollection>(pageUrl, {observe: 'response'});
  //   }
  // }

  // public getMapillarySequence(sequenceKey: string): Observable<Feature> {
  //   const params = new HttpParams()
  //     .set('client_id', this.envService.mapillaryClientId);

  //   return this.http.get<Feature>(this.envService.mapillaryApiUrl + `/sequences/${sequenceKey}`,
  //                        {params});
  // }

  // Get all sequences for a User
  // public getMapillarySequences(pageUrl: string = ''): void {
  //   const userKey = localStorage.getItem('mapillaryUser');
  //   this.searchMapillarySequence({userkeys: userKey, per_page: 10}, pageUrl)
  //     .subscribe((resp: HttpResponse<FeatureCollection>) => {
  //       const pages = parseLinkHeader(resp.headers.get('Link'));
  //       this._nextPage.next(pages.next);
  //       const prevSequence = this._mapillarySequences.getValue();
  //       this._mapillarySequences.next([...prevSequence, ...resp.body.features]);
  //     }, error => {
  //       console.error(error);
  //       this.notificationsService.showErrorToast('Failed to get sequence results from Mapillary!');
  //     });
  // }

  // public clearMapillarySequences(): void {
  //   this._mapillarySequences.next([]);
  // }

  // public clearMapillaryDisplaySequences(): void {
  //   this.setDisplaySequences([]);
  // }

  // public setDisplaySequences(features: Array<Feature>): void {
  //   this._streetviewDisplaySequences.next({type: 'FeatureCollection', features});
  // }

  // public getDisplaySequences(): Array<Feature> {
  //   return this._streetviewDisplaySequences.value.features;
  // }

  // public getMapillaryImage(imageKey: string): Observable<Feature> {
  //   const params = new HttpParams()
  //     .set('client_id', this.envService.mapillaryClientId);

  //   return this.http.get<Feature>(this.envService.mapillaryApiUrl + `/images/${imageKey}`, {params});
  // }

  // TODO Replaces getMapillaryImages()
  // Use https://github.com/mapbox/vt2geojson (@mapbox/vt2geojson)
  // getMapillaryTiles(sequence: StreetviewSequence): void {


  // }

  // TODO: Not supported
  // public getMapillaryImages(sequence: StreetviewSequence): void {
  //   const userKey = localStorage.getItem('mapillaryUser');
  //   let params = {};
  //   if (!sequence.sequence_key) {
  //     params = {
  //       bbox: sequence.bbox,
  //       start_date: sequence.start_date,
  //       end_date: sequence.end_date,
  //       userkeys: userKey
  //     };
  //   } else {
  //     params = {sequence_keys: sequence.sequence_key};
  //   }

  //   params = new HttpParams({fromObject: params})
  //     .set('client_id', this.envService.mapillaryClientId)
  //     .set('per_page', '1000');

  //   this.http.get<FeatureCollection>(this.envService.mapillaryApiUrl + `/images/`, {params})
  //     .subscribe((imgs: FeatureCollection) => {
  //       imgs.features = imgs.features.map( (feat: Feature) => new Feature(feat));
  //       this._mapillaryImages.next(imgs);
  //     }, error => {
  //       console.error(error);
  //       this.notificationsService.showErrorToast('Failed to get streetview images from Mapillary!');
  //     });
  // }

  // TODO: Not supported
  // public searchMapillaryImages(params: any, callback: MapillaryImageSearchCallback): void {
  //   const userKey = localStorage.getItem('mapillaryUser');
  //   params = new HttpParams({fromObject: params})
  //     .set('client_id', this.envService.mapillaryClientId)
  //     .set('per_page', '1000')
  //     .set('userkeys', userKey);

  //   this.http.get<FeatureCollection>(this.envService.mapillaryApiUrl + `/images/`, {params})
  //     .subscribe((imgs: FeatureCollection) => {
  //       callback(imgs);
  //     }, error => {
  //       console.error(error);
  //       this.notificationsService.showErrorToast('Failed to get streetview image results from Mapillary!');
  //     });
  // }

  // TODO: Not supported
  // public getMapillaryUser(): void {
  //   const params = new HttpParams()
  //     .set('client_id', this.envService.mapillaryClientId);

  //   this.http.get<MapillaryUser>(this.envService.mapillaryApiUrl + `/me/`, { params })
  //     .subscribe((mapillaryUser: MapillaryUser) => {
  //       this._mapillaryUser.next(mapillaryUser);
  //     }, error => {
  //       console.error(error);
  //       this.notificationsService.showErrorToast('Failed to get user information from Mapillary!');
  //     });
  // }


  // TODO: Implement actual abortion of task
  // public deleteStreetviewSession(pn: IProgressNotification): void {
  //   const baseUrl = this.envService.apiUrl + `/streetview/sequences/notifications/${pn.uuid}/`;

  //   this.notificationsService.progressNotifications
  //     .pipe(take(1)).subscribe((progressList: Array<IProgressNotification>) => {
  //       progressList = progressList.filter(n => n.uuid !== pn.uuid);
  //       this.notificationsService.progressNotifications = progressList;
  //     });

  //   this.http.delete(baseUrl).subscribe(() => {
  //     this.notificationsService.showSuccessToast('Deleted progress: ' + pn.uuid);
  //   }, error => {
  //     console.error(error);
  //     this.notificationsService.showErrorToast('Failed to abort streetview upload task!');
  //   });
  // }
  
  public testRequest() {
    const token = this.streetviewAuthentication.getLocalToken('mapillary').token;
    const headers = new HttpHeaders()
      .set('Authorization', 'OAuth ' + token);
    const params = new HttpParams()
      .set('fields', 'id,captured_at');

    this.http.get<Array<Streetview>>('https://graph.mapillary.com/235039505057113', {params, headers}).subscribe(e => {
      console.log(e);
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

}
