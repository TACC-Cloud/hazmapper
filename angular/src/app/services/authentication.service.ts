import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthToken } from '../models/models';
import { EnvService } from '../services/env.service';
import { Observable, ReplaySubject } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export class AuthenticatedUser {
  public readonly username: string;

  constructor(username: string) {
    this.username = username;
  }
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

  public getRedirectKeyword() {
    return `${this.envService.env}HazmapperRedirect`;
  }

  public login(requestedUrl: string) {
    this.logout()
    localStorage.setItem(this.getRedirectKeyword(), requestedUrl);
    this.redirectToAuthenticator(requestedUrl);
  }

  public redirectToAuthenticator(requestedUrl: string) {
    const GEOAPI_AUTH_URL = `${this.envService.apiUrl}/auth/login?to=${requestedUrl}`;
    window.location.href = GEOAPI_AUTH_URL;
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

    /**
   * Checks to see if there is a logged in user but token is expired;
   */
    public isLoggedInButTokenExpired(): boolean {
      const tokenStr = localStorage.getItem(this.getTokenKeyword());
      if (tokenStr) {
        const token = JSON.parse(tokenStr);
        this.userToken = new AuthToken(token.token, new Date(token.expires));
        return this.userToken && this.userToken.isExpired();
      }
      return false;
    }

  public logout(): void {
    this.userToken = null;
    localStorage.removeItem(this.getTokenKeyword());
    this._currentUser.next(null);
  }

  public setToken(token: string, expires: number): void {
    this.userToken = AuthToken.fromExpiresIn(token, expires);
    localStorage.setItem(this.getTokenKeyword(), JSON.stringify(this.userToken));

    this.getUserInfoFromToken();

    const redirectedPath = localStorage.getItem(this.getRedirectKeyword());
    this.router.navigate([redirectedPath]);
  }

  public getUserInfoFromToken() {
    // tapis/username
    const decodedJwt = jwtDecode(this.userToken.token);
    const u = new AuthenticatedUser(decodedJwt['tapis/username']);
    this._currentUser.next(u);
  }
}
