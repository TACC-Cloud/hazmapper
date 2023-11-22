import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './services/authentication.service';
import { EnvService } from './services/env.service';
import { catchError } from 'rxjs/operators';
import { StreetviewAuthenticationService } from './services/streetview-authentication.service';
import { NotificationsService } from './services/notifications.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(
    private authSvc: AuthService,
    private envService: EnvService,
    private streetviewAuthService: StreetviewAuthenticationService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.indexOf('https://agave.designsafe-ci.org') > -1) {
      if (this.authSvc.isLoggedIn()) {
        request = request.clone({
          setHeaders: {
            Authorization: 'Bearer ' + this.authSvc.userToken.token,
          },
        });
      }
    }

    // we put the JWT on the request to our geoapi API because it is not behind ws02 if in local dev
    // and if user is logged in
    if (this.envService.jwt && request.url.indexOf(this.envService.apiUrl) > -1 && this.authSvc.isLoggedIn()) {
      // add header
      request = request.clone({
        setHeaders: {
          'X-JWT-Assertion-designsafe': this.envService.jwt,
        },
      });
    }

    // for guest users, add a custom header with a unique id
    if (!this.authSvc.isLoggedIn()) {
      // Get (or create of needed) the guestUserID in local storage
      let guestUuid = localStorage.getItem('guestUuid');

      if (!guestUuid) {
        guestUuid = uuidv4();
        localStorage.setItem('guestUuid', guestUuid);
      }
      request = request.clone({
        setHeaders: {
          'X-Guest-UUID': guestUuid,
        },
      });
    }

    if(request.url.indexOf(this.envService.apiUrl) > -1) {
      // Add information about what app is making the request
      request = request.clone({
        setHeaders: {
          'X-Geoapi-Application': 'hazmapper',
        },
      });
    }


    if (
      request.url.indexOf(this.envService.streetviewEnv.mapillary.apiUrl) > -1 &&
      !(request.url.indexOf(this.envService.streetviewEnv.mapillary.tokenUrl) > -1)
    ) {
      if (this.streetviewAuthService.isLoggedIn('mapillary')) {
        const authToken = this.streetviewAuthService.getLocalToken('mapillary');
        request = request.clone({
          setHeaders: {
            'Content-Type': 'application/json',
            Authorization: 'OAuth ' + authToken.token,
          },
        });
      }
    }

    if (request.url.indexOf(this.envService.streetviewEnv.mapillary.tokenUrl) > -1) {
      request = request.clone({
        setHeaders: {
          'Content-Type': 'application/json',
          Authorization: 'OAuth ' + this.envService.streetviewEnv.secrets.mapillary.clientSecret,
        },
      });
    }

    return next.handle(request);
  }
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private envService: EnvService,
    private streetviewAuthService: StreetviewAuthenticationService,
    private notificationService: NotificationsService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if (err.status === 401) {
          // auto logout if 401 response returned from api
          // https://jira.tacc.utexas.edu/browse/DES-1999
          this.authService.logout();
          location.reload();
        }
        throw err;
      })
    );
  }
}
