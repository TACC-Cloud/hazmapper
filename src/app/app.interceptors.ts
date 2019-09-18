import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService} from "./services/authentication.service";
import { environment } from "../environments/environment";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authSvc: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (request.url.indexOf('https://agave.designsafe-ci.org')>-1) {
      if (this.authSvc.isLoggedIn()) {
        request = request.clone({
          setHeaders: {
            'Authorization': 'Bearer ' + this.authSvc.userToken.token
          }
        });
      }
    }

    if (request.url.indexOf(environment.apiUrl)> -1)  {

      if (environment.jwt) {
        // add header
        request = request.clone({
          setHeaders: {
            'X-JWT-Assertion-designsafe': environment.jwt
          }
        });
      }
    }
    return next.handle(request);
  }
}

// TODO: Add 403 interceptor
