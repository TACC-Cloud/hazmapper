import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthToken } from '../models/models';
import { EnvService } from '../services/env.service';
import { Observable, ReplaySubject } from 'rxjs';
import { Router } from '@angular/router';

export class AuthenticatedUser {
  public readonly username: string;
  public readonly email: string;

  constructor(username: string, email: string) {
    this.username = username;
    this.email = email;
  }
}

interface OpenIDUser {
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentUser: ReplaySubject<AuthenticatedUser> = new ReplaySubject<AuthenticatedUser>(1);
  public readonly currentUser: Observable<AuthenticatedUser> = this._currentUser.asObservable();
  userToken: AuthToken;
  private LS_TOKEN_KEY = 'hazmapperToken';
  private LS_USER_KEY = 'hazmapperUser';
  private LS_REDIRECT_KEY = 'hazmapperRedirectUrl';

  constructor(private http: HttpClient, private envService: EnvService, private router: Router) {}

  public login(requestedUrl: string) {
    localStorage.setItem(this.LS_REDIRECT_KEY, requestedUrl);

    // First, check if the user has a token in localStorage
    const tokenStr = localStorage.getItem(this.LS_TOKEN_KEY);
    if (!tokenStr) {
      this.redirectToAuthenticator();
    } else {
      const token = JSON.parse(tokenStr);
      this.userToken = new AuthToken(token.token, new Date(token.expires));
      if (!this.userToken || this.userToken.isExpired()) {
        this.logout();
        this.redirectToAuthenticator();
      }
      this.getUserInfo();
    }
  }

  public redirectToAuthenticator() {
    const client_id = this.envService.clientId;
    const callback = location.origin + this.envService.baseHref + 'callback';
    const state = Math.random().toString(36);
    // tslint:disable-next-line:max-line-length
    const AUTH_URL = `https://agave.designsafe-ci.org/authorize?scope=openid&client_id=${client_id}&response_type=token&redirect_uri=${callback}&state=${state}`;
    window.location.href = AUTH_URL;
  }

  /**
   * Checks to make sure that the user has a token and the token is not expired;
   */
  public isLoggedIn(): boolean {
    const tokenStr = localStorage.getItem(this.LS_TOKEN_KEY);
    if (tokenStr) {
      const token = JSON.parse(tokenStr);
      this.userToken = new AuthToken(token.token, new Date(token.expires));
      return this.userToken && !this.userToken.isExpired();
    }
    return false;
  }

  public logout(): void {
    this.userToken = null;
    localStorage.removeItem(this.LS_TOKEN_KEY);
    localStorage.removeItem(this.LS_USER_KEY);
    this._currentUser.next(null);
  }

  public setToken(token: string, expires: number): void {
    this.userToken = AuthToken.fromExpiresIn(token, expires);
    localStorage.setItem(this.LS_TOKEN_KEY, JSON.stringify(this.userToken));

    this.getUserInfo();

    const redirectedPath = localStorage.getItem(this.LS_REDIRECT_KEY);
    this.router.navigate([redirectedPath]);
  }

  public getUserInfo() {
    // hit the wso2 api to retrieve the username if we don't have it already in local storage
    const INFO_URL = `https://agave.designsafe-ci.org/oauth2/userinfo?schema=openid`;
    const userStr = localStorage.getItem(this.LS_USER_KEY);
    const user = JSON.parse(userStr);
    if (user !== null) {
      this._currentUser.next(new AuthenticatedUser(user.username, user.email));
    } else {
      this.http.get<OpenIDUser>(INFO_URL).subscribe((resp) => {
        const u = new AuthenticatedUser(resp.name, resp.email);
        localStorage.setItem(this.LS_USER_KEY, JSON.stringify(u));
        this._currentUser.next(u);
      });
    }
  }

  checkLoggedIn(): void {
    if (!this.isLoggedIn()) {
      this.logout();
      this.redirectToAuthenticator();
    }
  }
}
