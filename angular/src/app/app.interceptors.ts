import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './services/authentication.service';
import { EnvService } from './services/env.service';
import { StreetviewAuthenticationService } from './services/streetview-authentication.service';
import { v4 as uuidv4 } from 'uuid';
import { LOGIN } from './constants/routes';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private authSvc: AuthService,
    private envService: EnvService,
    private streetviewAuthService: StreetviewAuthenticationService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isTargetUrl =
      request.url.includes(this.envService.tapisUrl) ||
      request.url.includes(this.envService.apiUrl) ||
      request.url.includes(this.envService.designSafePortalUrl);

    let headers: { [key: string]: string } = {};

    if (isTargetUrl) {
      if (this.authSvc.isLoggedInButTokenExpired()) {
        // check for an expired user token and get user to relogin if expired
        this.router.navigateByUrl(LOGIN + '?to=' + encodeURIComponent(this.router.url));
      }

      if (this.authSvc.isLoggedIn()) {
        // add tapis token to Geoapi or Tapis requests
        headers['X-Tapis-Token'] = this.authSvc.userToken.token;
      }
    }

    if (request.url.indexOf(this.envService.apiUrl) > -1) {
      const isPublicView = this.isPublicProjectRequest(request);

      // Add information about what app is making the request
      headers['X-Geoapi-Application'] = 'hazmapper';
      headers['X-Geoapi-Is-Public-View'] = isPublicView ? 'True' : 'False';

      // for guest users, add a unique id
      if (!this.authSvc.isLoggedIn()) {
        // Get (or create if needed) the guestUserID in local storage
        let guestUuid = localStorage.getItem('guestUuid');

        if (!guestUuid) {
          guestUuid = uuidv4();
          localStorage.setItem('guestUuid', guestUuid);
        }

        headers['X-Guest-UUID'] = guestUuid;
      }
    }

    // Apply headers if there are any to set
    if (Object.keys(headers).length > 0) {
      request = request.clone({ setHeaders: headers });
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
   * Determines whether the current view is for a public project.
   * It checks if the browser's URL contains "/project-public/" instead of "/projects/".
   */
  private isPublicProjectRequest(): boolean {
    return window.location.pathname.includes('/project-public/');
  }
}
