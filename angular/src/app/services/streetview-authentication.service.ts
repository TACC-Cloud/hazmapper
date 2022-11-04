import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthToken } from '../models/models';
import { Router } from '@angular/router';
import { AuthService } from './authentication.service';
import { EnvService } from '../services/env.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { tap } from 'rxjs/operators';
import { StreetviewRequest, Streetview } from '../models/streetview';

@Injectable({
  providedIn: 'root',
})
export class StreetviewAuthenticationService {
  private _activeStreetview: BehaviorSubject<Streetview> = new BehaviorSubject(
    null
  );
  public activeStreetview$: Observable<Streetview> =
    this._activeStreetview.asObservable();
  private _streetviews: BehaviorSubject<Array<Streetview>> =
    new BehaviorSubject([]);
  public streetviews$: Observable<Array<Streetview>> =
    this._streetviews.asObservable();

  private TOKEN_STORE = {
    google: 'googleToken',
    mapillary: 'mapillaryToken',
  };
  private _username: string;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationsService: NotificationsService,
    private envService: EnvService,
    private router: Router
  ) {
    this.authService.currentUser.subscribe(
      (u) => (this._username = u ? u.username : null)
    );
  }

  public isLoggedIn(service: string, isPublicView: boolean = false): boolean {
    const userToken: AuthToken = this.getLocalToken(service);

    if (!isPublicView && !this._activeStreetview.getValue()) {
      return false;
    }

    return userToken && !userToken.isExpired();
  }

  public login(service: string, projectId: number, isPublicView: boolean) {
    this.tokenRequest(service, projectId, isPublicView);
  }

  public logout(service: string): void {
    localStorage.removeItem(this.TOKEN_STORE[service]);
  }

  public sequenceInStreetview(sequenceId: string): boolean {
    return this._activeStreetview.getValue().instances.some((instance) =>
      instance.sequences.some((sequence) => {
        return sequence.sequence_id === sequenceId;
      })
    );
  }

  public getStreetviews(): Observable<Array<Streetview>> {
    return this.http
      .get<Array<Streetview>>(this.envService.apiUrl + `/streetview/services/`)
      .pipe(
        tap((streetviews: Array<Streetview>) => {
          this._streetviews.next(streetviews);
          // NOTE: With just mapillary, assume single active streetview
          this._activeStreetview.next(streetviews[0]);
        })
      );
  }

  public createStreetview(data: StreetviewRequest) {
    return this.http
      .post<any>(this.envService.apiUrl + '/streetview/services/', data)
      .pipe(
        tap(() => {
          this.getStreetviews().subscribe();
        })
      );
  }

  public updateStreetview(streetviewId: number, data: StreetviewRequest) {
    return this.http
      .put<any>(this.envService.apiUrl + `/streetview/services/${streetviewId}/`, data)
      .subscribe(() => {
        this.getStreetviews().subscribe();
      });
  }

  public deleteStreetview(streetviewId: number) {
    return this.http
      .delete<any>(this.envService.apiUrl + `/streetview/services/${streetviewId}/`)
      .subscribe(() => {
        this.getStreetviews().subscribe();
      });
  }

  public updateStreetviewByService(service: string, data: StreetviewRequest) {
    this.http
      .put<any>(this.envService.apiUrl + `/streetview/services/${service}/`, data)
      .subscribe(() => {
        this.getStreetviews().subscribe();
      });
  }

  public deleteStreetviewByService(service: string) {
    return this.http
      .delete<any>(this.envService.apiUrl + `/streetview/services/${service}/`)
      .subscribe(() => {
        this.getStreetviews().subscribe();
      });
  }

  // TODO: Test if working
  public refreshToken(service: string) {
    const oldToken = this.getLocalToken(service).token;

    const envs = this.envService.streetviewEnv[service];
    const secretEnvs = this.envService.streetviewEnv.secrets[service];

    const params = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', oldToken)
      .set('client_id', secretEnvs.clientId);

    this.http.post<any>(envs.tokenUrl, {}, { params }).subscribe(
      (resp) => {
        const token = {
          token: resp.access_token,
          expires_in: resp.expires_in,
        };

        this.setLocalToken(service, token);

        this.updateStreetviewByService(service, {
          token: token.token,
        });
      },
      (error) => {
        this.logout('mapillary');
        this.notificationsService.showErrorToast('Logged out of Mapillary!');
      }
    );
  }

  private tokenRequest(service: string, projectId: number, isPublicView: boolean): void {
    const envs = this.envService.streetviewEnv[service];
    const secretEnvs = this.envService.streetviewEnv.secrets[service];

    const state = JSON.stringify({
      originUrl: this.router.url,
      service,
      projectId,
      username: this._username,
      isPublicView
    });

    const callback =
      location.origin + this.envService.baseHref + 'streetview/callback';
    let url = '';

    url =
      envs.authUrl +
      '?' +
      '&client_id=' +
      secretEnvs.clientId +
      '&scope=' +
      envs.scope +
      '&redirect_uri=' +
      callback +
      '&state=' +
      state;

    window.location.href = url;
  }

  public setToken(service: string, code: string) {
    const envs = this.envService.streetviewEnv[service];
    const secretEnvs = this.envService.streetviewEnv.secrets[service];

    const callback =
      location.origin + this.envService.baseHref + 'streetview/callback';

    const params = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', secretEnvs.clientId)
      .set('code', code)
      .set('redirect_uri', callback);

    return this.http
      .post<any>(envs.tokenUrl, {}, { params })
      .pipe(tap((resp) => {}));
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
