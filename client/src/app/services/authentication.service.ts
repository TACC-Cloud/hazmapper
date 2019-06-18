import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
@Injectable()
export class AuthService {

  constructor(private http: HttpClient) {
  }

  public isLoggedIn(): boolean {
    return true;
  }

  public logout(): void {
  }


}
