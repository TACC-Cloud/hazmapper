import { Injectable } from '@angular/core';
import {HttpClient, HttpEventType, HttpHeaders} from '@angular/common/http';
import { AuthToken } from '../models/models';
import {BehaviorSubject, Observable, ReplaySubject, Subject} from 'rxjs';
import {LatLng} from 'leaflet';
import {FilterService} from './filter.service';
import {AssetFilters, FeatureAsset, IFeatureAsset, IFileImportRequest, IPointCloud, Overlay} from '../models/models';
import { Feature, FeatureCollection} from '../models/models';
import { environment } from '../../environments/environment';
import {filter, map, take, toArray} from 'rxjs/operators';
import * as querystring from 'querystring';
import {RemoteFile} from 'ng-tapis';
import {PathTree} from '../models/path-tree';
import {NotificationsService} from './notifications.service';
import {StreetviewAuthentication} from '../models/streetview'
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class StreetviewService {
  private _assetFilters: AssetFilters;
  private _streetviewAuthStatus: BehaviorSubject<StreetviewAuthentication> = new BehaviorSubject<StreetviewAuthentication>({google: false, mapillary: false});
  private streetviewAuthStatus$ = this._streetviewAuthStatus.asObservable();

  private _googleAccessToken: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private googleAccessToken$ = this._googleAccessToken.asObservable();

  private _mapillaryAccessToken: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private mapillaryAccessToken$ = this._mapillaryAccessToken.asObservable();

  private _currentService: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private currentService$ = this._currentService.asObservable();

  private _streetviewRedirect: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private streetviewRedirect$ = this._streetviewRedirect.asObservable();

  userToken: AuthToken;
  private LS_TOKEN_KEY = 'hazmapperToken';
  private LS_USER_KEY = 'hazmapperUser';

  constructor(private http: HttpClient, private filterService: FilterService, private notificationsService: NotificationsService, private router: Router) {
    this.filterService.assetFilter.subscribe( (next) => {
      this._assetFilters = next;
    });
  }

  public setToken(token: string, expires: number) {
    this.userToken = AuthToken.fromExpiresIn(token, expires);
    localStorage.setItem(this.LS_TOKEN_KEY, JSON.stringify(this.userToken));
    // TODO: route to currently activated
    //       or maybe handle it in / route's app-routing-module.ts
    this.router.navigate(['/']);
  }

  public getToken(params: any, service: string) {
    if (service == 'google') {
      const payload = new FormData();

      payload.append('code', params.code);
      payload.append('grant_type', 'authorization_code')
      payload.append('client_id', environment.googleClientId);
      payload.append('client_secret', environment.googleClientSecret);
      payload.append('redirect_uri', 'http://localhost:4200/streetview/google');

      this.http.post<any>(
        environment.googleTokenURL,
        payload
      ).subscribe( (resp ) => {
        this._googleAccessToken.next(resp.access_token);
        this.authorize(service);
      });
    } else {
      // TODO Change to authorization code
      this._mapillaryAccessToken.next(params.access_token);
      this.authorize(service);
    }

    this.router.navigate(['/']);
  }

  authorize(service: string) {
    this.streetviewAuthStatus$
      .pipe(take(1))
      .subscribe((auth: StreetviewAuthentication) => {
        auth[service] = true;
        this._streetviewAuthStatus.next(auth);
      })
  }

  // TODO {For both google and mapillary} These should trigger only when refresh token expires or first time login
  // TODO Check for access_token/refresh_token first
  // TODO Handle exceptions
  // TODO Set to local storage rather than in memory and set expiration time for
  // TODO Maybe handle in backend
  // TODO Persist in backend (google should store refresh token(more on this) and mapillary its access token as it never really expires unless revoked)
  login(svService: string) {
    this._currentService.next(svService);
    console.log(this._currentService.value);
    if (svService == 'google') {
      if (this._googleAccessToken.value == "")
        this.loginGoogle();
      else
        this.authorize(svService);
    } else {
      if (this._mapillaryAccessToken.value == "")
        this.loginMapillary();
      else
        this.authorize(svService);
    }
  }

  public checkAuthStatus() {
  }

  // TODO {For both google and mapillary} These should trigger only when refresh token expires or first time login
  public loginGoogle() {
    // TODO Change to streetview related scope and maybe profile?
    const scope = "https://www.googleapis.com/auth/userinfo.email";
    const redirectUri = "http://localhost:4200/streetview/google";
    window.location.href = environment.googleAuthURL + "?"
      + "&client_id=" + environment.googleClientId
      + "&scope=" + scope
      + "&redirect_uri=" + redirectUri
      + "&response_type=code"
  }

  // TODO Change response type to code once switching flow
  public loginMapillary() {
    const scope = "user:email+user:read+user:write+public:write+public:upload+private:read+private:write+private:upload";
    const redirectUri = "http://localhost:4200/streetview/mapillary";
    window.location.href = environment.mapillaryAuthURL + "?"
      + "&client_id=" + environment.mapillaryClientId
      + "&scope=" + scope
      + "&redirect_uri=" + redirectUri
      + "&response_type=token"
  }

  public logout(service: string) {
    this.streetviewAuthStatus$
      .pipe(take(1))
      .subscribe((auth: StreetviewAuthentication) => {
        auth[service] = false;
        this._streetviewAuthStatus.next(auth);
      })
  }

  public getAssetsFromGoogle() {
  }

  public getAssetsFromMapillary() {
  }

  // TODO: Change to Authorization Code flow once they support it
  //       Not sure if they will.
  public mapillaryGetToken() {

  }

  // TODO: Change to Authorization Code flow once they support it
  //       Not sure if they will.
  public googleGetToken() {

  }

  public set streetviewRedirect(service: string) {
    let url = '';
    if (service == "google") {
      url = "https://mapillary"
    } else {

    }
    this._streetviewRedirect.next(url)
  }

  public get streetviewRedirect() {
    return this._streetviewRedirect.value;
  }


  public set streetviewAuthStatus(auth: any) {
    this._streetviewAuthStatus.next(auth);
  }

  public get streetviewAuthStatus(): any {
    return this.streetviewAuthStatus$;
  }

  public set currentService(sv: any) {
    this._currentService.next(sv);
  }

  public get currentService(): any {
    return this.currentService$;
  }
}
