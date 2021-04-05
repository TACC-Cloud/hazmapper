import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthToken } from '../models/models';
import { Router } from '@angular/router';
import { AuthService } from './authentication.service';
import { ProjectsService } from './projects.service';
import { EnvService } from '../services/env.service';

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

  public setRemoteToken(service: string, projectId?: number, username?: string) {
    const projId = projectId ? projectId : this._projectId;
    const uname = username ? username : this._username;
    const token = JSON.parse(this.getLocalToken(service)).token;

    const payload = {token};

    this.http.post<any>(this.envService.apiUrl + `/projects/${projId}/users/${uname}/streetview/${service}`, payload).subscribe(resp => {
      console.log(resp);
    });
  }

  private deleteRemoteToken(service: string) {
    this.http.delete<any>(this.envService.apiUrl + `/projects/${this._projectId}/users/${this._username}/streetview/${service}`);
  }

  private updateRemoteToken(service: string) {
    const token = this.getLocalToken(service);
    const payload = {token};
    this.http.put<any>(this.envService.apiUrl + `/projects/${this._projectId}/users/${this._username}/streetview/${service}`, payload);
  }

  public isLoggedIn(service: string) {
    return this.getLocalToken(service);
  }

  public login(service: string) {
    const localToken = this.getLocalToken(service);
    if (!localToken) {
      this.streetviewTokenRequest(service);
    } else {
      this.checkExpiration(service);
    }
  }

  public logout(service: string): void {
    this.deleteLocalToken(service);
    this.deleteRemoteToken(service);
  }

  private streetviewTokenRequest(service: string): void {
    const mapillaryScope = 'user:email+user:read+user:write+public:write+public:upload+private:read+private:write+private:upload';
    const googleScope = 'https://www.googleapis.com/auth/streetviewpublish+https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile';
    const mapillaryAuthUrl = 'https://www.mapillary.com/connect';
    const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

    const state = JSON.stringify({
      origin_url: this.router.url,
      service,
      projectId: this._projectId,
      username: this._username
    });

    const callback = this.envService.rootUrl + this.envService.baseHref + 'streetview/callback';
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

  private setGoogleToken(code: string, projectId: number, username: string) {
    const googleTokenUrl = 'https://oauth2.googleapis.com/token';

    const payload = new FormData();
    const callback = this.envService.rootUrl + this.envService.baseHref + 'streetview/callback';

    payload.append('code', code);
    payload.append('grant_type', 'authorization_code');
    payload.append('client_id', this.envService.googleClientId);
    payload.append('client_secret', this.envService.googleClientSecret);
    payload.append('redirect_uri', callback);

    this.http.post<any>(googleTokenUrl, payload)
      .subscribe( (resp ) => {
        const token = {
          access_token: resp.access_token,
          expiration_date: resp.expiration_date
        };
        this.setLocalToken('google', token);
        this.setRemoteToken('google', projectId, username);
      });
  }

  private testRequest(service: string): void {
    if (service === 'google') {
      this.testGetGoogleUser(service);
    } else {
      this.testGetMapillaryUser(service);
    }
  }

  public setStreetviewToken(projectId: number, username: string, service: string, authStr: string) {
    if (service === 'google') {
      this.setGoogleToken(authStr, projectId, username);
    } else {
      this.setMapillaryToken(authStr, projectId, username);
      this.setMapillaryUserKey();
    }
  }

  private setMapillaryToken(accessToken: string, projectId: number, username: string) {
    const token = {
      access_token: accessToken
    };
    this.setLocalToken('mapillary', token);
    this.setRemoteToken('mapillary', projectId, username);
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

  public checkExpiration(service: string): void {
    const token: AuthToken = JSON.parse(this.getLocalToken(service));
    if (token) {
      if (token.expires instanceof Date) {
        if (token.isExpired()) {
          this.deleteLocalToken(service);
          this.streetviewTokenRequest(service);
        }
      } else {
        this.testRequest(service);
      }
    }
  }

  private testGetGoogleUser(service: string): void {
    const params = new HttpParams()
      .set('client_id', this.envService.googleClientId);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + JSON.parse(this.getLocalToken(service)).token
    });

    this.http.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', { headers, params })
      .subscribe(resp => {
        return;
      }, error => {
        this.deleteLocalToken(service);
        this.streetviewTokenRequest(service);
      });
  }

  public setMapillaryUserKey(): any {
    this.checkExpiration('mapillary');
    const params = new HttpParams()
      .set('client_id', this.envService.mapillaryClientId);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + JSON.parse(this.getLocalToken('mapillary')).token
    });

    return this.http.get(this.envService.mapillaryApiUrl + `/me/`, { headers, params })
      .subscribe((resp: any) => {
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



  // NOTE: In case user revokes access
  private testGetMapillaryUser(service: string): void {
    const params = new HttpParams()
      .set('client_id', this.envService.mapillaryClientId);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + JSON.parse(this.getLocalToken(service)).token
    });

    this.http.get(this.envService.mapillaryApiUrl + `/me/`, { headers, params })
      .subscribe(resp => {
        return;
      }, error => {
        this.deleteLocalToken(service);
        this.streetviewTokenRequest(service);
      });
  }
}
