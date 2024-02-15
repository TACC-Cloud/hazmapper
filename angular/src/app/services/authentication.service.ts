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

  constructor(private http: HttpClient, private envService: EnvService, private router: Router) {}

  public getTokenKeyword() {
    return `${this.envService.env}HazmapperToken`;
  }

  public getUserKeyword() {
    return `${this.envService.env}HazmapperUser`;
  }

  public getRedirectKeyword() {
    return `${this.envService.env}HazmapperRedirect`;
  }

  public login(requestedUrl: string) {
    localStorage.setItem(this.getRedirectKeyword(), requestedUrl);

    // First, check if the user has a token in localStorage
    const tokenStr = localStorage.getItem(this.getTokenKeyword());
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
    const AUTH_URL_V3 = `https://designsafe.develop.tapis.io/v3/oauth2/authorize?client_id=${client_id}&response_type=token&redirect_uri=${callback}`

    window.location.href = AUTH_URL_V3;
  }

  /**
   * Checks to make sure that the user has a token and the token is not expired;
   */
  public isLoggedIn(): boolean {
    const tokenStr = localStorage.getItem(this.getTokenKeyword());
    if (tokenStr) {
      const token = JSON.parse(tokenStr);
      this.userToken = new AuthToken(token.token, new Date(token.expires));
      return this.userToken && !this.userToken.isExpired();
    }
    return false;
  }

  public logout(): void {
    this.userToken = null;
    localStorage.removeItem(this.getTokenKeyword());
    localStorage.removeItem(this.getUserKeyword());
    this._currentUser.next(null);
  }

  public setToken(token: string, expires: number): void {
    this.userToken = AuthToken.fromExpiresIn(token, expires);
    localStorage.setItem(this.getTokenKeyword(), JSON.stringify(this.userToken));

    this.getUserInfo();

    const redirectedPath = localStorage.getItem(this.getRedirectKeyword());
    this.router.navigate([redirectedPath]);
  }

  public getUserInfo() {
    // hit the wso2 api to retrieve the username if we don't have it already in local storage
    const INFO_URL = `https://agave.designsafe-ci.org/oauth2/userinfo?schema=openid`;
    const userStr = localStorage.getItem(this.getUserKeyword());
    const user = JSON.parse(userStr);
    if (user !== null) {
      this._currentUser.next(new AuthenticatedUser(user.username, user.email));
    } else {
      this.http.get<OpenIDUser>(INFO_URL).subscribe((resp) => {
        const u = new AuthenticatedUser(resp.name, resp.email);
        localStorage.setItem(this.getUserKeyword(), JSON.stringify(u));
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
