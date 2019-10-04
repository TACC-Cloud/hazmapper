import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthToken } from '../models/models';
import {environment} from '../../environments/environment';
import {Observable, ReplaySubject} from 'rxjs';

export class AuthenticatedUser {
  public readonly username: string;
  public readonly email: string;
  private _token: AuthToken;

  constructor(username: string, email: string) {
    this.username = username;
    this.email = email;
  }

}

interface OpenIDUser {
  name: string;
  email: string;
}


@Injectable({providedIn: 'root'})
export class AuthService {

  private _currentUser: ReplaySubject<AuthenticatedUser> = new ReplaySubject<AuthenticatedUser>(1);
  public readonly currentUser: Observable<AuthenticatedUser> = this._currentUser.asObservable();
  userToken: AuthToken;
  private LS_TOKEN_KEY = 'hazmapperToken';
  private LS_USER_KEY = 'hazmapperUser';

  constructor(private http: HttpClient) {}

  public login() {
    // First, check if the user has a token in localStorage
    try {
      const tokenStr = localStorage.getItem(this.LS_TOKEN_KEY);
      const token = JSON.parse(tokenStr);
      this.userToken = new AuthToken(token.token, new Date(token.expires));
      const userStr = localStorage.getItem(this.LS_USER_KEY);
      const user = JSON.parse(userStr);
      this._currentUser.next(
        new AuthenticatedUser(user.username, user.email)
      );
    } catch (e) {
      //
    }
    if (!this.userToken || this.userToken.isExpired()) {
      this.logout();
      const client_id = environment.clientId;
      const callback  = location.origin + environment.baseHref + 'callback';
      const state = Math.random().toString(36);
      const AUTH_URL = `https://agave.designsafe-ci.org/authorize?scope=openid&client_id=${client_id}&response_type=token&redirect_uri=${callback}&state=${state}`;
      window.location.href = AUTH_URL;
    }
  }

  /**
   * Checks to make sure that the user has a token and the token is not expired;
   */
  public isLoggedIn(): boolean {
    return this.userToken && !this.userToken.isExpired();
  }

  public logout(): void {
    this.userToken = null;
    localStorage.removeItem(this.LS_TOKEN_KEY);
    localStorage.removeItem(this.LS_USER_KEY);
  }

  public setToken(token: string, expires: number): void {
    this.userToken = AuthToken.fromExpiresIn(token, expires);
    localStorage.setItem(this.LS_TOKEN_KEY, JSON.stringify(this.userToken));
  }

  public getUserInfo() {
    const INFO_URL = `https://agave.designsafe-ci.org/oauth2/userinfo?schema=openid`;
    return this.http.get<OpenIDUser>(INFO_URL).subscribe(resp => {
      const user = new AuthenticatedUser(resp.name, resp.email);
      localStorage.setItem(this.LS_USER_KEY, JSON.stringify(user));
      this._currentUser.next(user);
    });
  }

}
