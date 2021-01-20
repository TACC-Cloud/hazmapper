import { Injectable } from '@angular/core';
import {HttpClient, HttpEventType, HttpHeaders} from '@angular/common/http';
import { AuthToken, Project } from '../models/models';
import {BehaviorSubject, Observable, ReplaySubject, Subject} from 'rxjs';
import {LatLng} from 'leaflet';
import {IProjectUser} from '../models/project-user';
import {FilterService} from './filter.service';
import {FeatureAsset, IFeatureAsset, IFileImportRequest, IPointCloud, Overlay} from '../models/models';
import { Feature, FeatureCollection} from '../models/models';
import { environment } from '../../environments/environment';
import {filter, map, take, toArray} from 'rxjs/operators';
import * as querystring from 'querystring';
import {RemoteFile} from 'ng-tapis';
import {PathTree} from '../models/path-tree';
import {NotificationsService} from './notifications.service';
import {StreetviewAuthentication, StreetviewTokens} from '../models/streetview'
import {ProjectsService} from './projects.service';
import {AuthenticatedUser, AuthService} from './authentication.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class StreetviewService {

  private MAPILLARY_TOKEN_KEY: string = "mapillaryToken";
  private GOOGLE_TOKEN_KEY: string = "googleToken";

  private mapillaryToken: string;
  private googleToken: string;

  private _googleAccessToken: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private googleAccessToken$ = this._googleAccessToken.asObservable();

  private _mapillaryAccessToken: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private mapillaryAccessToken$ = this._mapillaryAccessToken.asObservable();

  private _streetviewTokens: BehaviorSubject<StreetviewTokens> = new BehaviorSubject<StreetviewTokens>({mapillary: '', google: ''});
  private streetviewTokens$ = this._streetviewTokens.asObservable();

  private currentUser: AuthenticatedUser;
  private activeProject: Project;
  private streetviewUser: IProjectUser;
  userToken: AuthToken;
  private LS_TOKEN_KEY = 'hazmapperToken';
  private LS_USER_KEY = 'hazmapperUser';

  constructor(private http: HttpClient, private filterService: FilterService, private notificationsService: NotificationsService, private router: Router, private projectsService: ProjectsService, private authService: AuthService) {
    this.authService.currentUser.subscribe( (next) => {
      this.currentUser = next;
    });
    this.projectsService.activeProject.subscribe( (next) => {
      this.activeProject = next;
    });
    // this.projectsService.projectUsers$.subscribe( (next: Array<IProjectUser>) => {
    //   if (next) {
    //     this.streetviewUser = next.find((a) => a.username == this.currentUser.username)
    //     if (this.streetviewUser.streetviewToken == undefined) {
    //       this.streetviewUser.streetviewToken = {google: "", mapillary: ""};
    //     }
    //   }
    // });
  }

  public setToken(token: string, expires: number) {
    this.userToken = AuthToken.fromExpiresIn(token, expires);
    localStorage.setItem(this.LS_TOKEN_KEY, JSON.stringify(this.userToken));
    // TODO: route to currently activated
    //       or maybe handle it in / route's app-routing-module.ts
    this.router.navigate(['/']);
  }

  // TODO Split to different error cases (called from callback)
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
        // this._googleAccessToken.next(resp.access_token);
        // this.authorizeToken(service, resp.access_token);
        // console.log(this._streetviewTokens.value);
        // this.setUserStreetviewTokens('google', this._streetviewTokens.value)
        this.setUserStreetviewTokens('google', resp.access_token);
        // this.authorize(service);
      });
    } else {
      // TODO Change to authorization code
      // this.authorizeToken(service, params.access_token);
      // this.setUserStreetviewTokens(this._streetviewTokens.value)
      this.setUserStreetviewTokens('mapillary', params.access_token);
      // this._mapillaryAccessToken.next(params.access_token);
      // this.authorize(service);

    }

    this.router.navigate(['/']);
  }

  // authorize(service: string) {
  //   this.streetviewAuthStatus$
  //     .pipe(take(1))
  //     .subscribe((auth: StreetviewAuthentication) => {
  //       auth[service] = true;
  //       this._streetviewAuthStatus.next(auth);
  //     })
  // }

  // authorizeToken(service: string, token: string) {
    // this.streetviewTokens$
    //   .pipe(take(1))
    //   .subscribe((auth: StreetviewTokens) => {
    //     console.log(auth);
    //     auth[service] = token;
    //     this._streetviewTokens.next(auth);
    //   })
  // }

  isLoggedIn(service: string) {
    if (service == 'google') {
      return this.googleToken;
    } else {
      return this.mapillaryToken;
    }
  }

  // TODO {For both google and mapillary} These should trigger only when refresh token expires or first time login
  // TODO Check for access_token/refresh_token first
  // TODO Handle exceptions
  // TODO Set to local storage rather than in memory and set expiration time for
  // TODO Maybe handle in backend
  // TODO Persist in backend (google should store refresh token(more on this) and mapillary its access token as it never really expires unless revoked)
  login(svService: string) {
    // TODO The next part should wait on this
    this.getUserStreetviewTokens();

    if (svService == 'google') {
      if (!localStorage.getItem(this.GOOGLE_TOKEN_KEY))
        this.loginGoogle();
    } else {
      if (!localStorage.getItem(this.MAPILLARY_TOKEN_KEY))
        this.loginMapillary();
    }
  }

  // TODO {For both google and mapillary} These should trigger only when refresh token expires or first time login
  // TODO Should check if expired (in callback)
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

  setUserStreetviewTokens(service: string, token: string): void {
    console.log(service);
    const payload = {
      service,
      token
    };
    // this.http.post(environment.apiUrl + `/projects/${proj.id}/users/${uname}/streetview`, streetviewTokens)
    this.http.post(environment.apiUrl + `/users/streetview`, payload)
      .subscribe( (resp) => {
        this.getUserStreetviewTokens();
      });
  }

  getUserStreetviewTokens(): void {
    this.http.get<any>(environment.apiUrl + `/users/streetview`).subscribe(resp => {
      console.log("Myresponse");
      console.log(resp);
      // if (resp.streetview_tokens.mapillary) {
      if (resp.mapillary) {
        // this.mapillaryToken = resp.streetview_tokens.mapillary;
        this.mapillaryToken = resp.mapillary;
        localStorage.setItem(this.MAPILLARY_TOKEN_KEY, this.mapillaryToken);
      }

      // if (resp.streetview_tokens.google) {
      if (resp.google) {
        // this.googleToken = resp.streetview_tokens.google;
        this.googleToken = resp.google;
        localStorage.setItem(this.GOOGLE_TOKEN_KEY, this.googleToken);
      }
      // local(resp.streetview_tokens.google);
      // this._streetviewTokens.next(resp.streetview_tokens);
    });
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
    if (service == 'google') {
      this.googleToken = null;
      localStorage.removeItem(this.GOOGLE_TOKEN_KEY);
    } else {
      this.mapillaryToken = null;
      localStorage.removeItem(this.MAPILLARY_TOKEN_KEY);
    }
    // this.streetviewTokens$
    //   .pipe(take(1))
    //   .subscribe((auth: StreetviewTokens) => {
    //     auth[service] = '';
    //     this._streetviewTokens.next(auth);
    //   })
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

  public set streetviewTokens(auth: any) {
    this._streetviewTokens.next(auth);
  }

  public get streetviewTokens(): any {
    return this.streetviewTokens$;
  }
}
