import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthToken } from '../models/models';
import { Router } from '@angular/router';
import { AuthService } from './authentication.service';
import { ProjectsService } from './projects.service';
import { EnvService } from '../services/env.service';
import { MapillaryUser } from '../models/streetview';

@Injectable({
  providedIn: 'root'
})
export class StreetviewAuthenticationService {

  private MAPILLARY_TOKEN_KEY = 'mapillaryToken';
  private MAPILLARY_USER_KEY = 'mapillaryUser';
  private GOOGLE_TOKEN_KEY = 'googleToken';
  private _username: string;
  private _projectId: number;

  constructor(private http: HttpClient,
              private authService: AuthService,
              private projectsService: ProjectsService,
              private envService: EnvService,
              private router: Router) {
    this.authService.currentUser.subscribe(u => this._username = u ? u.username : null);
    this.projectsService.activeProject.subscribe(p => this._projectId = p ? p.id : null);
  }

  public setRemoteToken(service: string): void {
    const token = JSON.parse(this.getLocalToken(service)).token;
    const payload = {token};

    this.http.post(this.envService.apiUrl + `/streetview/${service}/token/`, payload).subscribe();
  }

  private deleteRemoteToken(service: string): void {
    this.http.delete<any>(this.envService.apiUrl + `/streetview/${service}/token/`).subscribe();
  }

  public isLoggedIn(service: string) {
    const userToken: AuthToken = JSON.parse(this.getLocalToken(service));
    let notExpired = true;
    if (userToken && userToken.expires instanceof Date) {
      if (userToken.isExpired()) {
        notExpired = false;
      }
    }

    return userToken && notExpired;
  }

  public login(service: string) {
    this.streetviewTokenRequest(service);
  }

  public logout(service: string): void {
    this.deleteLocalToken(service);
    this.deleteRemoteToken(service);
  }

  private streetviewTokenRequest(service: string): void {
    const mapillaryScope = 'user:email+user:read+user:write+public:write+public:upload+private:read+private:write+private:upload';
    // tslint:disable-next-line:max-line-length
    const googleScope = 'https://www.googleapis.com/auth/streetviewpublish+https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile';
    const mapillaryAuthUrl = 'https://www.mapillary.com/connect';
    const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

    const state = JSON.stringify({
      origin_url: this.router.url,
      service,
      projectId: this._projectId,
      username: this._username
    });

    const callback = location.origin + this.envService.baseHref + 'streetview/callback';
    let url = '';

    if (service === 'google') {
      url = googleAuthUrl + '?'
        + '&client_id=' + this.envService.googleClientId
        + '&scope=' + googleScope
        + '&redirect_uri=' + callback
        + '&response_type=code'
        + '&state=' + state;
    } else {
      url = mapillaryAuthUrl + '?'
        + '&client_id=' + this.envService.mapillaryClientId
        + '&scope=' + mapillaryScope
        + '&redirect_uri=' + callback
        + '&response_type=token'
        + '&state=' + state;
    }

    window.location.href = url;
  }

  private setGoogleToken(code: string) {
    const googleTokenUrl = 'https://oauth2.googleapis.com/token';

    const payload = new FormData();
    const callback = location.origin + this.envService.baseHref + 'streetview/callback';

    payload.append('code', code);
    payload.append('grant_type', 'authorization_code');
    payload.append('client_id', this.envService.googleClientId);
    payload.append('client_secret', this.envService.googleClientSecret);
    payload.append('redirect_uri', callback);

    this.http.post<any>(googleTokenUrl, payload)
      .subscribe((resp) => {
        const token = {
          access_token: resp.access_token,
          expiration_date: resp.expiration_date
        };
        this.setLocalToken('google', token);
        this.setRemoteToken('google');
      });
  }

  public setStreetviewToken(service: string, authStr: string) {
    if (service === 'google') {
      this.setGoogleToken(authStr);
    } else {
      this.setMapillaryToken(authStr);
      this.setMapillaryUserKey();
    }
  }

  private setMapillaryToken(accessToken: string) {
    const token = {
      access_token: accessToken
    };
    this.setLocalToken('mapillary', token);
    this.setRemoteToken('mapillary');
  }

  private deleteLocalToken(service: string) {
    if (service === 'google') {
      localStorage.removeItem(this.GOOGLE_TOKEN_KEY);
    } else {
      localStorage.removeItem(this.MAPILLARY_TOKEN_KEY);
    }
  }

  public getLocalToken(service: string) {
    if (service === 'google') {
      return localStorage.getItem(this.GOOGLE_TOKEN_KEY);
    } else {
      return localStorage.getItem(this.MAPILLARY_TOKEN_KEY);
    }
  }

  private setLocalToken(service: string, token: any) {
    let userToken: AuthToken;
    if (token.expiration_date) {
      userToken = AuthToken.fromExpiresIn(token.access_token, token.expiration_date);
    } else {
      userToken = new AuthToken(token.access_token);
    }

    if (service === 'google') {
      localStorage.setItem(this.GOOGLE_TOKEN_KEY, JSON.stringify(userToken));
    } else {
      localStorage.setItem(this.MAPILLARY_TOKEN_KEY, JSON.stringify(userToken));
    }
  }

  public setMapillaryUserKey(): any {
    const params = new HttpParams()
      .set('client_id', this.envService.mapillaryClientId);
    return this.http.get<MapillaryUser>(this.envService.mapillaryApiUrl + `/me/`, { params })
      .subscribe((resp: MapillaryUser) => {
        localStorage.setItem(this.MAPILLARY_USER_KEY, resp.key);
        console.log(resp);
      }, error => {
        console.log(error);
      });
  }

  public deleteMapillaryUserKey(): any {
    localStorage.removeItem(this.MAPILLARY_USER_KEY);
  }

  public getMapillaryUserKey(): any {
    localStorage.getItem(this.MAPILLARY_USER_KEY);
  }
}
