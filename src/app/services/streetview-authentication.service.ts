import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthToken } from '../models/models';
import { Router } from '@angular/router';
import { AuthService } from './authentication.service';
import {ProjectsService} from './projects.service';
import {EnvService} from '../services/env.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {NotificationsService} from './notifications.service';
import {tap} from 'rxjs/operators';
import { StreetviewRequest, Streetview, StreetviewOrganization, StreetviewSequence, StreetviewInstance } from '../models/streetview';

@Injectable({
  providedIn: 'root'
})
export class StreetviewAuthenticationService {
  private _activeStreetview: BehaviorSubject<Streetview> = new BehaviorSubject(null);
  public activeStreetview$: Observable<Streetview> = this._activeStreetview.asObservable();
  private _streetviews: BehaviorSubject<Array<Streetview>> = new BehaviorSubject([]);
  public streetviews$: Observable<Array<Streetview>> = this._streetviews.asObservable();

  private _activeOrganization: BehaviorSubject<StreetviewOrganization> = new BehaviorSubject(null);
  public activeOrganization: Observable<StreetviewOrganization> = this._activeOrganization.asObservable();
  private _organizations: BehaviorSubject<Array<StreetviewOrganization>> = new BehaviorSubject([]);
  public organizations: Observable<Array<StreetviewOrganization>> = this._organizations.asObservable();

  private TOKEN_STORE = {
    google: 'googleToken',
    mapillary: 'mapillaryToken'
  };
  private _username: string;
  private _projectId: number;

  constructor(private http: HttpClient,
              private authService: AuthService,
              private projectsService: ProjectsService,
              private notificationsService: NotificationsService,
              private envService: EnvService,
              private router: Router) {
    this.authService.currentUser.subscribe(u => this._username = u ? u.username : null);
    this.projectsService.activeProject.subscribe(p => this._projectId = p ? p.id : null);
  }

  public isLoggedIn(service: string): boolean {
    const userToken: AuthToken = this.getLocalToken(service);
    return userToken && !userToken.isExpired();
  }

  public login(service: string) {
    this.tokenRequest(service);
  }

  public logout(service: string): void {
    localStorage.removeItem(this.TOKEN_STORE[service]);
  }

  public sequenceInStreetview(sequenceId: string): boolean {
    return this._activeStreetview.getValue().instances
      .some(instance => instance.sequences
        .some(sequence => {
          return sequence.sequence_id === sequenceId;
        }));
  }

  public getStreetviews(): Observable<Streetview[]> {
    return this.http.get<Array<Streetview>>(this.envService.apiUrl + `/streetview/`)
    .pipe(
      tap((streetviews: Array<Streetview>) => {
        this._streetviews.next(streetviews);
        this._activeStreetview.next(streetviews[0]);
        if (streetviews[0]) {
          this._organizations.next(streetviews[0].organizations);
          this._activeOrganization.next(streetviews[0].organizations[0]);
        }
        console.log(streetviews);
      }));
  }

  public createStreetview(data: StreetviewRequest) {
    return this.http.post<any>(this.envService.apiUrl + '/streetview/', data).pipe(
      tap((streetview: Streetview) => {
        this._activeStreetview.next(streetview);
      }));
  }

  public updateStreetview(streetviewId: number, data: StreetviewRequest) {
    return this.http.put<any>(this.envService.apiUrl + `/streetview/${streetviewId}/`, data).pipe(
      tap((streetview: Streetview) => {
        this._activeStreetview.next(streetview);
      }));
  }

  public deleteStreetview(streetviewId: number) {
    return this.http.delete<any>(this.envService.apiUrl + `/streetview/${streetviewId}/`).pipe(
      tap(() => {
        this._streetviews.next(this._streetviews.value.filter(sv => {
          return sv.id !== streetviewId;
        }));

        if (this._streetviews.value.length > 0) {
          this._activeStreetview.next(this._streetviews.value[0]);
        } else {
          this._activeStreetview.next(null);
        }
      }));
  }

  public updateStreetviewByService(service: string, data: StreetviewRequest) {
    return this.http.put<any>(this.envService.apiUrl + `/streetview/${service}/`, data).pipe(
      tap((streetview: Streetview) => {
        this._activeStreetview.next(streetview);
      }));
  }

  public deleteStreetviewByService(service: string) {
    return this.http.delete<any>(this.envService.apiUrl + `/streetview/${service}/`).pipe(
      tap(() => {
        this._activeStreetview.next(null);
      }));
  }

  // TODO: Test if working
  public refreshToken(service: string) {
    const oldToken = this.getLocalToken(service).token;
    const envs = this.envService.streetviewEnv[service];

    const params = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', oldToken)
      .set('client_id', envs.clientId);

    this.http.post<any>(envs.tokenUrl, {}, {params})
      .subscribe((resp) => {
        console.log(resp);
        const token = {
          token: resp.access_token,
          expires_in: resp.expires_in
        };

        this.setLocalToken(service, token);

        this.updateStreetviewByService(service, {
          token: token.token,
        }).subscribe((sv: Streetview) => {
          this._activeStreetview.next(sv);
        });
      }, error => {
          this.logout('mapillary');
          this.notificationsService.showErrorToast('Logged out of Mapillary!');
      });
  }

  private tokenRequest(service: string): void {
    const envs = this.envService.streetviewEnv[service];

    const state = JSON.stringify({
      originUrl: this.router.url,
      service,
      projectId: this._projectId,
      username: this._username
    });

    const callback = location.origin + this.envService.baseHref + 'streetview/callback';
    let url = '';

    url = envs.authUrl + '?'
    + '&client_id=' + envs.clientId
    + '&scope=' + envs.scope
    + '&redirect_uri=' + callback
    + '&state=' + state;

    window.location.href = url;
  }

  public setToken(service: string, code: string) {
    const envs = this.envService.streetviewEnv[service];
    const callback = location.origin + this.envService.baseHref + 'streetview/callback';

    const params = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', envs.clientId)
      .set('code', code)
      .set('redirect_uri', callback);

    return this.http.post<any>(envs.tokenUrl, {}, {params})
      .pipe(tap((resp) => {
      }));
  }

  public getLocalToken(service: string): AuthToken {
    const tokenStr = localStorage.getItem(this.TOKEN_STORE[service]);

    if (tokenStr) {
      const token: any = JSON.parse(tokenStr);

      let userToken: AuthToken;

      if (token.expires_in) {
        userToken = AuthToken.fromExpiresIn(token.token, token.expires_in);
      } else {
        userToken = new AuthToken(token.token);
      }

      return userToken;
    }

    return null;
  }

  public setLocalToken(service: string, token: any) {
    localStorage.setItem(this.TOKEN_STORE[service], JSON.stringify(token));
  }

  public set activeStreetview(streetview: any) {
    this._activeStreetview.next(streetview);
  }

  public get activeStreetview() {
    return this.activeStreetview$;
  }

  public get streetviews() {
    return this.streetviews$;
  }
}
