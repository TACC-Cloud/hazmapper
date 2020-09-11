import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import { AuthService} from './services/authentication.service';
import { environment } from '../environments/environment';
import {catchError} from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authSvc: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (request.url.indexOf('https://agave.designsafe-ci.org') > -1) {
      if (this.authSvc.isLoggedIn()) {
        request = request.clone({
          setHeaders: {
            Authorization: 'Bearer ' + this.authSvc.userToken.token
          }
        });
      }
    }

    // This is only for local development, we put the JWT on the request
    // because it is not behind ws02
    if (request.url.indexOf(environment.apiUrl) > -1)  {

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

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if (err.status === 401) {
        // auto logout if 401 response returned from api
        this.authService.logout();
        location.reload(true);
      }
      throw err;
    }));
  }
}
