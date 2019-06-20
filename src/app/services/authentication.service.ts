import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { AuthToken } from "../models/models";

interface JWTResponse {
  access_token : string;
  expires_in : number;
  refresh_token : string;
  scope : string;
  token_type : string;
}


@Injectable()
export class AuthService {

  userToken : AuthToken;
  private LS_TOKEN_KEY = 'hazmapperToken';

  constructor(private http: HttpClient) {

  };

  public login() {
    // First, check if the user has a token in localStorage
    try {
      let tokenStr = localStorage.get(this.LS_TOKEN_KEY);
      let token = JSON.parse(tokenStr);
      // this.userToken = AuthToken.fromJSON()
    } catch (e) {
      //
    }

    let client_id = "O05FK1aGSCgi2CqKt1hWWh6zsywa";
    let callback  = location.origin + '/callback';
    let state = Math.random().toString(36);
    let AUTH_URL = `https://agave.designsafe-ci.org/authorize?client_id=${client_id}&response_type=token&redirect_uri=${callback}&state=${state}`;
    // console.log(AUTH_URL);
    // this.http.get(AUTH_URL).subscribe((resp)=>{
    //   console.log(resp);
    // })
    window.location.href = AUTH_URL;
    // this.http.get("/login").subscribe((resp : JWTResponse )=>{
    //   console.log(resp);
    //   this.userToken = new AuthToken(resp.access_token, resp.expires_in);
    // })
  }

  /**
   * Checks to make sure that the user has a token and the token is not expired;
   */
  public isLoggedIn(): boolean {
    return this.userToken && !this.userToken.isExpired();
  }

  public logout(): void {
    this.userToken = null;
  }

  public setToken(token: string, expires: number): void {
    this.userToken = new AuthToken(token, expires);
    localStorage.setItem(this.LS_TOKEN_KEY, JSON.stringify(this.userToken));
  }



}
