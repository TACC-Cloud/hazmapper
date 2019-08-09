import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { AuthToken } from "../models/models";
import {environment} from "../../environments/environment";

@Injectable()
export class AuthService {

  userToken : AuthToken;
  private LS_TOKEN_KEY = 'hazmapperToken';

  constructor(private http: HttpClient) {

  };

  public login() {
    // First, check if the user has a token in localStorage
    try {
      let tokenStr = localStorage.getItem(this.LS_TOKEN_KEY);
      let token = JSON.parse(tokenStr);
      this.userToken = new AuthToken(token.token, new Date(token.expires))

    } catch (e) {
      //
    }
    if (!this.userToken || this.userToken.isExpired()) {

      let client_id = environment.clientId;
      let callback  = location.origin + '/callback';
      let state = Math.random().toString(36);
      let AUTH_URL = `https://agave.designsafe-ci.org/authorize?client_id=${client_id}&response_type=token&redirect_uri=${callback}&state=${state}`;

      window.location.href = AUTH_URL;
    }
  }

  /**
   * Checks to make sure that the user has a token and the token is not expired;
   */
  public isLoggedIn(): boolean {
    console.log(this.userToken);
    return this.userToken && !this.userToken.isExpired()
  }

  public logout(): void {
    this.userToken = null;
    localStorage.removeItem(this.LS_TOKEN_KEY);
  }

  public setToken(token: string, expires: number): void {
    console.log(token, expires);
    this.userToken = AuthToken.fromExpiresIn(token, expires);
    console.log(JSON.stringify(this.userToken));
    localStorage.setItem(this.LS_TOKEN_KEY, JSON.stringify(this.userToken));
  }



}
