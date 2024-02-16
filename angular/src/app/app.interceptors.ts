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
    // TODO_TAPISV3 put the tapis url in envService
    const isTargetUrl = request.url.includes('https://designsafe.tapis.io') || request.url.includes(this.envService.apiUrl);
    if (isTargetUrl && this.authSvc.isLoggedIn()) {
      // add tapis token to Geoapi or Tapis requests
      request = request.clone({
        setHeaders: {
          'X-Tapis-Token': this.authSvc.userToken.token,
        },
      });
    }

    if (request.url.indexOf(this.envService.apiUrl) > -1) {
      // Add information about what app is making the request

      // Using query params instead of custom headers due to https://tacc-main.atlassian.net/browse/WG-191
      let analytics_params = {};

      analytics_params = { ...analytics_params, application: 'hazmapper' };

      // for guest users, add a unique id
      if (!this.authSvc.isLoggedIn()) {
        // Get (or create if needed) the guestUserID in local storage
        let guestUuid = localStorage.getItem('guestUuid');

        if (!guestUuid) {
          guestUuid = uuidv4();
          localStorage.setItem('guestUuid', guestUuid);
        }

        analytics_params = { ...analytics_params, guest_uuid: guestUuid };
      }
      /* Send analytics-related params to projects endpoint only (until we use headers
        again in https://tacc-main.atlassian.net/browse/WG-192) */
      if (this.isProjectFeaturesRequest(request)) {
        // Clone the request and add query parameters
        request = request.clone({
          setParams: { ...request.params, ...analytics_params },
        });
      }
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

  /**
   * Determines whether a given HTTP request targets the features endpoint of a project or public project.
   *
   * This endpoint is being logged with extra information for analytics purposes.
   */
  private isProjectFeaturesRequest(request: HttpRequest<any>): boolean {
    // Regular expression to match /projects/{projectId}/features or /public-projects/{projectId}/features
    const urlPattern = /\/(projects|public-projects)\/\d+\/features\/?(?:\?.*)?/;
    return request.method === 'GET' && urlPattern.test(request.url);
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
          //TODO_TAPIV3 renable these
          //this.authService.logout();
          //location.reload();
        }
        throw err;
      })
    );
  }
}
